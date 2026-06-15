# Changelog

## [Unreleased]

## [1.1.0] — 2026-06-15 (versionCode 2)

### Dependencias
- **React Native 0.84.1 → 0.86.0** + react 19.2.7 + `@react-native/*` 0.86 (babel-preset, metro-config, jest-preset, eslint-config, typescript-config). Breaking change de RN 0.86: `StyleSheet.absoluteFillObject` removido (fusionado en `absoluteFill`) → renombrado en CursoScreen/Onboarding/Premium. Validado: tsc 0, jest 31/31, lint 0 err, build nativo freeDebug OK. ⚠️ El build nativo requiere **compilación serial** (`--max-workers=1` + `CMAKE_BUILD_PARALLEL_LEVEL=1`) en máquinas con ≤16 GB y muchos cores (ver troubleshooting)
- **TypeScript 5.9 → 6.0.3**, **async-storage 2.2 → 3.1.1** (+ fix del mock de jest, ESM-only), **prettier 2.8 → 3.8.4** (+ reformateo del codebase, churn mínimo)
- Updates seguros dentro de rango: react-navigation 7.3/7.17/7.18, react-native-screens 4.25.2, safe-area-context 5.8.0, babel 7.29.7, @types/react 19.2.17
- **Diferidos** (incompatibles con el toolchain de RN 0.84/0.86): jest 30 (el preset `react-native` arrastra jest 29), eslint 10 (flat-config-only vs `.eslintrc` de `@react-native/eslint-config`)

### Contenido clínico
- **Auditoría completa del contenido teórico** (10 módulos / 56 subtemas leídos línea por línea): información correcta y vigente. **5 imprecisiones corregidas**: RCP niño ≈5 cm (M9.2, antes 4 cm), escala de flebitis 0-5 con conducta (M5.3, antes mal numerada 1-5), UPP + "lesión de tejidos profundos" y renombrado NPIAP 2019 (M6.5), nota de variación jurisdiccional en residuos (M4.4), nota ESC/ESH vs ACC/AHA en clasificación de TA (M3.1)
- **9 subtemas de procedimientos nuevos** (carril método/info, con crosslinks a Patologías/Farmacológica): Modelos y teorías de enfermería — Henderson/Gordon (M1), Prevención de caídas y contención (M4), Posiciones del paciente, Movilización y mecánica corporal, Curación de heridas y apósitos, Glucemia capilar, Nutrición enteral y Balance hídrico (M7), Transfusión de hemoderivados (M8)
- **Enriquecimiento pedagógico (lente docente)**: cada módulo abre con un subtema **🎯 Objetivos del módulo** (competencias) y cierra con **📌 Lo esencial para llevarte** (takeaways). Total: **56 → 85 subtemas, 178 → 258 bloques**

