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
//
// 0.4.3 · apps sin rutas (F-C08v2: ai-desempeno cambia de pantalla por estado). Cada pantalla puede llevar «pasos»,
// que se hacen después de cargar y antes de la captura:
//   { "clic": "Ingresar" }                     clic en el botón, enlace o control cuyo texto CONTIENE eso
//   { "clic": { "selector": "#guardar" } }     clic por selector CSS
//   { "escribir": { "selector": "#correo", "texto": "rrhh@emba.example" } }
//   { "esperarTexto": "Evaluaciones" }         espera (hasta 10 s) a que el texto aparezca en la página
//   { "esperar": 500 }                         ms
// Si un paso no encuentra su elemento, la captura FALLA con el motivo: nunca se informa en verde una captura de la
// pantalla equivocada (D-C08v2-03).
//
// 0.4.3 · reflujo. Cada captura mide si la página desborda a lo ancho (scroll horizontal o elementos que se salen de
// la ventana) y lo deja en <salida>/reflujo.json. Con --estricto, un desborde hace fallar el script.
// En la corrida 2 de C-08 esta medición encontró un desborde real en Responder.
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
    if (!p.nombre || !/^[\w.-]+$/.test(p.nombre) || p.nombre.startsWith(".")) throw new Error(`pantalla sin «nombre» válido (letras, números, . _ -): ${JSON.stringify(p)}`);
    validarPasos(p);
    const url = /^[a-z]+:/i.test(p.ruta ?? "") ? p.ruta : `${(config.base ?? "").replace(/\/$/, "")}${p.ruta ?? ""}`;
    if (!esDireccionLocal(url)) throw new Error(`${p.nombre}: ${url} no es de esta máquina; solo localhost, 127.x, [::1] o file: (E6)`);
    for (const ancho of anchos)
      for (const esquema of esquemas)
        lista.push({ nombre: p.nombre, url, ancho, alto: config.alto ?? 900, esquema, esperar: p.esperar ?? config.esperar ?? 800, pasos: p.pasos ?? [], archivo: join(salida, `${p.nombre}-${ancho}-${esquema}.png`) });
  }
  return { salida, cookies: config.cookies ?? [], paginaCompleta: config.paginaCompleta ?? false, lista };
}

const TIPOS_DE_PASO = ["clic", "escribir", "esperarTexto", "esperar"];
function validarPasos(p) {
  if (p.pasos === undefined) return;
  if (!Array.isArray(p.pasos)) throw new Error(`${p.nombre}: «pasos» tiene que ser una lista`);
  p.pasos.forEach((paso, i) => {
    const tipos = Object.keys(paso ?? {}).filter((k) => TIPOS_DE_PASO.includes(k));
    if (tipos.length !== 1) throw new Error(`${p.nombre}, paso ${i + 1}: usá uno de ${TIPOS_DE_PASO.join(", ")}`);
    const v = paso[tipos[0]];
    const ok =
      (tipos[0] === "clic" && (typeof v === "string" ? v.trim() : typeof v?.selector === "string")) ||
      (tipos[0] === "escribir" && typeof v?.selector === "string" && typeof v?.texto === "string") ||
      (tipos[0] === "esperarTexto" && typeof v === "string" && v.trim()) ||
      (tipos[0] === "esperar" && Number.isFinite(v) && v >= 0);
    if (!ok) throw new Error(`${p.nombre}, paso ${i + 1}: «${tipos[0]}» mal formado: ${JSON.stringify(paso)}`);
  });
}

// Código que corre dentro de la página para cada paso. Devuelve { ok, motivo }.
const EN_PAGINA = String.raw`
(async (paso) => {
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
  const texto = (el) => (el.innerText || el.value || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
  if (paso.clic !== undefined) {
    let el = null;
    if (typeof paso.clic === "string") {
      const buscado = paso.clic.replace(/\s+/g, " ").trim().toLowerCase();
      const candidatos = [...document.querySelectorAll("button, a, [role=button], [role=tab], [role=menuitem], [role=link], input[type=submit], input[type=button], label, summary")].filter(visible);
      el = candidatos.find((c) => texto(c).toLowerCase() === buscado) ?? candidatos.find((c) => texto(c).toLowerCase().includes(buscado));
      if (!el) return { ok: false, motivo: "no hay un control visible con el texto «" + paso.clic + "»; hay: " + candidatos.slice(0, 12).map((c) => "«" + texto(c).slice(0, 40) + "»").join(", ") };
    } else {
      el = document.querySelector(paso.clic.selector);
      if (!el || !visible(el)) return { ok: false, motivo: "no hay un elemento visible para el selector " + paso.clic.selector };
    }
    el.click();
    return { ok: true };
  }
  if (paso.escribir !== undefined) {
    const el = document.querySelector(paso.escribir.selector);
    if (!el) return { ok: false, motivo: "no hay un campo para el selector " + paso.escribir.selector };
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, paso.escribir.texto);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return { ok: true };
  }
  if (paso.esperarTexto !== undefined) {
    for (let i = 0; i < 100; i++) {
      if (document.body && document.body.innerText.includes(paso.esperarTexto)) return { ok: true };
      await new Promise((r) => setTimeout(r, 100));
    }
    return { ok: false, motivo: "el texto «" + paso.esperarTexto + "» no apareció en 10 s" };
  }
  if (paso.esperar !== undefined) { await new Promise((r) => setTimeout(r, paso.esperar)); return { ok: true }; }
  return { ok: false, motivo: "paso desconocido" };
})`;

