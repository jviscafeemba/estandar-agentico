// Reglas de los hooks de seguridad (ADR-E002). Funciones puras: las prueba tests/reglas.test.mjs.
// El hook es la segunda línea de defensa; la primera son los permisos negados de la política administrada.

const DELIM = String.raw`[\\/\s'"=:;|&<>(),]`;
// Los ejemplos sin valores (.env.example, .env.sample y sus copias .bak) no se bloquean. 0.4.0: se suma .sample
// (P-019 de ai-desempeno). .env, .env.local y secrets/ siguen bloqueados.
const EJEMPLO = String.raw`(?:example|sample)\b`;
const ARCHIVO_ENTORNO = new RegExp(String.raw`(^|${DELIM})\.env(\.(?!${EJEMPLO})[\w.-]+)?(?=$|${DELIM})`, "i");
const CARPETA_SECRETOS = new RegExp(String.raw`(^|${DELIM})secrets(?=$|${DELIM})`, "i");

// Quita comillas y el escape de PowerShell, que sirven para partir un nombre (.e""nv, .e`nv) sin cambiar su
// efecto. La barra invertida no se quita: en Windows es separador de rutas. Límite conocido: una expansión
// ($(echo .env), variables) no se detecta; para eso están los permisos negados de la política administrada.
export function normalizar(texto) {
  return texto.replace(/["'`]/g, "");
}

function comodinARegex(segmento) {
  const cuerpo = segmento.replace(/[.+^${}()|]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${cuerpo}$`, "i");
}

// Un segmento con comodines que podría resolverse a .env o a secrets (cat .e*, ls secr?ts).
function comodinAlcanzaSecreto(texto) {
  const segmentos = texto.split(/[\s\\/'"=:;|&<>(),]+/).filter((s) => /[*?\[]/.test(s));
  return segmentos.some((s) => {
    if (s.includes("[")) s = s.replace(/\[[^\]]*\]/g, "?");
    const re = comodinARegex(s);
    const literal = s.replace(/[*?]/g, "");
    const tocaEntorno = s.startsWith(".") && (re.test(".env") || re.test(".env.local"));
    const tocaSecretos = literal.length > 0 && re.test("secrets");
    return tocaEntorno || tocaSecretos;
  });
}

function textosRevisables(herramienta, entrada) {
  const textos = [entrada.file_path, entrada.notebook_path, entrada.path, entrada.command];
  if (herramienta === "Glob") textos.push(entrada.pattern);
  if (herramienta === "Grep") textos.push(entrada.glob); // el pattern de Grep es texto a buscar, no una ruta
  return textos.filter((t) => typeof t === "string");
}

// 0.4.1 (ajuste «secretos-patrones-citados», ai-genesys): en sed, grep, awk, perl y rg el patrón es texto a
// buscar, no una ruta. «sed -i '16s/.*/x/' a.py» chocaba por el «.*» y «grep 'secrets:' compose.yaml» por la palabra.
// Con el ajuste se quita ese único argumento, y solo si está entero entre comillas y sin $( ) ni ``. Los archivos,
// las opciones con valor (-f, --include, -g…) y un patrón sin comillas se siguen mirando.
const BUSCADORES = {
  grep: { patron: /^(-e|--regexp)$/, valor: /^(-f|--file|-m|--max-count|-A|-B|-C|--include|--exclude|--exclude-dir|--label)$/ },
  rg: { patron: /^(-e|--regexp)$/, valor: /^(-f|--file|-m|--max-count|-A|-B|-C|-g|--glob|--iglob|-t|--type|-T|--type-not|-r|--replace|-M|--max-columns|-j|--threads|--type-add)$/ },
  sed: { patron: /^(-e|--expression)$/, valor: /^(-f|--file|-l|--line-length)$/, archivo: /^(-f|--file)$/ },
  awk: { patron: null, valor: /^(-f|--file|-v|--assign|-F|--field-separator)$/, archivo: /^(-f|--file)$/ },
  perl: { patron: /^-[A-Za-z]*[eE]$/, valor: /^(-I|-M|-m|-x)$/, archivo: null, sinPosicional: true },
};
const ALIAS_BUSCADOR = { egrep: "grep", fgrep: "grep", gawk: "awk", mawk: "awk", nawk: "awk", gsed: "sed" };

// Palabras de un comando con su posición en el texto original, agrupadas por tramo (; && || | & y salto de línea).
function palabrasConPosicion(texto) {
  const tramos = [[]];
  let inicio = -1;
  let comilla = null;
  const cerrar = (i) => {
    if (inicio >= 0) tramos.at(-1).push({ inicio, fin: i, crudo: texto.slice(inicio, i) });
    inicio = -1;
  };
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comilla) {
      if (c === "\\" && comilla === '"') i++;
      else if (c === comilla) comilla = null;
      continue;
    }
    if (c === "'" || c === '"') {
      if (inicio < 0) inicio = i;
      comilla = c;
    } else if (c === "\\") {
      if (inicio < 0) inicio = i;
      i++;
    } else if (/[;|&\n]/.test(c)) {
      cerrar(i);
      if (tramos.at(-1).length) tramos.push([]);
    } else if (/\s/.test(c)) cerrar(i);
    else if (inicio < 0) inicio = i;
  }
  cerrar(texto.length);
  return tramos.filter((t) => t.length);
}

const enteroEntreComillas = (crudo) =>
  (/^'[^']*'$/.test(crudo) || /^"(?:[^"\\]|\\.)*"$/.test(crudo)) && !/\$\(|`/.test(crudo);

export function sinPatronesCitados(comando) {
  let salida = comando;
  for (const palabras of palabrasConPosicion(comando)) {
    const nombre = normalizar(palabras[0].crudo).split(/[\\/]/).pop().toLowerCase().replace(/\.exe$/, "");
    const reglas = BUSCADORES[ALIAS_BUSCADOR[nombre] ?? nombre];
    if (!reglas) continue;
    const patrones = [];
    let conOpcionDePatron = false;
    let conArchivoDePrograma = false;
    let soloPosicionales = false;
    let primerPosicional = null;
    for (let i = 1; i < palabras.length; i++) {
      const crudo = normalizar(palabras[i].crudo);
      if (!soloPosicionales && crudo === "--") {
        soloPosicionales = true;
        continue;
      }
      if (!soloPosicionales && crudo.startsWith("-") && crudo.length > 1) {
        if (reglas.patron?.test(crudo)) {
          conOpcionDePatron = true;
          if (palabras[i + 1]) patrones.push(palabras[++i]);
        } else if (reglas.valor.test(crudo)) {
          if (reglas.archivo?.test(crudo)) conArchivoDePrograma = true;
          i++;
        }
        continue;
      }
      primerPosicional ??= palabras[i];
    }
    if (!conOpcionDePatron && !conArchivoDePrograma && !reglas.sinPosicional && primerPosicional) patrones.push(primerPosicional);
    for (const p of patrones.filter((x) => enteroEntreComillas(x.crudo)))
      salida = salida.slice(0, p.inicio) + " ".repeat(p.fin - p.inicio) + salida.slice(p.fin);
  }
  return salida;
}

export function accesoASecreto(herramienta, entrada = {}, { patronesCitados = false } = {}) {
  if (patronesCitados && typeof entrada.command === "string")
    entrada = { ...entrada, command: sinPatronesCitados(entrada.command) };
  for (const original of textosRevisables(herramienta, entrada)) {
    const t = normalizar(original);
    if (ARCHIVO_ENTORNO.test(t) || CARPETA_SECRETOS.test(t) || comodinAlcanzaSecreto(t)) {
      return {
        regla: "secretos",
        motivo:
          "Bloqueado por emba-harness (ADR-E002): los archivos de entorno y la carpeta secrets/ no se leen, " +
          "no se tocan y no se borran. Si el cambio lo necesita, frená y avisá a una persona del proyecto.",
      };
    }
  }
  return null;
}

const PELIGROSOS = [
  { regla: "git-push-force", re: /\bgit\s+push\b[^;&|\n]*\s(-f|--force(-with-lease)?)(?=\s|$)/ },
  { regla: "git-reset-hard", re: /\bgit\s+reset\b[^;&|\n]*\s--hard\b/ },
  { regla: "git-clean", re: /\bgit\s+clean\b[^;&|\n]*\s-[a-z]*f/ },
  { regla: "descargar-y-ejecutar", re: /\b(curl|wget|iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^|\n]*\|\s*(sh|bash|zsh|iex|Invoke-Expression)\b/i },
  { regla: "drop-database", re: /\bdrop\s+(database|schema)\b/i },
];

// rm -rf / Remove-Item -Recurse -Force sobre algo fuera del proyecto: raíz, home, padre, comodín suelto o ruta absoluta.
function borradoMasivo(cmd) {
  for (const parte of cmd.split(/;|&&|\|\||\n/)) {
    const tokens = parte.trim().split(/\s+/);
    const i = tokens.findIndex((t) => t === "rm" || /^(Remove-Item|ri|del|rmdir)$/i.test(t));
    if (i < 0) continue;
    const args = tokens.slice(i + 1);
    const flags = args.filter((a) => a.startsWith("-")).join(" ");
    const recursivo = /(^|\s)-[a-z]*r|--recursive|-Recurse/i.test(flags);
    const forzado = /(^|\s)-[a-z]*f|--force|-Force/i.test(flags);
    if (!(recursivo && forzado)) continue;
    const objetivos = args.filter((a) => !a.startsWith("-"));
    if (objetivos.some((o) => /^(\/|~|\$HOME|\$env:|\.\.|\*$|[A-Za-z]:)/i.test(o))) return true;
  }
  return false;
}

export function comandoPeligroso(comando) {
  if (typeof comando !== "string") return null;
  const cmd = normalizar(comando);
  const hallado = PELIGROSOS.find((p) => p.re.test(cmd));
  const regla = hallado?.regla ?? (borradoMasivo(cmd) ? "borrado-masivo" : null);
  if (!regla) return null;
  return {
    regla,
    motivo:
      `Bloqueado por emba-harness (ADR-E002, regla ${regla}): es una acción destructiva o irreversible. ` +
      "Si de verdad hace falta, la ejecuta una persona.",
  };
}