### Added
- **Micro-interacciones modernas (UX/UI)**: nuevo componente `PressableScale` (rebote spring al presionar con `transform: scale` + native driver, reenvía accesibilidad/hitSlop/disabled) y `FadeInView` (entrada fade + translateY con stagger configurable, native driver). Aplicados a todas las superficies táctiles del flujo principal — tarjetas de módulo, continue/recent cards, botones del hero, read-toggle, crosslink, back buttons y "Limpiar búsqueda" de Buscador/Glosario. Reemplazan a `TouchableOpacity` (que solo cambiaba opacidad)
- **ProgressBar animada**: el relleno se llena con `Animated.timing` (650 ms) al montar y ante cualquier cambio de progreso — antes aparecía lleno de golpe. Misma API pública. Da feedback satisfactorio al marcar un subtema como leído (barras de módulo y hero se llenan)
- **Hero del home modernizado**: entrada escalonada de las tarjetas de módulo (delay por índice), profundidad decorativa (dos "blobs" suaves detrás del contenido), saludo consciente del progreso (`EMPECEMOS 👋` / `SEGUÍ APRENDIENDO` / `¡CURSO COMPLETO! 🎉`) y botones de acción con borde glass sutil
- **Glosario enriquecido (+33 términos)**: 33 entradas clínicas del glosario (de 178) sumaron secciones `Tipos` y `Ejemplos clínicos`, replicando el estilo de las ya enriquecidas (Astenia/Disnea). Cobertura: cardiorrespiratorio (IAM, ICC, EAP, ACV, HTA, EPOC), paro/ritmos (FV, TV, BAV, AESP, PCR), urológico/UPP/infeccioso (ITU, UPP, TEP, TBC, SARM, SAOS, OVACE), PAE y taxonomías (PAE, NANDA, NIC, NOC, SOAPIE), examen físico (Apex cardíaco, Murmullo vesicular, Vómito en proyectil) y accesos/dispositivos (SNG, NPT, CVC, PVC, PEG, FAV, VNI). Entradas con `tipos` 77 → 110, con `ejemplos` 81 → 114, sin enriquecer 97 → 64. Las siglas de procedimiento/institución/unidad (ABCDE, ACLS, SBAR, OPQRST, CDC, OMS, EPP, AMBU, UI, escalas de dolor, vías de administración) se dejaron sin `tipos`/`ejemplos` por no aportar valor clínico
- **Indicador de progreso de lectura** en CursoModuloScreen: barra fina bajo el header que se llena con el scroll (scaleX + native driver)
- **Contador de resultados**: header "N resultados" en el Buscador y subtítulo dinámico "N de 178 términos" en el Glosario al filtrar
- **Empty states con acción**: sin-resultados de Buscador y Glosario ahora muestran ícono en círculo, sugerencia y botón "Limpiar búsqueda"
- **Candado premium claro** en la lista de módulos: scrim oscuro sobre la foto + mensaje "Contenido Premium — desbloquealo con PRO" con candado (antes solo un badge PRO chico)
- **Loading del navigator**: ActivityIndicator centrado mientras carga el estado de onboarding (antes pantalla vacía)
- **Estado "módulo no encontrado" útil** en CursoModuloScreen: ícono, mensaje y botón Volver
- **CI con GitHub Actions** (`.github/workflows/ci.yml`): typecheck + ESLint + Jest en push/PR a `main`

### Changed
- **Términos en inglés glosados al español** en SBAR, OPQRST y ABCDE (Módulos 9-10) y en las mismas siglas del glosario: formato `Inglés (Español)` que conserva el acrónimo y agrega la traducción — ej. `Situation (Situación)`, `Airway (Vía aérea)`, `Onset (Inicio)`. Corrige la inconsistencia de que SOAPIE ya estaba traducido pero SBAR/OPQRST no. También en glosario: SBAR, OPQRST y FAST
- **Tipografía de lectura** en CursoModuloScreen: cuerpo 15/24 (line-height 1.6×), jerarquía sub (18) > h4 (16) > cuerpo (15) > tablas (12.5); bullets alineados al line-height; espaciado vertical consistente entre bloques y subtemas
- **Cards destacadas** (insight/tip/alert/warn) muestran su emoji identificador (estaba definido en `CARD_STYLES` pero sin renderizar)
- **Contraste WCAG de `textLight`**: light `#9BA4B5` (2.4:1) → `#67738C` (4.5:1); dark `#636E83` (2.9:1) → `#8C96AD` (5:1)
- **Accesibilidad transversal**: `accessibilityRole`/`Label`/`State` y `hitSlop` en todos los touchables de las 11 pantallas (cards de módulos, botones del hero, chips de tema, modal de activación, back buttons, Onboarding, MiSuite, Premium); "Omitir" del Onboarding deshabilitado en la última slide
- **StatusBar explícito** (light-content sobre headers con gradiente) en Settings y About
- **Estilos a `StyleSheet.create`** (factory memoizada por tema/escala) en CursoModuloScreen, CursoScreen, GlosarioScreen y BuscadorScreen: warnings de inline-styles 273 → 132 (los 60 de `no-bitwise` en `activation.ts` son intencionales)
- **premiumLogic extraído a módulo puro** (`src/utils/premiumLogic.ts`): `computeTrialDaysLeft` / `computeIsPremium` / `computeTrialExpired` con guard de corrupción (NaN/Infinity → 0 días, fail-closed) y clamp superior (retroceder el reloj no extiende el trial). Storage corrupto re-inicializa el trial en el load. 22 tests nuevos (`__tests__/premiumLogic.test.ts`)

