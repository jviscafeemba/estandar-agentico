// Configuración del conector del ERP (RF-008): sale de variables de entorno, con valores por defecto.
// Nunca lee el archivo .env ni devuelve credenciales.
export const URL_POR_DEFECTO = "https://erp.emba.local/api";
export const TIMEOUT_POR_DEFECTO_MS = 5000;

const definida = (v) => v !== undefined && v !== null && String(v) !== "";

export function leerConfigErp(entorno = process.env) {
  const url = definida(entorno.ERP_URL) ? String(entorno.ERP_URL) : URL_POR_DEFECTO;
  let timeoutMs = TIMEOUT_POR_DEFECTO_MS;
  if (definida(entorno.ERP_TIMEOUT_MS)) {
    const texto = String(entorno.ERP_TIMEOUT_MS);
    if (!/^\d+$/.test(texto) || Number(texto) < 1) throw new RangeError(`ERP_TIMEOUT_MS debe ser un entero positivo en milisegundos: ${texto}`);
    timeoutMs = Number(texto);
  }
  return { url, timeoutMs };
}
