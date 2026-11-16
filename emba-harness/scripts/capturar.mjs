#!/usr/bin/env node
// Capturas de pantalla a archivo PNG (0.4.2, F-C08: ni el navegador de la app ni Playwright guardaban PNG).
// Abre Chrome o Edge sin ventana, le habla por el protocolo DevTools (CDP) con el WebSocket de Node y guarda una
// captura por pantalla, ancho y esquema de color. Solo abre direcciones de la propia máquina (localhost, 127.x,
// [::1]) o archivos locales: nada sale de la máquina (E6).
//
// Uso:  node capturar.mjs <capturas.json>
// capturas.json:
// {
//   "salida": "docs/capturas/C-08",            // carpeta, relativa a donde está el JSON
//   "base": "http://localhost:5173",           // se antepone a cada ruta
//   "anchos": [1280, 400],                      // opcional, por defecto [1280, 400]
//   "alto": 900,                                // opcional
//   "esquemas": ["light", "dark"],              // opcional, por defecto ["light"]
//   "cookies": [{ "name": "sesion", "value": "sintetica" }],   // opcional, solo datos sintéticos
//   "esperar": 800,                             // ms después de cargar, opcional
//   "paginaCompleta": true,                     // opcional: toda la página, no solo la ventana
//   "pantallas": [{ "nombre": "lista", "ruta": "/evaluaciones", "esperar": 1500 }]
// }
// Deja <salida>/<nombre>-<ancho>-<esquema>.png. Navegador: CHROME_PATH, o Chrome / Edge en su lugar habitual.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { esLoopback } from "../hooks/lib/reglas-v3.mjs";

const NAVEGADORES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/microsoft-edge",
].filter(Boolean);

export const buscarNavegador = (candidatos = NAVEGADORES) => candidatos.find((r) => existsSync(r)) ?? null;

const esDireccionLocal = (url) => url.startsWith("file:") || esLoopback(url);

