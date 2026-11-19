@AGENTS.md

# Contexto del proyecto

Piggy Bank es un gestor de gastos personal (Next.js 16 + React 19 + Tailwind 4 +
shadcn/ui sobre Base UI + Supabase). Se habla en español rioplatense en la UI.

## Historia: fusión con Balance

Piggy Bank es el resultado de fusionar dos proyectos con el mismo objetivo:

- **piggy-bank** (este repo): el mejor armado, con Supabase y desplegado en Vercel.
- **Balance** (repo `Villagralucas/gestor_gastos`): corría solo en el navegador,
  guardando todo en `localStorage`. No se va a desplegar.

Se trajo de Balance lo mejor: presupuesto mensual, comparación con el mes
anterior, tendencia de 3/6/12 meses, gastos por categoría y el drawer para cargar
movimientos desde el celular. Lo único que quedó afuera fue exportar/importar
`.json`, que como backup es opcional y puede hacerse más adelante.

## Supabase

El plan free solo permite 2 proyectos, así que piggy-bank **reutiliza el
proyecto de Supabase que se había creado para Balance**. Las migraciones están
en `supabase/` y se corren a mano en el SQL Editor, en este orden:

1. `setup-en-balance.sql`
2. `002-presupuesto-y-pesos.sql`

La moneda por defecto es ARS.

## Diseño

- Color principal: verde Supabase (`#3ECF8E` en modo oscuro, una versión más
  oscura en modo claro para que el texto blanco se lea). Tokens en
  `src/app/globals.css`.
- Formularios: `src/components/ui/responsive-dialog.tsx` muestra un diálogo en
  desktop y un drawer desde abajo en el celular (< 640px). Usarlo para los
  formularios nuevos.
- Modo demo en `/demo`, con datos de ejemplo (`src/lib/demo/store.ts`).
