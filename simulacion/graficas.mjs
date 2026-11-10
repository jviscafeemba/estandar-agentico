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

const PASOS = { "03": paso03 };
const paso = process.argv[2];
if (!PASOS[paso]) throw new Error(`Uso: node simulacion/graficas.mjs <${Object.keys(PASOS).join("|")}>`);
PASOS[paso]();