// Valida el plan y lo expande en una lista de capturas. Lanza un error con un mensaje claro si algo no sirve.
export function planDeCapturas(config, carpetaDelJson = ".") {
  if (!config || !Array.isArray(config.pantallas) || !config.pantallas.length) throw new Error("capturas.json necesita «pantallas» con al menos una");
  if (!config.salida) throw new Error("capturas.json necesita «salida»");
  const anchos = config.anchos ?? [1280, 400];
  const esquemas = config.esquemas ?? ["light"];
  for (const e of esquemas) if (!["light", "dark"].includes(e)) throw new Error(`esquema «${e}»: usá light o dark`);
  const salida = resolve(carpetaDelJson, config.salida);
  const lista = [];
  for (const p of config.pantallas) {
    if (!p.nombre || !/^[\w.-]+$/.test(p.nombre)) throw new Error(`pantalla sin «nombre» válido (letras, números, . _ -): ${JSON.stringify(p)}`);
    const url = /^[a-z]+:/i.test(p.ruta ?? "") ? p.ruta : `${(config.base ?? "").replace(/\/$/, "")}${p.ruta ?? ""}`;
    if (!esDireccionLocal(url)) throw new Error(`${p.nombre}: ${url} no es de esta máquina; solo localhost, 127.x, [::1] o file: (E6)`);
    for (const ancho of anchos)
      for (const esquema of esquemas)
        lista.push({ nombre: p.nombre, url, ancho, alto: config.alto ?? 900, esquema, esperar: p.esperar ?? config.esperar ?? 800, archivo: join(salida, `${p.nombre}-${ancho}-${esquema}.png`) });
  }
  return { salida, cookies: config.cookies ?? [], paginaCompleta: config.paginaCompleta ?? false, lista };
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function abrirNavegador(ruta) {
  const perfil = mkdtempSync(join(tmpdir(), "emba-capturas-"));
  const proceso = spawn(ruta, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${perfil}`, "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
  const archivoPuerto = join(perfil, "DevToolsActivePort");
  for (let i = 0; i < 100 && !existsSync(archivoPuerto); i++) await dormir(100);
  if (!existsSync(archivoPuerto)) {
    proceso.kill();
    throw new Error("el navegador no abrió el puerto de DevTools");
  }
  const [puerto, ruta2] = readFileSync(archivoPuerto, "utf8").trim().split(/\r?\n/);
  return { proceso, perfil, ws: `ws://127.0.0.1:${puerto}${ruta2}` };
}

function conectar(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pendientes = new Map();
  const oyentes = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pendientes.has(m.id)) {
      const { ok, mal } = pendientes.get(m.id);
      pendientes.delete(m.id);
      m.error ? mal(new Error(`${m.error.message}`)) : ok(m.result);
    } else if (m.method) oyentes.forEach((f) => f(m));
  };
  const enviar = (method, params = {}, sessionId) =>
    new Promise((ok, mal) => {
      const n = ++id;
      pendientes.set(n, { ok, mal });
      ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  const esperarEvento = (method, sessionId, ms = 15000) =>
    new Promise((ok) => {
      const f = (m) => {
        if (m.method === method && m.sessionId === sessionId) ok(m.params);
      };
      oyentes.push(f);
      setTimeout(() => ok(null), ms);
    });
  return new Promise((ok, mal) => {
    ws.onopen = () => ok({ enviar, esperarEvento, cerrar: () => ws.close() });
    ws.onerror = () => mal(new Error("no se pudo conectar con el navegador"));
  });
}

export async function capturar(plan, { navegador = buscarNavegador() } = {}) {
  if (!navegador) throw new Error("no encontré Chrome ni Edge; indicá la ruta en CHROME_PATH");
  mkdirSync(plan.salida, { recursive: true });
  const nav = await abrirNavegador(navegador);
  const hechas = [];
  try {
    const cdp = await conectar(nav.ws);
    for (const c of plan.lista) {
      const { targetId } = await cdp.enviar("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await cdp.enviar("Target.attachToTarget", { targetId, flatten: true });
      await cdp.enviar("Page.enable", {}, sessionId);
      await cdp.enviar("Emulation.setDeviceMetricsOverride", { width: c.ancho, height: c.alto, deviceScaleFactor: 1, mobile: c.ancho < 600 }, sessionId);
      await cdp.enviar("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: c.esquema }] }, sessionId);
      for (const k of plan.cookies) await cdp.enviar("Network.setCookie", { ...k, url: c.url }, sessionId);
      const cargada = cdp.esperarEvento("Page.loadEventFired", sessionId);
      await cdp.enviar("Page.navigate", { url: c.url }, sessionId);
      await cargada;
      await dormir(c.esperar);
      const { data } = await cdp.enviar("Page.captureScreenshot", { format: "png", captureBeyondViewport: plan.paginaCompleta }, sessionId);
      writeFileSync(c.archivo, Buffer.from(data, "base64"));
      hechas.push(c.archivo);
      await cdp.enviar("Target.closeTarget", { targetId });
    }
    cdp.cerrar();
  } finally {
    nav.proceso.kill();
    await dormir(300);
    try {
      rmSync(nav.perfil, { recursive: true, force: true });
    } catch {
      // el perfil temporal se borra en la próxima limpieza del sistema
    }
  }
  return hechas;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const archivo = process.argv[2];
  if (!archivo) {
    console.error("Uso: node capturar.mjs <capturas.json>");
    process.exit(2);
  }
  try {
    const plan = planDeCapturas(JSON.parse(readFileSync(archivo, "utf8")), dirname(resolve(archivo)));
    const hechas = await capturar(plan);
    for (const h of hechas) console.log(`  ✔ ${h}`);
    console.log(`${hechas.length} capturas en ${plan.salida}`);
  } catch (e) {
    console.error(`✖ ${e.message}`);
    process.exit(1);
  }
}
