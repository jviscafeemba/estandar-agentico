// ERRÓNEO (plausible sin carriles): A agrega "canal" al contrato por su cuenta y como OBLIGATORIO. Rompe la
// compatibilidad hacia atrás y choca con el cambio del dueño (carril B) en el mismo bloque del contrato.

const texto = (v) => typeof v === "string" && v.trim() !== "";
const fechaIso = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const enteroPositivo = (v) => Number.isInteger(v) && v > 0;
const enteroNoNegativo = (v) => Number.isInteger(v) && v >= 0;
const enteroDistintoDeCero = (v) => Number.isInteger(v) && v !== 0;
const canal = (v) => v === "tienda" || v === "web";

// Campos de cada tipo de evento. "tipo" va siempre y no se declara aquí.
export const ESQUEMAS = {
  "venta.registrada": {
    obligatorios: { id: texto, fecha: fechaIso, sku: texto, cantidad: enteroPositivo, precioUnitarioCentavos: enteroNoNegativo, canal },
    opcionales: {},
  },
  "stock.ajustado": {
    obligatorios: { id: texto, fecha: fechaIso, sku: texto, delta: enteroDistintoDeCero, motivo: texto },
    opcionales: {},
  },
};

export const TIPOS = Object.freeze(Object.keys(ESQUEMAS));

// Devuelve el evento congelado si cumple el contrato; si no, lanza TypeError (forma) o RangeError (valor).
export function validarEvento(evento) {
  if (!evento || typeof evento !== "object") throw new TypeError("El evento debe ser un objeto");
  const esquema = ESQUEMAS[evento.tipo];
  if (!esquema) throw new TypeError(`Tipo de evento desconocido: ${evento.tipo}`);
  for (const campo of Object.keys(evento)) {
    if (campo === "tipo" || evento[campo] === undefined) continue;
    if (!(campo in esquema.obligatorios) && !(campo in esquema.opcionales))
      throw new TypeError(`${evento.tipo}: campo desconocido "${campo}" (el contrato no lo declara)`);
  }
  for (const [campo, valido] of Object.entries(esquema.obligatorios)) {
    if (evento[campo] === undefined) throw new TypeError(`${evento.tipo}: falta el campo "${campo}"`);
    if (!valido(evento[campo])) throw new RangeError(`${evento.tipo}: valor inválido en "${campo}": ${evento[campo]}`);
  }
  for (const [campo, valido] of Object.entries(esquema.opcionales))
    if (evento[campo] !== undefined && !valido(evento[campo])) throw new RangeError(`${evento.tipo}: valor inválido en "${campo}": ${evento[campo]}`);
  return Object.isFrozen(evento) ? evento : Object.freeze({ ...evento });
}

function crear(tipo, datos) {
  const evento = { tipo };
  for (const [campo, valor] of Object.entries(datos ?? {})) if (valor !== undefined) evento[campo] = valor;
  return validarEvento(evento);
}

export const crearVentaRegistrada = (datos) => crear("venta.registrada", datos);
export const crearStockAjustado = (datos) => crear("stock.ajustado", datos);
