# Grano × HAVEN · Cómo publicarlo en Netlify

## Qué hay en la carpeta

| Archivo | Qué es |
| --- | --- |
| `public/index.html` | La app. En el **móvil** muestra la carta del cliente. En el **ordenador** pide el PIN y abre la gestión. |
| `public/propuesta.html` | La web comercial (problemas, comparativa, plan, precio y calculadora). |
| `netlify/functions/api.mjs` | El pequeño servidor que sincroniza móviles y ordenador (pedidos, mesas, pagos, avisos). |
| `netlify.toml` y `package.json` | La configuración que Netlify lee al publicar. No hace falta tocarlos. |

## Publicarlo (unos 10 minutos, sin instalar nada)

La sincronización usa una función de Netlify. **Arrastrar la carpeta a Netlify Drop no sirve para eso:** la web se vería, pero cada dispositivo iría por su cuenta. Hay que subirlo a través de GitHub:

1. **Crea un repositorio en GitHub.** Entra en github.com → **New repository** → nombre `grano-haven` → **Create repository**.
2. **Sube los archivos.** En el repositorio vacío, pulsa **uploading an existing file** y arrastra **todo el contenido** de esta carpeta: las carpetas `public` y `netlify`, y los archivos `netlify.toml`, `package.json` y `LEEME.md`. Después pulsa **Commit changes**.
3. **Conecta Netlify.** En app.netlify.com → **Add new project** (o «Add new site») → **Import an existing project** → **GitHub** → elige `grano-haven`. Netlify lee la configuración solo: deja todo como está y pulsa **Deploy**.
4. **Cambia el PIN (recomendado).** En Netlify → tu sitio → **Site configuration** → **Environment variables** → **Add a variable**: nombre `MANAGER_PIN`, valor el PIN que quieras (4 cifras). Después ve a **Deploys** → **Trigger deploy** → **Deploy site**. Si no lo cambias, el PIN es **1234**.
5. **Ponle un nombre bonito (opcional).** En **Domain management** → **Options** → **Edit site name** → por ejemplo `grano-haven`. La dirección quedará `https://grano-haven.netlify.app`.

## Cómo se usa

- **Desde el móvil**, abre la dirección: verás la carta de la **mesa 4**. Para otra mesa, añade `?mesa=7` al final.
- **Desde el ordenador**, abre la misma dirección, mete el PIN y verás la gestión. En **QR de mesas** tienes un QR por mesa para escanear o imprimir.
- **Para forzar una vista** en cualquier dispositivo: `?vista=cliente` o `?vista=gestion`.
- **Reiniciar demo** (arriba, como manager) borra los pedidos de prueba en todos los dispositivos.

## Guion para clase (2 minutos)

1. Proyecta el ordenador con la gestión abierta y enseña el QR de la mesa 4.
2. Un compañero lo escanea y pide «lo de siempre» → aparece en **Pedidos** con un aviso.
3. Pásalo a **Listo** → el móvil recibe «Te lo llevamos ahora mismo».
4. El compañero paga desde el móvil → suma el sello y la mesa sale como **Pagada**.
5. En **Carta**, marca algo como agotado → desaparece de la carta del móvil.
6. En **Inventario IA**, lee el albarán de ejemplo y confirma.

## Lo que hay que saber

- **Es un prototipo de demostración.** Los pagos, los avisos al Wallet y la lectura del albarán con IA están simulados. Los precios de las bebidas son los de la carta pública de HAVEN; la comida, la tienda, los clientes y las ventas son datos de ejemplo.
- **El PIN protege la gestión de forma básica:** el servidor rechaza los cambios de gestión sin el PIN correcto. Para un uso real con clientes y pagos de verdad haría falta un inicio de sesión con usuarios y un proveedor de pagos.
- **Los datos de la demo** se guardan en Netlify Blobs, el almacén incluido en Netlify, y no necesitan otra cuenta. El plan gratuito de Netlify basta para una clase.
- **Si la función no responde,** la app sigue funcionando en modo «solo este dispositivo» y lo indica arriba.