### Fixed
- **Activación premium case-insensitive**: el código de activación distinguía mayúsculas/minúsculas, pero el input fuerza `autoCapitalize="characters"` → un usuario tipeando el código obtenía mayúsculas y la validación fallaba (el código tiene case mixto). Ahora `validateActivationCode` normaliza con `trim().toLowerCase()` (nueva función pura `normalizeActivationCode`) y el `ACTIVATION_HASH` se computa sobre el código en minúsculas → el código funciona en cualquier capitalización. 8 tests nuevos (`__tests__/activation.test.ts`) que cubren la normalización sin escribir el código real en el repo. Verificado en runtime con el SHA-256 propio de la app
- `headerBackground` del navigator recreaba el componente en cada render (`react/no-unstable-nested-components`) → componente estable `HeaderGradientBackground`
- **Monetización heredada de Patologías**: `PLAY_STORE_URL` apuntaba al listing de Patologías → ahora `com.cursoenfermeria.free`; SKU `patologias_premium_monthly` → `curso_premium_monthly` (pendiente crearlo en Play Console); PremiumScreen vendía features de Patologías inexistentes (quiz, escalas, NANDA, dashboard) → listas veraces (10 módulos, 56 subtemas, 178 bloques, glosario 178, buscador, progreso, dark mode, offline); PrivacyPolicy con nombre de app corregido
- **ErrorBoundary auto-crash**: el fallback usaba `useTheme()` estando por fuera de `ThemeProvider` → al capturar un error lanzaba y dejaba pantalla blanca. Ahora usa paleta light estática + `componentDidCatch` con `console.error`
- **Restaurar compra sin feedback**: si fallaba no mostraba nada → banner "No se encontró una suscripción activa" + spinner durante la restauración

### Removed
- 5 dependencias sin uso: `@op-engineering/op-sqlite`, `@shopify/flash-list`, `@react-native-clipboard/clipboard`, `react-native-svg`, `@react-native/new-app-screen`
- Código muerto heredado de Patologías: scripts `add_patho_batch1-5.py`, `add_patho_trauma.py`, `add_trauma_batch2.py`, `enrich_nanda.js`; componentes sin imports `PremiumGate`, `CollapsibleSection`, `ContentContainer`, `Skeleton`, `utils/animations`, `utils/typography`
- `console.log` de debug en App.tsx y useOnboarding

### Docs
- CLAUDE.md y ARCHITECTURE.md reescritos para esta app (describían íntegramente Patologías); README con conteos reales (glosario 178, estructura sin `src/config/`)

---

## [1.0.0] — 2026-05-06 (Manual de Enfermería · release inicial)

### Branding
- App renombrada de "Curso de Enfermería" a **Manual de Enfermería**
- `app_name` actualizado en `strings.xml`, `app.json`, hero del home, Onboarding slide 1, About, Privacy/Terms, MiSuite
- Identifiers de código (CursoScreen, curso.json, useCursoProgress, hook names) preservados — solo cambian textos visibles al usuario

### Added
- **Modo oscuro completo** con 3 modos (Claro / Oscuro / Sistema) y selector de chips en Settings
- Botón de configuración (cog) en hero del home — antes SettingsScreen estaba registrada pero inalcanzable
- ErrorBoundary ahora consume `useTheme` (UI extraída a `ErrorFallback` functional)
- ROADMAP.md con plan de v1.0 → v2.0

### Fixed
- PrivacyPolicy item 1/2 mencionaba "Patologías de Enfermería" y datos que no aplican (favoritos, notas, quiz). Reescrito con datos reales del Manual: progreso de lectura, módulos visitados, onboarding
- Terms item 1 con nombre actualizado
- About título y descripción actualizados

