# Prompt para crear una app de estimulación cognitiva para mayores (Next.js + React + Tailwind)

## Rol
Actúa como **arquitecto y desarrollador frontend senior**. Construye una aplicación web **100% frontend** enfocada a personas mayores, con juegos de estimulación cognitiva (memoria, colores, reloj/horas, secuencias, etc.). La app debe ser **accesible, muy visual, intuitiva, responsive**, y con **SEO** correcto para posicionamiento rápido.

## Stack y restricciones
- **Next.js (App Router) + React + TypeScript**
- **Tailwind CSS** para estilos
- Sin backend complejo, **sin login**, sin base de datos
- Persistencia local solo con **sessionStorage** (opcionalmente localStorage si se justifica, pero prioriza sessionStorage)
- Librerías gratuitas y open source permitidas (elige licencias permissivas tipo MIT/Apache):
  - **dnd-kit** para drag & drop (MIT)
  - **recharts** para gráficas (MIT)
  - **lucide-react** para iconos (ISC)
- Nada de servicios de terceros que recojan datos del usuario
- Todo debe poder jugarse “al momento” (zero-friction)

## Objetivo de producto
Crear una app llamada provisionalmente **ActivaMente** (nombre editable) que:
- Ofrezca **juegos** con **diferentes dificultades**
- Incluya **logros** (achievements) y **estadísticas** con gráficas
- Guarde progreso y configuraciones de manera local (sessionStorage)
- Sea escalable y mantenible con arquitectura limpia y buenas prácticas

---

## UX/UI (prioridad alta)
### Principios
- **No infantilizar**: estética moderna, limpia, calmada y “amable”.
- **Legibilidad extrema**:
  - Tipografía grande por defecto (mínimo 18px en texto base)
  - Alto contraste, botones grandes, espaciado generoso
  - Evitar información densa; frases cortas y claras
- **Accesibilidad**:
  - Navegable con teclado (tab/enter/space)
  - Roles ARIA donde proceda
  - Focus visible
  - Preferencias del usuario: modo alto contraste y tamaño de texto (opciones dentro de la app)
  - Soporte de `prefers-reduced-motion` (animaciones suaves y opcionales)
- **Feedback inmediato**:
  - Sonidos opcionales (toggle) y vibración NO (web no fiable)
  - Confirmaciones claras (acierto/error) con icono + texto
- **Sin fricción**:
  - Home con CTA claro: “Jugar ahora”
  - No pedir datos personales
- **Responsive**:
  - Mobile first, pero diseñado para tablets (muy común en mayores)
  - Controles fáciles de pulsar (mín 44x44)

### Estilo visual sugerido
- Cards grandes con iconos + título + descripción corta
- Colores suaves con alto contraste
- Animaciones ligeras (Framer Motion opcional y con reduced-motion)

---

## SEO y rendimiento (Next.js)
### Requisitos SEO
- App Router con `metadata` por página:
  - Title, description, keywords
  - OpenGraph y Twitter cards
- Estructura de rutas semántica:
  - `/` (Home)
  - `/juegos` (listado)
  - `/juegos/[slug]` (juego)
  - `/estadisticas`
  - `/logros`
  - `/ajustes`
  - `/legal/privacidad`, `/legal/cookies`, `/legal/aviso-legal`
- Contenido textual mínimo en Home y páginas informativas para SEO (sin relleno, pero suficiente)
- Uso correcto de headings (H1 único por página)
- Optimización:
  - Componentes client solo donde haga falta
  - Imágenes optimizadas con `next/image` (si se usan)
  - Cargar librerías pesadas solo en páginas que las requieran (dynamic import)

---

## Arquitectura y organización (limpia, escalable)
### Estructura sugerida
```
src/
  app/
    layout.tsx
    page.tsx
    juegos/
      page.tsx
      [slug]/
        page.tsx
    estadisticas/page.tsx
    logros/page.tsx
    ajustes/page.tsx
    legal/
      privacidad/page.tsx
      cookies/page.tsx
      aviso-legal/page.tsx
  components/
    ui/...
    layout/...
    games/...
    charts/...
  features/
    achievements/
    stats/
    settings/
    games/
  lib/
    storage/
    utils/
    seo/
  styles/
  content/
    games.ts
    achievements.ts
```

### Reglas
- Mantener separación clara:
  - **UI components** (presentacionales)
  - **features** (lógica de dominio por área)
  - **lib** (helpers: storage, utils)
- Un “Game Engine” ligero:
  - Definir una interfaz común para juegos (ver más abajo)
  - Permitir añadir juegos sin romper los existentes

---

