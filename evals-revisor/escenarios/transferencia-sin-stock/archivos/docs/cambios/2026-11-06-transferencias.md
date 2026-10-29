# Propuesta — Transferencias entre almacenes

**Qué y por qué.** Mover stock de un almacén a otro.

**Requerimientos.** RF-004: dos movimientos (egreso en origen, ingreso en destino), respetando RF-002.

**Decisiones.** ADR-001: el stock se calcula de los movimientos; no se guardan saldos.

**Pruebas primero.** Transferir 4 de LPZ a SCZ deja 6 y 4; origen igual a destino se rechaza.
