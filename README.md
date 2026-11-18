# 🐷 Piggy Bank — Gestor de gastos

App personal para registrar ingresos y gastos, ver el saldo de tus cuentas
y seguir tus metas de ahorro. Hecha con Next.js, shadcn/ui y Supabase
(base de datos + login).

## 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com), crea una cuenta gratis y un
   nuevo proyecto (elige una región cercana y una contraseña de base de
   datos, guárdala).
2. Cuando el proyecto esté listo, entra a **Project Settings > API** y copia:
   - `Project URL`
   - `anon public` key
3. Entra a **SQL Editor > New query**, pega todo el contenido del archivo
   [`supabase/schema.sql`](./supabase/schema.sql) de este proyecto y dale
   **Run**. Esto crea las tablas de cuentas, categorías, movimientos y
   metas de ahorro, con seguridad a nivel de fila (cada usuario solo ve
   sus propios datos) y categorías por defecto para cada usuario nuevo.
4. (Opcional pero recomendado) En **Authentication > Providers**, revisa
   que "Email" esté habilitado. Por defecto Supabase pide confirmar el
   correo antes de poder iniciar sesión — puedes desactivarlo en
   **Authentication > Settings** si quieres probar más rápido.

## 2. Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y completa con los valores de tu
proyecto de Supabase:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 3. Correr la app en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000), crea una cuenta desde
"Regístrate" y empieza a usarla.

## 4. Desplegar en Vercel (cuando quieras acceder desde cualquier lugar)

1. Sube este proyecto a un repositorio de GitHub.
2. Entra a [vercel.com/new](https://vercel.com/new) e importa el repo.
3. En la configuración del proyecto, agrega las mismas variables de
   entorno (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Despliega. Con esto puedes entrar desde el celular o cualquier
   computadora con tu usuario y contraseña.

## Funciones incluidas

- **Login** con correo y contraseña (Supabase Auth).
- **Cuentas**: efectivo, banco, tarjeta, ahorros, etc., con saldo
  calculado automáticamente a partir de sus movimientos.
- **Movimientos**: ingresos y gastos por categoría, con fecha y
  descripción.
- **Metas de ahorro**: define un monto objetivo y ve tu progreso.
- **Reportes**: gastos por categoría del mes y tendencia de ingresos vs.
  gastos de los últimos 6 meses.

## Stack técnico

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (Postgres + Auth + Row Level Security)
- [Recharts](https://recharts.org) para los gráficos
