// RF-004: una transferencia son dos movimientos (egreso en origen, ingreso en destino), según ADR-001.

export function transferir(movimientos, { articulo, origen, destino, cantidad }) {
  if (origen === destino) throw new Error("Origen y destino deben ser distintos");
  const egreso = Object.freeze({ tipo: "egreso", articulo, almacen: origen, cantidad });
  const ingreso = Object.freeze({ tipo: "ingreso", articulo, almacen: destino, cantidad });
  return Object.freeze([...movimientos, egreso, ingreso]);
}
