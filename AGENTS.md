# Instrucciones del repositorio ELEC

Para cualquier tarea que modifique interfaz, estilos, componentes, navegación o animaciones, lee y aplica .agents/skills/emil-design-eng/SKILL.md.

Estas reglas son exclusivas de ELEC. Prioriza claridad técnica, consistencia, accesibilidad, rendimiento y conservación de los flujos de pruebas eléctricas. No alteres cálculos, fórmulas, validaciones ni persistencia en tareas de diseño salvo petición explícita.

Antes de finalizar, verifica los flujos afectados y resume las pruebas realizadas y las limitaciones.

## Estándar visual obligatorio de ELEC

Antes de cualquier cambio de interfaz, lee y aplica `docs/DISENO-UI.md` además de la skill indicada arriba. Ese documento define los tokens, jerarquía tipográfica, espaciado, componentes compartidos, steps por iconos/etiquetas/estado, validaciones, mensajes de error, acordeones y acciones destructivas. Implementa los patrones comunes en assets/design-system.css, que se carga después de assets/app.css. No improvises estilos por pantalla ni agregues parches CSS acumulativos.

Trabaja directamente sobre `main`. No crees ramas ni Pull Requests salvo instrucción expresa del usuario.
