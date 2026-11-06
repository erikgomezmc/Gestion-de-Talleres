# Taller Norte — Demo de gestión de taller

Demo frontend de un sistema de gestión de taller mecánico. Está hecha con HTML, CSS y JavaScript vanilla; no requiere base de datos ni backend. Los datos de acceso y del panel son simulados.

## Requisitos

- Un navegador moderno.
- Un servidor web estático local. Como los scripts usan módulos JavaScript (`type="module"`), no abras las páginas directamente con `file://`.

## Cómo ejecutar

1. Abre PowerShell o una terminal en la carpeta del proyecto.
2. Inicia un servidor HTTP estático con Python:

   ```powershell
   py -m http.server 8000
   ```

   Si el comando `py` no está disponible, prueba:

   ```powershell
   python -m http.server 8000
   ```

   También puedes abrir la carpeta en Visual Studio Code y usar una extensión de servidor estático, como Live Server.

3. En el navegador, visita <http://localhost:8000/login.html>.
4. Para detener el servidor iniciado desde la terminal, vuelve a ella y presiona `Ctrl+C`.

## Cuentas de demostración

La contraseña para todas las cuentas es `demo123`.

| Rol | Usuario |
|---|---|
| Propietario | `propietario` |
| Administrador | `admin` |
| Mecánico | `mecanico` |
| Cliente | `cliente` |
| Proveedor | `proveedor` |

En la pantalla de login también se puede desplegar **Ver usuarios de prueba** para consultar las cuentas.

## Estructura de archivos

```text
login.html          Pantalla de acceso.
dashboard.html      Interfaz principal con sidebar y área de contenido.
css/
  styles.css        Estilos compartidos y reglas responsivas.
js/
  api.js            Servicios mock que simulan llamadas asíncronas.
  login.js          Validación del formulario y creación de la sesión demo.
  dashboard.js      Menú por rol, resumen, navegación y cierre de sesión.
```

## Cómo funciona

1. `login.html` carga `js/login.js` como módulo.
2. Al enviar el formulario, `login.js` llama a `loginUsuario()` en `js/api.js`.
3. El servicio busca las credenciales en su lista de usuarios demo y devuelve una promesa. Si son incorrectas, rechaza la operación con un mensaje de error.
4. Cuando el acceso es válido, se guarda en `localStorage` el nombre, usuario, correo y rol (no la contraseña), bajo la clave `tallerNorteSession`, y se abre `dashboard.html`.
5. `dashboard.js` lee esa sesión y construye las opciones del menú para el rol autenticado. Si no encuentra una sesión válida, vuelve a la pantalla de login.
6. La opción **Cerrar sesión** elimina la sesión y redirige al login.

La navegación del menú se renderiza según el rol. Las secciones que aún no tienen contenido de negocio muestran un mensaje de preparación para la futura integración. El resumen obtiene órdenes y actividad desde los servicios mock; el cliente y el mecánico ven las órdenes que corresponden a su cuenta.

## Conectar el backend más adelante

`js/api.js` es la capa de servicios que aísla los datos simulados de las pantallas. Actualmente exporta:

- `loginUsuario(username, password)`: valida una cuenta demo y devuelve los datos del usuario sin contraseña.
- `obtenerOrdenes()`: devuelve las órdenes demo.
- `obtenerActividad()`: devuelve la actividad demo.

Cuando exista la API, reemplaza la lógica mock dentro de estas funciones por llamadas `fetch()` a los endpoints acordados y conserva sus nombres, parámetros y formas de respuesta (o actualiza sus consumidores en `login.js` y `dashboard.js`). Maneja los errores HTTP rechazando la promesa para que la interfaz pueda mostrar el problema.

La autenticación de esta demo **no es segura para producción**: las credenciales están en el código del navegador y la sesión se guarda en `localStorage`. En producción, el backend debe autenticar al usuario y el equipo debe acordar el manejo seguro de la sesión o los tokens; no se deben incluir contraseñas ni secretos en el frontend.

## Notas

- Los datos, importes, órdenes e indicadores del panel son ejemplos y no se guardan en una base de datos.
- La hoja de estilos incluye diseños adaptables para escritorio y pantallas móviles.
- La tipografía se descarga desde Google Fonts cuando hay conexión a internet; si no está disponible, se utilizan fuentes alternativas del sistema.