// Desborde horizontal: ancho del documento contra la ventana, y hasta 8 elementos que se salen por la derecha.
const MEDIR_REFLUJO = String.raw`
(() => {
  const vista = document.documentElement.clientWidth;
  const doc = Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0);
  const describir = (el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "");
  const fuera = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > vista + 1) {
      if (fuera.some((f) => f.el.contains(el))) continue;
      fuera.push({ el, sobra: Math.round(r.right - vista) });
      if (fuera.length >= 8) break;
    }
  }
  return { anchoVista: vista, anchoDocumento: doc, desborde: Math.max(0, doc - vista), elementos: fuera.map((f) => ({ elemento: describir(f.el), sobra: f.sobra })) };
})()`;

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
  const reflujo = [];
  try {
    const cdp = await conectar(nav.ws);
    for (const c of plan.lista) {
      const { targetId } = await cdp.enviar("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await cdp.enviar("Target.attachToTarget", { targetId, flatten: true });
      await cdp.enviar("Page.enable", {}, sessionId);
      await cdp.enviar("Emulation.setDeviceMetricsOverride", { width: c.ancho, height: c.alto, deviceScaleFactor: 1, mobile: false }, sessionId);
      await cdp.enviar("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: c.esquema }] }, sessionId);
      for (const k of plan.cookies) await cdp.enviar("Network.setCookie", { ...k, url: c.url }, sessionId);
      const cargada = cdp.esperarEvento("Page.loadEventFired", sessionId);
      await cdp.enviar("Page.navigate", { url: c.url }, sessionId);
      await cargada;
      await dormir(c.esperar);
      for (const [i, paso] of c.pasos.entries()) {
        const r = await cdp.enviar("Runtime.evaluate", { expression: `${EN_PAGINA}(${JSON.stringify(paso)})`, awaitPromise: true, returnByValue: true }, sessionId);
        const res = r.result?.value;
        if (!res?.ok) throw new Error(`${c.nombre} (${c.ancho} px, ${c.esquema}), paso ${i + 1}: ${res?.motivo ?? r.exceptionDetails?.text ?? "falló"}`);
        await dormir(250);
      }
      const { data } = await cdp.enviar("Page.captureScreenshot", { format: "png", captureBeyondViewport: plan.paginaCompleta }, sessionId);
      writeFileSync(c.archivo, Buffer.from(data, "base64"));
      const medida = await cdp.enviar("Runtime.evaluate", { expression: MEDIR_REFLUJO, returnByValue: true }, sessionId);
      reflujo.push({ captura: c.archivo, pantalla: c.nombre, ancho: c.ancho, esquema: c.esquema, ...(medida.result?.value ?? { error: "no se pudo medir" }) });
      hechas.push(c.archivo);
      await cdp.enviar("Target.closeTarget", { targetId });
    }
    cdp.cerrar();
    writeFileSync(join(plan.salida, "reflujo.json"), JSON.stringify(reflujo, null, 2) + "\n");
  } finally {
    nav.proceso.kill();
    await dormir(300);
    try {
      rmSync(nav.perfil, { recursive: true, force: true });
    } catch {
      // el perfil temporal se borra en la próxima limpieza del sistema
    }
  }
  return { hechas, reflujo };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const archivo = process.argv.slice(2).find((a) => !a.startsWith("--"));
  const estricto = process.argv.includes("--estricto");
  if (!archivo) {
    console.error("Uso: node capturar.mjs <capturas.json> [--estricto]");
    process.exit(2);
  }
  try {
    const plan = planDeCapturas(JSON.parse(readFileSync(archivo, "utf8")), dirname(resolve(archivo)));
    const { hechas, reflujo } = await capturar(plan);
    for (const h of hechas) console.log(`  ✔ ${h}`);
    console.log(`${hechas.length} capturas en ${plan.salida}`);
    const desbordes = reflujo.filter((r) => r.desborde > 0 || r.elementos?.length);
    for (const d of desbordes)
      console.log(`  ⚠ desborde: ${d.pantalla} a ${d.ancho} px (${d.esquema}): ${d.desborde} px; ${d.elementos.map((e) => `${e.elemento} +${e.sobra}`).join(", ")}`);
    console.log(`Reflujo: ${desbordes.length} de ${reflujo.length} capturas desbordan (detalle en reflujo.json)`);
    if (estricto && desbordes.length) process.exit(1);
  } catch (e) {
    console.error(`✖ ${e.message}`);
    process.exit(1);
  }
}
