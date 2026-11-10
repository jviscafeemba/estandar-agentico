// Gráficas de los informes de la simulación: SVG estáticos, sin dependencias, con modo claro y oscuro.
// Se embeben en los .md con ![](graficas/<archivo>.svg). Paleta y marcas según la skill dataviz (paleta de
// referencia validada: azul y naranja pasan los seis chequeos en los dos modos). Cada gráfica tiene al lado, en
// el informe, la tabla con los mismos datos (la vista accesible).
//   node simulacion/graficas.mjs 03
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DESTINO = "docs/iteracion-2/simulaciones/graficas";
const SERIES = ["--s1", "--s2", "--s3"];
const ESTILO = `
  .raiz { --sup:#fcfcfb; --t1:#0b0b0b; --t2:#52514e; --grilla:#e6e5e1; --s1:#2a78d6; --s2:#eb6834; --s3:#1baf7a; }
  @media (prefers-color-scheme: dark) { .raiz { --sup:#1a1a19; --t1:#f0efec; --t2:#c3c2b7; --grilla:#2e2e2c; --s1:#3987e5; --s2:#d95926; --s3:#199e70; } }
  text { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; fill: var(--t1); }
  .t2 { fill: var(--t2); } .titulo { font-size: 15px; font-weight: 600; } .sub { font-size: 12px; }
  .eje { font-size: 11px; } .cat { font-size: 12.5px; } .val { font-size: 11.5px; }
  .grilla { stroke: var(--grilla); stroke-width: 1; } .fondo { fill: var(--sup); }`;

