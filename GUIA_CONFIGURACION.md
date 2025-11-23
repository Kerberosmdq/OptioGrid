# Guía de Configuración de Supabase para OptioGrid

Sigue estos pasos para conectar tu base de datos y autenticación.

## Paso 1: Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com/) y haz clic en **"Start your project"**.
2. Inicia sesión con GitHub.
3. Haz clic en **"New Project"**.
4. Elige tu organización (o crea una).
5. Rellena los datos:
   - **Name**: `OptioGrid`
   - **Database Password**: Genera una segura y guárdala (no la necesitaremos ahora mismo, pero es importante).
   - **Region**: Elige la más cercana a ti (ej. Sao Paulo para Latam, o US East).
6. Haz clic en **"Create new project"** y espera unos minutos a que se inicie.

## Paso 2: Configurar la Base de Datos
1. En el menú lateral izquierdo, busca el icono de **SQL Editor** (parece una hoja con `SQL`).
2. Haz clic en **"New query"** (o usa el editor vacío que aparece).
3. Copia **todo** el contenido del archivo `supabase_schema.sql` que tienes en tu proyecto local (está en la carpeta raíz `OptioGrid`).
4. Pégalo en el editor de Supabase.
5. Haz clic en el botón **"Run"** (abajo a la derecha del editor).
   - Deberías ver un mensaje de "Success" en la zona de resultados.

## Paso 3: Obtener las Claves (API Keys)
1. En el menú lateral izquierdo, ve a **Project Settings** (icono de engranaje ⚙️, abajo del todo).
2. Haz clic en **"API"**.
3. Busca la sección **Project URL** y copia la URL.
4. Busca la sección **Project API keys** y copia la clave que dice `anon` `public`.

## Paso 4: Conectar el Frontend
1. Vuelve a tu editor de código (VS Code).
2. Ve a la carpeta `frontend`.
3. Crea un nuevo archivo llamado `.env` (sin nombre, solo extensión .env).
4. Abre el archivo `.env.example` para ver qué formato usar.
5. En tu nuevo archivo `.env`, pega lo siguiente y reemplaza con tus datos:

```env
VITE_SUPABASE_URL=pega_aqui_tu_project_url
VITE_SUPABASE_ANON_KEY=pega_aqui_tu_clave_anon_public
```

## Paso 5: Activar Autenticación
1. En Supabase, ve al menú lateral **Authentication** (icono de usuarios 👥).
2. Haz clic en **Providers**.
3. **Email**: Asegúrate de que "Email" esté **Enabled** (generalmente lo está por defecto).
   - Desactiva "Confirm email" si quieres probar rápido sin verificar correos (opcional, en **Auth -> Providers -> Email -> Confirm email**).
4. **Google** (Opcional por ahora):
   - Si quieres entrar con Google, necesitas configurar un proyecto en Google Cloud Console. Si es muy complicado ahora, podemos usar solo Email/Password para empezar.

---
**¡Listo!** Una vez hayas hecho esto, avísame para que pueda probar si la conexión funciona.