## Estado, persistencia y datos locales
### Qué guardar en sessionStorage
- Nivel/dificultad elegida por juego
- Historial resumido de partidas (últimos N intentos por juego)
- Estadísticas agregadas:
  - partidas jugadas
  - aciertos/errores
  - rachas
  - tiempos promedio (si aplica)
- Logros desbloqueados
- Ajustes de accesibilidad:
  - tamaño de letra
  - alto contraste
  - sonido on/off
  - modo sin animaciones

### Implementación
- Crear un wrapper robusto `storage`:
  - `get<T>(key, fallback)`
  - `set<T>(key, value)`
  - `update<T>(key, fn)`
  - Manejo de errores (si sessionStorage no está disponible)
- Versionado simple del estado (para migraciones futuras):
  - `APP_STATE_VERSION = 1`

---

## Componentes clave
- **Header** simple con:
  - Logo/nombre
  - Navegación: Juegos, Estadísticas, Logros, Ajustes
- **Footer** básico obligatorio con enlaces:
  - Privacidad, Cookies, Aviso Legal
  - “Creado por: **Jose Luis Diaz Garcia**”
  - Enlaces a:
    - Instagram
    - TikTok
    - LinkedIn
    - Blog: diginurs3
  > Usa URLs placeholder configurables en un archivo `src/lib/constants.ts` (p.ej. `SOCIAL_LINKS`).

---

## Juegos (lista inicial + comportamiento)
Incluye al menos **8 juegos** con 3 dificultades (Fácil/Media/Difícil). Cada juego debe:
- Tener instrucciones claras (1-2 frases)
- Duración corta (30–120s por ronda)
- Reintento instantáneo
- Accesible (tamaños grandes, drag & drop con fallback)

### 1) Reloj: “Marca la hora”
**Objetivo:** reforzar lectura de hora y atención.
- Muestra un reloj analógico (con números grandes) y una consigna: “Pon las **11:10**”.
- Interacción:
  - Fácil: selección de hora en reloj digital tipo rueda (HH:MM) + confirmación.
  - Media: drag de manecillas (dnd-kit) para colocarlas.
  - Difícil: sin ayudas; validar ángulo aproximado.
- Puntuación: +1 por correcto; penalización suave por intentos.

### 2) Memoria visual: “Encuentra las parejas”
**Objetivo:** memoria a corto plazo.
- Grid de cartas (iconos/imagenes grandes).
- Fácil: 6 cartas (3 parejas)
- Media: 12 cartas (6 parejas)
- Difícil: 16–20 cartas (8–10 parejas)
- Métrica: tiempo y número de intentos.

### 3) Secuencias: “Completa el patrón”
**Objetivo:** razonamiento y atención.
- Presenta una secuencia simple (colores, formas o números) con un hueco.
- El usuario elige la pieza correcta de 3–6 opciones.
- Dificultad:
  - Fácil: patrones alternos (ABAB)
  - Media: ABB / AAB / ABC
  - Difícil: patrones más largos y distractores

### 4) Colores: “Color correcto”
**Objetivo:** atención e inhibición.
- Muestra una palabra de color (“ROJO”) pintada de otro color (azul).
- El usuario debe pulsar el **color del texto** (no la palabra).
- Fácil: 2–3 colores, sin límite de tiempo
- Media: 4 colores, tiempo suave
- Difícil: 5–6 colores, ritmo más rápido (pero no agresivo)

### 5) Comprensión espacial: “Encaja la figura”
**Objetivo:** visoespacial.
- Tipo puzzle: arrastrar 3–8 piezas grandes a su silueta.
- Dificultad por número de piezas y rotación:
  - Fácil: sin rotación
  - Media: rotación en 90°
  - Difícil: rotación libre (opcional) o más piezas

### 6) Atención: “Encuentra el intruso”
**Objetivo:** atención selectiva.
- Muestra una fila/cuadrícula de elementos casi iguales y 1 diferente.
- El usuario toca el diferente.
- Dificultad: tamaño de grid y similitud.

### 7) Memoria auditiva opcional (sin depender de TTS)
**Objetivo:** memoria de trabajo.
- Reproduce sonidos simples (campana, palmada) o tonos generados localmente (WebAudio).
- El usuario repite la secuencia pulsando botones.
- Si no se usa audio, fallback visual: “Simón dice” con luces.

### 8) Rutinas: “Ordena el día”
**Objetivo:** secuenciación y orientación.
- Arrastrar tarjetas de acciones (desayunar, ducharse, paseo, comida, siesta…) para ordenarlas.
- Fácil: 4 pasos
- Media: 6 pasos
- Difícil: 8 pasos + distractores opcionales

