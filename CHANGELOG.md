# Changelog

## [Unreleased]

### Fixed
- **Monetización heredada de Patologías**: `PLAY_STORE_URL` apuntaba al listing de Patologías → ahora `com.cursoenfermeria.free`; SKU `patologias_premium_monthly` → `curso_premium_monthly` (pendiente crearlo en Play Console); PremiumScreen vendía features de Patologías inexistentes (quiz, escalas, NANDA, dashboard) → listas veraces (10 módulos, 56 subtemas, 178 bloques, glosario 178, buscador, progreso, dark mode, offline); PrivacyPolicy con nombre de app corregido
- **ErrorBoundary auto-crash**: el fallback usaba `useTheme()` estando por fuera de `ThemeProvider` → al capturar un error lanzaba y dejaba pantalla blanca. Ahora usa paleta light estática + `componentDidCatch` con `console.error`
- **Restaurar compra sin feedback**: si fallaba no mostraba nada → banner "No se encontró una suscripción activa" + spinner durante la restauración

### Changed
- **premiumLogic extraído a módulo puro** (`src/utils/premiumLogic.ts`): `computeTrialDaysLeft` / `computeIsPremium` / `computeTrialExpired` con guard de corrupción (NaN/Infinity → 0 días, fail-closed) y clamp superior (retroceder el reloj no extiende el trial). Storage corrupto re-inicializa el trial en el load. 22 tests nuevos (`__tests__/premiumLogic.test.ts`)

### Removed
- 5 dependencias sin uso: `@op-engineering/op-sqlite`, `@shopify/flash-list`, `@react-native-clipboard/clipboard`, `react-native-svg`, `@react-native/new-app-screen`
- Código muerto heredado de Patologías: scripts `add_patho_batch1-5.py`, `add_patho_trauma.py`, `add_trauma_batch2.py`, `enrich_nanda.js`; componentes sin imports `PremiumGate`, `CollapsibleSection`, `ContentContainer`, `Skeleton`, `utils/animations`, `utils/typography`
- `console.log` de debug en App.tsx y useOnboarding

### Added
- **CI con GitHub Actions** (`.github/workflows/ci.yml`): typecheck + ESLint + Jest en push/PR a `main`

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
