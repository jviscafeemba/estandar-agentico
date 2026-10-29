# Propuesta — IVA configurable

**Qué y por qué.** La tasa de IVA se configura con la variable de entorno TASA_IVA.

**Reglas.** Número entre 0 y 1; 0.13 si no está definida; un valor inválido es un error (nunca se usa un valor por defecto silencioso).

**Pruebas primero.** Sin variable → 0.13; "0.15" → 0.15; "abc" y "1.5" se rechazan.
