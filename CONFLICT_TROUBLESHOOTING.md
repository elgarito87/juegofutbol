# Resolución rápida de conflictos

Si al actualizar el proyecto te aparece un conflicto, sigue estos pasos rápidos:

1. Verifica el estado del repositorio:
   ```bash
   git status -sb
   ```
2. Si ves archivos con conflicto, ábrelos y busca estos marcadores:
   ```
   <<<<<<<
   =======
   >>>>>>>
   ```
3. Decide qué cambios conservar (o combina ambos), elimina los marcadores y guarda.
4. Marca los archivos como resueltos:
   ```bash
   git add <archivo>
   ```
5. Finaliza con un commit:
   ```bash
   git commit -m "Resuelve conflicto de actualización"
   ```

> Si estás trabajando con ramas, asegúrate de traer los últimos cambios con
> `git pull` antes de seguir editando, o realiza un `git stash` temporal para
> guardar tu trabajo.