### Versioning
- `versionCode 1` · `versionName "1.0.0"` (build.gradle:85-86)
- Esta es la versión que va a Play Store como release inicial

---

## [pre-1.0] — 2026-05-05 (Curso Integral de Enfermería)

### Added
- **Curso de Enfermería**: nueva sección con 10 módulos integrales (51 subtemas) accesible desde la pestaña Herramientas
  - Módulo 1: Fundamentos (definición, niveles, roles, PAE, bioética) — gratis
  - Módulo 2: Anatomía y constantes (12 sistemas, aire, valores normales adulto/pediátrico) — gratis
  - Módulo 3: Signos vitales (TA, FC, FR, T°, SatO₂, dolor) — premium
  - Módulo 4: Bioseguridad (lavado de manos, EPP, aislamientos, residuos) — premium
  - Módulo 5: Equipamiento (O₂, AMBU, vías, sondas, drenajes, monitor) — premium
  - Módulo 6: Patologías por sistema (cardio, respiratorio, digestivo, renal, neuro, endocrino, UPP) — premium
  - Módulo 7: Técnicas (canalización, sondaje, SNG, aspiración, IM/SC, cálculo de dosis y goteo) — premium
  - Módulo 8: Farmacología (analgésicos, ATB, cardio, vasoactivos, insulinas) — premium
  - Módulo 9: Emergencias (RCP, ACLS, shock, anafilaxia, ABCDE) — premium
  - Módulo 10: Comunicación (SOAPIE, SBAR, NANDA P-E-S, SMART) — premium
- **CursoScreen**: lista de módulos con tarjetas hero de 160 dpi, gradientes y badges premium/número
- **CursoModuloScreen**: renderer de módulo con bloques (párrafo, h4, lista, ordenada, card insight/tip/alert/warn, tabla con scroll horizontal, grid)
- **`src/data/curso.json`**: contenido estructurado de los 10 módulos en JSON (1300+ líneas, ~50 tablas)
- **`src/types/curso.ts`**: discriminated unions para bloques tipados
- **`src/utils/cursoImages.ts`**: mapeo de imageKey → assets bundleados
- **`curso-enfermeria.html`** (raíz): prototipo navegable del contenido (preview rápido sin necesidad de instalar la APK)
- **`selector-imagenes.html`** (raíz): herramienta de selección visual de imágenes desde Pexels/Unsplash con localStorage y exportación a script bash

### Changed
- **ToolsScreen**: nueva tarjeta "Curso de Enfermería" agregada como primera opción (gratis para los 2 primeros módulos)
- **AppNavigator**: registradas rutas `CursoScreen` y `CursoModulo` en el stack
- **types/index.ts**: agregadas dos rutas al `RootStackParamList`

## [2.0.0] — 2026-03-29 (Hyper-Optimization Update)

### Added
- **Base de Datos SQLite**: Todo el sistema de carga JSON fue rediseñado. Los JSONs ahora fungen como semilla; `db.ts` inyecta todo en una tabla local.
- **Rendimiento a 60 FPS garantizado**: Pantallas pesadas migradas de `FlatList` a `@shopify/flash-list`.
- **Seguridad Premium**: Persistencia Premium reemplazada por `react-native-encrypted-storage` (Keystore nativo de Android).
- **Hooks rediseñados**: `usePathologyData` y `usePathologySearch` extraen mediante JSI directo en C++.
- **Memoización Profunda**: Optimizadas todas las cabeceras `useMemo` en Contextos como `ThemeContext` previendo render cycles.

## [1.1.0-dev] — 2026-03-27