> Importante: No uses contenido sensible ni referencias médicas directas a diagnóstico. Enmarca como **entrenamiento mental/estimulación cognitiva**.

---

## Dificultad y progresión
- Cada juego tiene selector de dificultad.
- La app sugiere subir/bajar dificultad según rendimiento:
  - Si 3 partidas seguidas con >85% acierto → sugerir subir
  - Si 3 partidas seguidas con <50% → sugerir bajar
- Estas sugerencias deben ser **no intrusivas** (un toast o banner suave).

---

## Logros (achievements)
Implementa logros locales, por ejemplo:
- “Primera partida” (jugar 1 vez)
- “Constancia” (jugar 5 días distintos — usando fecha local en sessionStorage)
- “Racha” (3 victorias seguidas en un juego)
- “Explorador” (probar 5 juegos distintos)
- “Maestría” (ganar en difícil en 3 juegos)

Cada logro:
- id, título, descripción, icono
- condición basada en stats locales
- estado: locked/unlocked + fecha

---

## Estadísticas (dashboard)
Página `/estadisticas` con:
- Resumen:
  - partidas totales
  - tiempo total (si se mide)
  - acierto medio
- Por juego:
  - partidas, % acierto, mejor tiempo
- Gráficas con Recharts:
  - Línea: partidas por día (últimos 14–30 días)
  - Barras: acierto por juego
- Botón: “Reiniciar estadísticas” (con confirmación)

---

## Ajustes (accesibilidad)
Página `/ajustes` con toggles:
- Tamaño de texto: Normal / Grande / Muy grande
- Alto contraste: On/Off
- Sonidos: On/Off
- Animaciones: On/Off (respeta prefers-reduced-motion)
- Mano dominante (opcional): UI adaptada para botones principales a izquierda/derecha

---

## Legal (plantillas simples)
Crear páginas con texto básico, claro y corto (sin afirmaciones falsas):
- Privacidad: indicar que no se recopilan datos personales, no hay cuentas, no hay tracking de terceros; solo almacenamiento local en el navegador.
- Cookies: indicar que no se usan cookies de seguimiento; explicar que podría usarse almacenamiento del navegador (sessionStorage) para guardar preferencias/progreso.
- Aviso legal: titularidad, finalidad informativa/entrenamiento, no sustituye consejo médico.

Incluye en el footer enlaces a:
- `/legal/privacidad`
- `/legal/cookies`
- `/legal/aviso-legal`

---

## Interfaz de juegos (para escalabilidad)
Define una interfaz común tipo:
- `GameDefinition`:
  - `slug`, `title`, `shortDescription`, `category`, `difficulties`
  - `component` (lazy import)
  - `metrics` que reporta (accuracy, timeMs, attempts)
- Cada juego emite `GameResult` al finalizar:
  - `gameSlug`, `difficulty`, `score`, `accuracy`, `timeMs`, `meta`
- Un `useGameSession` hook para:
  - iniciar sesión
  - registrar eventos
  - finalizar y persistir stats/logros

---

## Calidad: pruebas y buenas prácticas
- TypeScript estricto
- ESLint sin warnings
- Componentes pequeños y reutilizables
- Utilizar `clsx` o `tailwind-merge` para clases (si se necesita)
- Tests opcionales (Vitest/RTL) al menos para:
  - storage wrapper
  - cálculo de stats
  - evaluación de logros

---

## Entregables
1) Código funcionando con Next.js (App Router) y Tailwind.
2) Home atractiva y clara:
   - Hero + “Jugar ahora”
   - Listado de juegos con filtros (Memoria, Atención, Tiempo, Espacial)
3) Mínimo 8 juegos implementados (o 6 si el tiempo es limitado, pero deja la arquitectura preparada para añadir más).
4) Logros + página de logros.
5) Estadísticas + gráficas.
6) Ajustes de accesibilidad.
7) Footer con legal + redes + “Creado por: Jose Luis Diaz Garcia”.
8) SEO básico y performance decente (LCP bajo, evitar client components innecesarios).

---

## Texto de marca (copiable)
- Nombre: **ActivaMente**
- Claim: “Juegos sencillos para mantener la mente activa.”
- Descripción corta: “Entrena memoria, atención y orientación con ejercicios visuales y fáciles de usar, pensados para personas mayores.”

---

## Notas finales
- Mantén todo en **español** por defecto.
- No hagas promesas médicas (“retarda Alzheimer”); usa lenguaje responsable: “estimulación”, “entrenamiento”, “mantenerse activo”.
- Prioriza UX de mayores: botones grandes, poca carga cognitiva, feedback claro.

**Construye la app completa siguiendo estas especificaciones.**
