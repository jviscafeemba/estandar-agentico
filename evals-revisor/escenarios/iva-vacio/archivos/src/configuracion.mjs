// La tasa de IVA se configura por entorno (TASA_IVA, entre 0 y 1); 0.13 si no está definida.

export function tasaIva(env = process.env) {
  const valor = env.TASA_IVA;
  if (valor === undefined) return 0.13;
  const tasa = Number(valor);
  if (Number.isNaN(tasa) || tasa < 0 || tasa > 1) throw new RangeError(`TASA_IVA inválida: ${valor}`);
  return tasa;
}
