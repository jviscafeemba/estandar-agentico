import { test } from "node:test";
import assert from "node:assert/strict";
import { leerConfigErp } from "../../modulos/erp/config.mjs";

test("RF-008: configuración del ERP desde variables de entorno, con valores por defecto", () => {
  assert.deepEqual(leerConfigErp({}), { url: "https://erp.emba.local/api", timeoutMs: 5000 });
  assert.deepEqual(leerConfigErp({ ERP_URL: "https://otro.emba.local", ERP_TIMEOUT_MS: "300" }), { url: "https://otro.emba.local", timeoutMs: 300 });
  assert.throws(() => leerConfigErp({ ERP_TIMEOUT_MS: "0" }), RangeError);
});