### Added
- **Quiz educativo**: tras cada respuesta el usuario ve explicaciones enriquecidas con "¿Sabías que...?" (definición clínica), "Dato clave" (epidemiología, fármacos, valores de referencia), y botón para ver la patología completa. En el resumen final, sección "Revisar errores" muestra cada pregunta fallada con explicación detallada y links para estudiar
- **Diagnóstico diferencial interactivo**: nueva pantalla DifferentialScreen donde el usuario selecciona síntomas y ve patologías rankeadas por porcentaje de coincidencia. Incluye filtro por sistema corporal y badges de nivel de emergencia
- **Hook useDifferentialDiagnosis**: construye índice de síntomas a partir de las 151 patologías y calcula matching en tiempo real
- **Campo videoUrl en Pathology**: soporte para enlazar videos educativos de YouTube por patología (implementación visual futura)
- **13 tests unitarios**: 12 tests para lógica de quiz + 1 smoke test de App. Mocks completos para react-navigation, linear-gradient, safe-area-context, vector-icons
- **Scripts de utilidad**: enrich_nanda.js y fix_tildes.js para enriquecimiento de datos

### Changed
- **Visual upgrade masivo**: migración de íconos vectoriales a fotos clínicas reales como elementos visuales principales en HomeScreen (quick actions con fotos), OnboardingScreen (slides full-screen con fotos clínicas), QuizScreen (chips con thumbnails de sistemas), ScalesScreen, ToolsScreen, tabs
- **OnboardingScreen rediseñada**: slides con ImageBackground + gradientes de color por slide, estadísticas destacadas, diseño inmersivo full-screen
- **HomeScreen mejorada**: fondo decorativo con gradientes y círculos difuminados, quick actions con fotos clínicas de fondo, toggle dark mode con emoji
- **Tab bar mejorado**: animaciones pill con spring, indicadores de foco más sutiles
- **4 imágenes de sistemas actualizadas**: inmunológico, reproductivo, tegumentario, traumatológico — fotos clínicas de mayor calidad
- **Datos enriquecidos**: body_systems.json y lab_values.json con valores adicionales

## [1.0.0] — 2026-03-26

### Added
- 151 patologías clínicas organizadas en 12 sistemas corporales
- Información NANDA-NIC-NOC para cada patología
- 20 pantallas completas con diseño hero (fotos + gradientes)
- Quiz interactivo con 8 tipos de preguntas y resultados persistentes
- 17 escalas clínicas con calculadora interactiva y fotos por categoría
- Valores de laboratorio con rangos normales e implicaciones de enfermería
- Protocolos de emergencia paso a paso
- Sistema de favoritos y notas personales
- Búsqueda full-text con scoring y historial
- Onboarding de 3 slides para primera vez
- Modo oscuro (light/dark/system)
- 34 fotos médicas reales de Unsplash (12 sistemas + 13 condiciones + 9 escalas)
- HomeScreen con hero cards, gradientes y search integrado
- SystemsScreen con grid de fotos por sistema corporal
- ScalesScreen con carrusel "Más utilizadas" y cards con fotos clínicas
- ToolsScreen con grid de fotos y gradientes por herramienta
- Tab bar animado que se oculta al scrollear en todas las pantallas

### Premium System
- Trial de 15 días con acceso completo
- Banner "Período de prueba" visible durante el trial
- Bloqueo de contenido premium al expirar trial
- Suscripción mensual vía Google Play (`patologias_premium_monthly`)
- Activación por código (Settings > Version x5 > ingreso de código)
- PremiumGate con mensaje de expiración y botón de suscripción
- Flavor `free` (con restricciones) y `premium` (todo desbloqueado)

### Technical
- React Native 0.84.1 + TypeScript 5.8
- New Architecture (Fabric + TurboModules)
- Android SDK 24-36, Gradle 9
- Pre-bundled JS en assets (workaround Metro bug Windows)
- SHA-256 puro en JS para validación de códigos de activación
- JDK 21 (Android Studio JBR) requerido para builds

### Play Store
- AAB generado (45 MB)
- Ficha completa (título, descripción corta/completa, tags)
- Política de privacidad HTML
- Clasificación de contenido IARC preparada
- Ícono 512x512 y feature graphic 1024x500 (SVG)
- Instrucciones de publicación paso a paso
- Plan de actualizaciones de 12 meses