const fmt = (n, dec = 2) => n.toLocaleString("es-BO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Barra horizontal: base cuadrada a la izquierda, extremo de datos redondeado (4px).
function barra(x, y, ancho, alto, color) {
  if (ancho <= 0) return "";
  const r = Math.min(4, ancho, alto / 2);
  return `<path d="M${x},${y} H${x + ancho - r} Q${x + ancho},${y} ${x + ancho},${y + r} V${y + alto - r} Q${x + ancho},${y + alto} ${x + ancho - r},${y + alto} H${x} Z" fill="var(${color})"/>`;
}

// grupos: [{ etiqueta, valores: [{ serie, valor, nota }] }]; series: nombres en orden fijo (color por serie).
export function barrasHorizontales({ titulo, subtitulo, grupos, series, unidad, maximo, decimales = 2 }) {
  const ANCHO = 760, IZQ = 190, GROSOR = 18, HUECO = 2, ENTRE = 16;
  // Margen derecho según la etiqueta más larga (≈ 6,6 px por carácter a 11,5 px), para que no se corte.
  const DER = 24 + 6.6 * Math.max(...grupos.flatMap((g) => g.valores.map((v) => `${fmt(v.valor, decimales)} · ${v.nota ?? ""}`.length)));
  const arriba = 58 + (series.length > 1 ? 24 : 0);
  const alturaGrupo = series.length * GROSOR + (series.length - 1) * HUECO;
  const alto = arriba + grupos.length * (alturaGrupo + ENTRE) + 34;
  const max = maximo ?? Math.max(...grupos.flatMap((g) => g.valores.map((v) => v.valor))) * 1.05;
  const escala = (ANCHO - IZQ - DER) / max;
  const paso = [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50].find((p) => max / p <= 6) ?? 100;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${alto}" width="${ANCHO}" height="${alto}" role="img" aria-label="${esc(titulo)}"><style>${ESTILO}</style><g class="raiz"><rect class="fondo" width="${ANCHO}" height="${alto}" rx="8"/>`;
  svg += `<text x="16" y="26" class="titulo">${esc(titulo)}</text><text x="16" y="44" class="sub t2">${esc(subtitulo)}</text>`;
  if (series.length > 1) {
    let lx = 16;
    series.forEach((s, i) => {
      svg += `<rect x="${lx}" y="${58}" width="10" height="10" rx="2" fill="var(${SERIES[i]})"/><text x="${lx + 15}" y="${67}" class="eje t2">${esc(s)}</text>`;
      lx += 26 + s.length * 7;
    });
  }
  const abajo = alto - 30;
  for (let v = 0; v <= max + 1e-9; v += paso) {
    const x = IZQ + v * escala;
    svg += `<line class="grilla" x1="${x}" x2="${x}" y1="${arriba - 6}" y2="${abajo}"/><text x="${x}" y="${abajo + 16}" class="eje t2" text-anchor="middle">${fmt(v, paso < 1 ? 2 : 0)}</text>`;
  }
  svg += `<text x="${ANCHO - DER}" y="${abajo + 16}" class="eje t2" text-anchor="start" dx="8">${esc(unidad)}</text>`;
  grupos.forEach((g, gi) => {
    const y0 = arriba + gi * (alturaGrupo + ENTRE);
    svg += `<text x="${IZQ - 10}" y="${y0 + alturaGrupo / 2 + 4}" class="cat" text-anchor="end">${esc(g.etiqueta)}</text>`;
    g.valores.forEach((v) => {
      const i = series.indexOf(v.serie);
      const y = y0 + i * (GROSOR + HUECO);
      const w = v.valor * escala;
      svg += barra(IZQ, y, w, GROSOR, SERIES[i]);
      svg += `<text x="${IZQ + w + 6}" y="${y + GROSOR / 2 + 4}" class="val t2">${fmt(v.valor, decimales)}${v.nota ? ` · ${esc(v.nota)}` : ""}</text>`;
    });
  });
  return svg + "</g></svg>\n";
}

function guardar(nombre, svg) {
  mkdirSync(DESTINO, { recursive: true });
  writeFileSync(join(DESTINO, nombre), svg);
  console.log(`✔ ${join(DESTINO, nombre)}`);
}

const leer = (ruta) => readFileSync(ruta, "utf8").trim().split("\n").map((l) => JSON.parse(l));

function paso03() {
  const r = leer("simulacion/resultados/piloto/resultados.jsonl");
  const ESC = [["e4-prueba-contradice", "E4 · prueba contradice"], ["e6-pendiente-malicioso", "E6 · pendiente malicioso"], ["e3-descuento-global", "E3 · descuento global"]];
  const grupos = ESC.map(([id, etiqueta]) => ({
    etiqueta,
    valores: r
      .filter((x) => x.tarea === id || x.tarea === `${id}-base`)
      .map((x) => ({ serie: x.configuracion.endsWith("-con") ? "con el elemento" : "línea base", valor: x.costo_usd, nota: `${x.exito ? "éxito" : "falla"} · ${x.turnos} turnos` })),
  }));
  guardar("03-piloto-costo.svg", barrasHorizontales({
    titulo: "Piloto: costo por corrida, con el elemento y sin él",
    subtitulo: "Sonnet 5.5 · 1 repetición por brazo · E3 en modo B (con líder), E4 y E6 en modo A",
    grupos, series: ["con el elemento", "línea base"], unidad: "USD",
  }));
  const est = [["E5 revisión", 14, 32], ["E3 · E4", 11, 30], ["E7 · E8 · E9", 11, 26], ["Repeticiones (+15 %)", 6, 0], ["E1 · E2 · E10", 5, 36], ["E6 seguridad", 3, 21]];
  guardar("03-paso4-estimado.svg", barrasHorizontales({
    titulo: "Paso 4: costo estimado por grupo de elementos",
    subtitulo: "≈ 145 corridas · ≈ 50 USD equivalentes en total (rango 35-65) · estimado con los costos del piloto",
    grupos: est.map(([etiqueta, usd, corridas]) => ({ etiqueta, valores: [{ serie: "USD", valor: usd, nota: corridas ? `${corridas} corridas` : "reserva" }] })),
    series: ["USD"], unidad: "USD", decimales: 0,
  }));
}

// Punto = tasa observada; barra = intervalo de Wilson al 95 %. filas: [{ etiqueta, serie, k, n, w: {p, bajo, alto} }]
export function intervalos({ titulo, subtitulo, filas, series }) {
  const ANCHO = 760, IZQ = 280, DER = 60, FILA = 22, arriba = 82;
  const alto = arriba + filas.length * FILA + 36;
  const x = (v) => IZQ + v * (ANCHO - IZQ - DER);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${alto}" width="${ANCHO}" height="${alto}" role="img" aria-label="${esc(titulo)}"><style>${ESTILO}</style><g class="raiz"><rect class="fondo" width="${ANCHO}" height="${alto}" rx="8"/>`;
  svg += `<text x="16" y="26" class="titulo">${esc(titulo)}</text><text x="16" y="44" class="sub t2">${esc(subtitulo)}</text>`;
  let lx = 16;
  series.forEach((s, i) => { svg += `<circle cx="${lx + 5}" cy="63" r="5" fill="var(${SERIES[i]})"/><text x="${lx + 15}" y="67" class="eje t2">${esc(s)}</text>`; lx += 30 + s.length * 6.6; });
  const abajo = alto - 30;
  for (const v of [0, 0.25, 0.5, 0.75, 1]) svg += `<line class="grilla" x1="${x(v)}" x2="${x(v)}" y1="${arriba - 8}" y2="${abajo}"/><text x="${x(v)}" y="${abajo + 16}" class="eje t2" text-anchor="middle">${Math.round(v * 100)} %</text>`;
  let previa = null;
  filas.forEach((f, i) => {
    const y = arriba + i * FILA + FILA / 2;
    const color = `var(${SERIES[series.indexOf(f.serie)]})`;
    if (f.grupo !== previa) svg += `<text x="16" y="${y + 4}" class="cat">${esc(f.grupo)}</text>`;
    previa = f.grupo;
    svg += `<text x="${IZQ - 10}" y="${y + 4}" class="eje t2" text-anchor="end">${esc(f.etiqueta)}</text>`;
    svg += `<line x1="${x(f.w.bajo)}" x2="${x(f.w.alto)}" y1="${y}" y2="${y}" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
    svg += `<circle cx="${x(f.w.p)}" cy="${y}" r="5" fill="${color}" stroke="var(--sup)" stroke-width="2"/>`;
    svg += `<text x="${ANCHO - DER + 12}" y="${y + 4}" class="val t2">${f.k}/${f.n}</text>`;
  });
  return svg + "</g></svg>\n";
}

function paso04() {
  const { resumen } = JSON.parse(readFileSync("simulacion/resultados/paso4/resumen.json", "utf8"));
  const NOMBRES = { E1: "E1 brain de empresa", E2: "E2 AGENTS.md", E3: "E3 propuesta", E4: "E4 prueba primero", E5: "E5 revisión", E6: "E6 seguridad", E7: "E7 carriles", E8: "E8 lote", E9: "E9 cierre", E10: "E10 seguimiento" };
  const ETIQ = { con: "con", base: "base", "con-A": "con, sin leer (A)" };
  const filas = resumen
    .filter((g) => g.modelo === "sonnet 5.5" && ETIQ[g.brazo] && NOMBRES[g.elemento])
    .sort((a, b) => Number(a.elemento.slice(1)) - Number(b.elemento.slice(1)) || Object.keys(ETIQ).indexOf(a.brazo) - Object.keys(ETIQ).indexOf(b.brazo))
    .map((g) => ({ grupo: NOMBRES[g.elemento], etiqueta: ETIQ[g.brazo], serie: g.brazo === "base" ? "línea base" : g.brazo === "con-A" ? "con, aprobado sin leer" : "con el elemento", k: g.k, n: g.n, w: g.wilson }));
  guardar("04-exito-por-elemento.svg", intervalos({
    titulo: "Éxito por elemento, con el elemento y sin él",
    subtitulo: "Sonnet 5.5 · punto = tasa observada · barra = intervalo de Wilson al 95 % · n = 2 a 14 por brazo",
    filas, series: ["con el elemento", "línea base", "con, aprobado sin leer"],
  }));
  const costo = Object.keys(NOMBRES).map((e) => ({
    etiqueta: NOMBRES[e],
    valores: ["con", "base"].flatMap((b) => {
      const g = resumen.find((x) => x.elemento === e && x.brazo === b && x.modelo === "sonnet 5.5");
      return g ? [{ serie: b === "con" ? "con el elemento" : "línea base", valor: g.costo_mediano, nota: `${g.k}/${g.n}` }] : [];
    }),
  })).filter((g) => g.valores.length);
  guardar("04-costo-por-elemento.svg", barrasHorizontales({
    titulo: "Costo mediano por corrida, con el elemento y sin él",
    subtitulo: "Sonnet 5.5 · USD equivalentes · la nota es el éxito n/N del brazo",
    grupos: costo, series: ["con el elemento", "línea base"], unidad: "USD",
  }));
  const r = leer("simulacion/resultados/paso4/resultados.jsonl").filter((x) => x.tarea === "iva-configurable");
  const fugas = ["sonnet", "haiku"].map((m) => ({
    etiqueta: `iva-configurable · ${m} 5.5`,
    valores: ["con", "base"].map((b) => {
      const xs = r.filter((x) => x.modelo.includes(m) && x.configuracion === `E6-${b}`);
      return { serie: b === "con" ? "con hooks y deny" : "sin hooks ni deny", valor: xs.filter((x) => x.fuga_secreto.length).length, nota: `de ${xs.length} corridas` };
    }),
  }));
  guardar("04-e6-fugas.svg", barrasHorizontales({
    titulo: "E6: corridas en las que el canario del .env ficticio se filtró",
    subtitulo: "El pedido invita a «fijarse qué variables tiene el .env» · permisos en modo auto (lo predeterminado hoy)",
    grupos: fugas, series: ["con hooks y deny", "sin hooks ni deny"], unidad: "corridas", maximo: 3.3, decimales: 0,
  }));
}

const PASOS = { "03": paso03, "04": paso04 };
const paso = process.argv[2];
if (!PASOS[paso]) throw new Error(`Uso: node simulacion/graficas.mjs <${Object.keys(PASOS).join("|")}>`);
PASOS[paso]();
