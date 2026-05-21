# Registro de Progreso — Manual de Enfermeria

> **Politica**: Este documento se actualiza en CADA sesion donde se realice cualquier modificacion o actualizacion. Registra que se hizo, cuando, y el estado resultante.

---

## 2026-05-21 — Sesion 8: v1.1 quick wins (cleanup + scroll-to-sub + highlight)

### Resumen
Tres items del milestone v1.1 cerrados en orden de ROI ascendente:

1. **Limpieza de herencia de Patologías + fix 3 TS errors**: eliminado `src/components/EmergencyBadge.tsx` (sin consumidores) y 8 exports muertos en `src/utils/colors.ts` (`BODY_SYSTEM_*`, `EMERGENCY_LEVEL_*`, `SCALE_*`, `LAB_*`, `PROTOCOL_*`). El archivo pasa de 207 a 102 líneas. Migrado storage key `@patologias_theme` → `@manual_theme` con lectura legacy de respaldo para no romper usuarios existentes (mismo patrón que `activation.ts`). `npx tsc --noEmit` → 0 errores.

2. **Scroll-to-sub en `CursoModuloScreen`**: el productor (`BuscadorScreen` + tipo en `RootStackParamList`) ya estaba listo desde v1.0. Implementado el consumidor con `findNodeHandle` + `measureLayout` + `scrollTo` enganchado al `onLayout` del sub target. `pendingSubIdRef` se vacía después del primer scroll para evitar re-scrolls al cambiar el estado leído/no-leído.

3. **Highlight de matches en `BuscadorScreen`**: componente `HighlightedText` con mapeo posicional normalizado→original — resuelve el problema de que la búsqueda es accent-insensitive pero el texto a resaltar conserva diacríticos. Aplicado a sigla, definición (glosario), subTitle y preview (subtemas). Usa el token `colors.searchHighlight` que ya existía en `colors.ts`.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/components/EmergencyBadge.tsx` | **Eliminado** (dead code, sin consumidores) |
| `src/utils/colors.ts` | Removidos 8 exports legacy (-105 líneas); ahora solo tokens de tema |
| `src/context/ThemeContext.tsx` | Migración `@patologias_theme` → `@manual_theme` con `isValidMode` helper |
| `src/screens/CursoModuloScreen.tsx` | Scroll-to-sub: ref a ScrollView, refs por sub, `measureLayout` en onLayout |
| `src/screens/BuscadorScreen.tsx` | `findMatchRanges` + componente `HighlightedText` aplicado a 4 campos |
| `ROADMAP.md` | Items v1.1 marcados como done + nota sobre Sentry inexistente |

### Verificación

- `npx tsc --noEmit` → **0 errores** (antes: 3)
- `npx jest` → 1 failed (pre-existente: falta mock de `react-native-encrypted-storage` en `jest.setup.js`, confirmado corriendo en HEAD limpio)
- Smoke test pendiente en device/emulador

### Pendiente / próximos pasos v1.1

- Mock de `react-native-encrypted-storage` en jest.setup.js (10 min)
- Tablet layout consumiendo `isTablet` en hero/grids
- Sentry instalación real (estaba en ROADMAP como "scaffolded" pero no había código)
- Crash analytics local
- Auditoría a11y (solo 9 `accessibilityLabel/Role` en 11 screens)
- E2E con Maestro

---

## 2026-05-06 — Sesion 7: Modo oscuro completo + rebrand a "Manual de Enfermería"

### Resumen
1. **Modo oscuro auditado y reforzado**: el `ThemeContext` ya soportaba light/dark/system con AsyncStorage. Faltaba que el toggle de Settings expusiera los 3 modos (era Switch binario) y que el `ErrorBoundary` adoptara el tema. Agregado tambien boton de Configuracion en el hero (estaba registrada pero inalcanzable).
2. **Rebrand**: la app pasa de "Curso de Enfermería" a **"Manual de Enfermería"** en todos los textos visibles al usuario y en el launcher Android. Identifiers de codigo (CursoScreen, curso.json, useCursoProgress) se conservan.
3. **Bugfix de contenido**: PrivacyPolicy item 1/2 mencionaba "Patologías de Enfermería" y datos que no aplican a esta app (favoritos, notas, quiz). Reescrito para reflejar progreso de lectura, modulos visitados y onboarding.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/screens/SettingsScreen.tsx` | Switch binario → 3 chips (Claro/Oscuro/Sistema) con leyenda dinamica |
| `src/components/ErrorBoundary.tsx` | Class component con UI extraida a `ErrorFallback` (functional + useTheme) |
| `src/screens/CursoScreen.tsx` | 4to boton "cog-outline" en hero → SettingsScreen; iconos de hero reducidos a 38dp/20pt para encajar |
| `src/screens/PrivacyPolicyScreen.tsx` | Items 1 y 2 reescritos con datos reales del Manual |
| `src/screens/TermsScreen.tsx` | Item 1 actualizado con nuevo nombre |
| `src/screens/AboutScreen.tsx` | Titulo + descripcion (Manual integral...) |
| `src/screens/CursoScreen.tsx` | Hero title "Manual de Enfermería" |
| `src/screens/MiSuiteScreen.tsx` | App actual `name: 'Manual de Enfermería'` |
| `src/screens/OnboardingScreen.tsx` | Slide 1 title/subtitle |
| `android/app/src/main/res/values/strings.xml` | `app_name` → "Manual de Enfermería" (afecta launcher) |
| `app.json` | `displayName` → "Manual de Enfermería" |

### Auditoria de dark mode (resultado)

| Pantalla | Tema-aware | Notas |
|----------|------------|-------|
| CursoScreen (home) | ✅ | hero gradient + cards isDark |
| CursoModuloScreen | ✅ | Card variants tienen `bgDark/borderDark` propios |
| SettingsScreen | ✅ | Selector 3 chips funciona |
| BuscadorScreen | ✅ | Surface cambia con isDark |
| GlosarioScreen | ✅ | Surface cambia con isDark |
| MiSuiteScreen | ✅ | Surface + status badges OK en ambos modos |
| AboutScreen | ✅ | Verificado en emulador |
| PrivacyPolicyScreen | ✅ | Verificado en emulador |
| TermsScreen | ✅ | usa colors.background |
| OnboardingScreen | n/a | siempre dark sobre gradient (intencional) |
| PremiumScreen | ✅ | white text solo sobre gradient |
| ErrorBoundary | ✅ | ahora consume useTheme (antes hardcoded slate) |

### Verificacion en emulador

- Build: `assembleFreeRelease --no-build-cache` (cache de Hermes invalidado)
- Modo oscuro automatico cuando system theme = dark
- Toggle a "Claro" y "Oscuro" cambia inmediatamente sin restart
- Toggle a "Sistema" muestra leyenda "actualmente oscuro/claro"
- Launcher de Android muestra "Manual de Enfermería" tras reinstall

### Bugs detectados y resueltos
- `SettingsScreen` registrada en navegacion pero sin entry point → agregado boton cog en hero
- ErrorBoundary mostraba background blanco hardcoded en dark mode crash → fix
- PrivacyPolicy mencionaba features de otra app (favoritos/notas/quiz)

---

## 2026-05-05 — Sesion 5: Curso Integral de Enfermería

### Resumen
Nueva seccion educativa "Curso de Enfermería" con 10 modulos integrales (51 subtemas) integrada en la app. Accesible desde la pestaña Herramientas. Modulos 1 y 2 gratis, resto premium.

### Archivos creados

| Archivo | Lineas | Proposito |
|---------|--------|-----------|
| `src/types/curso.ts` | 50 | Discriminated unions para bloques de contenido |
| `src/data/curso.json` | 1300+ | Contenido completo de los 10 modulos en JSON |
| `src/utils/cursoImages.ts` | 27 | Mapeo imageKey → require() de imagenes bundleadas |
| `src/screens/CursoScreen.tsx` | 200 | Lista de modulos con tarjetas hero |
| `src/screens/CursoModuloScreen.tsx` | 290 | Renderer del modulo con BlockRenderer + TableBlock |
| `curso-enfermeria.html` (raiz) | 1100 | Prototipo HTML navegable (preview sin APK) |
| `selector-imagenes.html` (raiz) | 700 | Herramienta visual para elegir imagenes Pexels/Unsplash |

### Archivos modificados

- `src/types/index.ts` — agregadas rutas `CursoScreen` y `CursoModulo` al `RootStackParamList`
- `src/navigation/AppNavigator.tsx` — registradas las 2 nuevas screens (Curso sin header, Modulo con header dinamico)
- `src/screens/ToolsScreen.tsx` — tarjeta "Curso de Enfermería" agregada como primera opción (gratis)

### Tipos de bloques soportados en el renderer

| Tipo | Render |
|------|--------|
| `p` | Parrafo con line-height 22 |
| `h4` | Subheading bold |
| `list` | Bullet list con punto color del modulo |
| `ol` | Lista ordenada con numeros en pill circular |
| `card` | 4 variantes: insight, tip, alert, warn (con dark mode propio) |
| `table` | Tabla con scroll horizontal, header con tinte del modulo, filas zebra |
| `grid` | Grid 2 columnas con cards |

### Verificacion realizada

| Check | Resultado |
|-------|-----------|
| TypeScript (mi codigo) | 0 errores |
| TypeScript (proyecto completo) | 2 errores pre-existentes en SearchScreen y SystemPathologiesScreen (FlashList API), no introducidos por mi |
| Metro bundle JS | OK (escribe bundle sin errores) |
| Tests Jest | Fallo pre-existente en mock de `react-native-encrypted-storage` (no relacionado) |

### Pendiente para proxima sesion

- Descargar las 17 imagenes desde `selector-imagenes.html` y reemplazar placeholders en `cursoImages.ts`
- Build APK release y verificacion en emulador
- Considerar agregar progreso de lectura por modulo (AsyncStorage o SQLite)
- Evaluar agregar quiz por modulo del curso

---

## 2026-03-29 — Sesion 4: Hyper-Optimización y Escalabilidad

### Cambios detallados
- **SQLite Migración:** Se cambió la lectura JSON sincrona a memoria (que llenaba el Heap/RAM del Engine) por una motor nativo `C++ SQLite JSI` (`@op-engineering/op-sqlite`). Se escribieron inyectores para leer las 151 patologías instantáneamente de un fichero real de Base de Datos.
- **Rendimiento UI:** Pantallas con scroll gigante sustituidas por `@shopify/flash-list`.
- **Seguridad:** Los keys premium expuestos en AsyncStorage pasaron a `react-native-encrypted-storage`.

---

## 2026-03-27 — Sesion 3: Quiz educativo + compilacion release

### Commits realizados (3)

| # | Hash | Tipo | Descripcion |
|---|------|------|-------------|
| 1 | `d61dae2` | feat | Transformar quiz en herramienta educativa con feedback enriquecido |
| 2 | `f21736f` | chore | Rebuild del bundle Android |
| 3 | `92a1cab` | docs | Actualizar PROGRESO.md y CHANGELOG con quiz learning feature |

### Cambios detallados

**Quiz educativo — feedback enriquecido por pregunta**
- **"¿Sabías que...?"** (clinicalPearl): muestra la definición clínica de la patología tras cada respuesta
- **"Dato clave"** (keyFact): epidemiología, nivel de emergencia, valores de referencia, o cuidados farmacológicos según el tipo de pregunta
- **"Ver patología completa"**: botón que navega al detalle de la patología para profundizar
- **Explicaciones mejoradas**: incluyen signos/síntomas relacionados, intervenciones de enfermería, dosis farmacológicas, valores de referencia de pruebas diagnósticas, definiciones NANDA con características definitorias

**Resumen de quiz — revisión de errores**
- **"Revisar errores — ¡Aprende!"**: sección expandible que muestra cada pregunta fallada con:
  - Tu respuesta vs respuesta correcta (visual con colores)
  - Explicación completa del por qué
  - Clinical pearl de la patología
  - Botón "Estudiar [patología]" para ir al detalle
- **"Consejo de estudio"**: mensaje motivacional adaptado al porcentaje (>=80%, 60-79%, <60%)

**Tipos actualizados**
- `QuizQuestion` ahora incluye: `pathologyId`, `clinicalPearl?`, `keyFact?`
- `buildClinicalPearl()` y `buildKeyFact()` nuevas funciones en useQuiz.ts

### Compilacion release verificada

| Build | Tamaño | Ruta |
|-------|--------|------|
| Free Release APK | 65 MB | `android/app/build/outputs/apk/free/release/app-free-release.apk` |
| Premium Release APK | 65 MB | `android/app/build/outputs/apk/premium/release/app-premium-release.apk` |
| Free Release AAB | 45 MB | `android/app/build/outputs/bundle/freeRelease/app-free-release.aab` |

### Verificacion en emulador
- Quiz educativo probado end-to-end: respuesta correcta, incorrecta, resumen con revision de errores
- Feedback con 3 capas (explicacion, clinical pearl, dato clave) — OK
- Boton "Ver patologia completa" navega correctamente — OK
- "Revisar errores — ¡Aprende!" expande lista de errores con explicaciones — OK
- "Consejo de estudio" adaptado al score — OK

### Estado del proyecto post-sesion

| Aspecto | Estado |
|---------|--------|
| TypeScript | 0 errores |
| Tests | 13/13 pasan |
| Bundle JS | OK (52 assets) |
| Build release | BUILD SUCCESSFUL (APK free, APK premium, AAB) |

---

## 2026-03-27 — Sesion 2: Visual upgrade + Diagnostico diferencial + Testing

### Commits realizados (7)

| # | Hash | Tipo | Descripcion |
|---|------|------|-------------|
| 1 | `589c6d2` | feat | Enriquecer pathologies.json con campo videoUrl + actualizar body_systems.json y lab_values.json |
| 2 | `48a1b3b` | feat | Actualizar 4 fotos de sistemas corporales (inmunologico, reproductivo, tegumentario, traumatologico) |
| 3 | `1ecc48f` | feat | Visual upgrade masivo: reemplazar iconos vectoriales por fotos clinicas en Home, Onboarding, Quiz, Tabs, Scales, Tools y mas |
| 4 | `ba4564e` | feat | Agregar pantalla de diagnostico diferencial interactivo (DifferentialScreen + useDifferentialDiagnosis hook) |
| 5 | `26e377f` | test | Agregar mocks de Jest para modulos nativos + 12 tests unitarios de quiz |
| 6 | `8db6c9c` | chore | Agregar scripts de utilidad (enrich_nanda.js, fix_tildes.js) |
| 7 | `057a2bc` | chore | Rebuild del bundle Android con todos los cambios |

### Cambios detallados

**Nueva feature — Diagnostico Diferencial**
- `src/screens/DifferentialScreen.tsx` (602 lineas) — pantalla interactiva donde el usuario selecciona sintomas y ve patologias rankeadas por % de coincidencia
- `src/hooks/useDifferentialDiagnosis.ts` (164 lineas) — hook que construye indice de sintomas de las 151 patologias y calcula matching en tiempo real
- Ruta agregada en `AppNavigator.tsx` y tipo en `types/index.ts`

**Visual upgrade — Iconos a fotos clinicas**
- HomeScreen: quick actions ahora usan fotos clinicas de fondo en vez de iconos, toggle dark mode con emoji, fondo decorativo con gradientes y circulos difuminados
- OnboardingScreen: rediseno completo con ImageBackground full-screen, gradientes por slide, estadisticas destacadas (151 patologias, 455 NANDA, 17 escalas)
- QuizScreen: chips de sistemas ahora muestran thumbnail circular de la foto del sistema
- AppNavigator: iconos de tabs actualizados, animacion pill con spring mejorada
- ScalesScreen, ToolsScreen, AllFavoritesScreen, AllNotesScreen, SearchScreen, PremiumScreen, PathologyDetailScreen, QuizSessionScreen: ajustes de UI consistentes

**Datos**
- `pathologies.json`: enriquecido (~18k lineas de diff), campo `videoUrl` opcional agregado al tipo
- `body_systems.json`: estructura actualizada
- `lab_values.json`: valores de referencia adicionales
- 4 imagenes de sistemas reemplazadas con fotos clinicas de mayor calidad

**Testing**
- `jest.setup.js` creado con mocks para: AsyncStorage, MaterialCommunityIcons, LinearGradient, SafeAreaContext, react-navigation (native, native-stack, bottom-tabs)
- `jest.config.js` actualizado con setupFiles
- `__tests__/useQuiz.test.ts`: 12 tests unitarios para logica de quiz
- Resultado: 13/13 tests pasan

**Documentacion actualizada**
- `README.md`: agregado diagnostico diferencial, videos educativos, Jest, conteo actualizado de screens/hooks
- `ARCHITECTURE.md`: DifferentialScreen en diagrama, useDifferentialDiagnosis en data flow, diseno visual actualizado
- `CHANGELOG.md`: nueva seccion v1.1.0-dev con todos los cambios
- `playstore/PLAN_ACTUALIZACIONES.md`: tracking de iconos actualizado, estrategia de videos educativos en Mes 11-12
- `PROGRESO.md`: creado (este archivo)

### Estado del proyecto post-sesion

| Aspecto | Estado |
|---------|--------|
| TypeScript | 0 errores |
| Tests | 13/13 pasan |
| Bundle JS | OK (52 assets) |
| Gradle build | BUILD SUCCESSFUL |
| Pantallas | 21 |
| Hooks | 9 |
| Patologias | 151 |
| Fotos clinicas | 38 (12 sistemas + 13 condiciones + 9 escalas + 4 actualizadas) |
| Iconos como visual principal eliminados | HomeScreen, OnboardingScreen, QuizScreen, DifferentialScreen |
| Iconos pendientes de eliminar | PremiumScreen, DashboardScreen, SettingsScreen, empty states |

### Decisiones tomadas
- **Videos educativos**: se implementaran en futuras versiones enlazando a YouTube (no descargando). Campo `videoUrl` ya existe en el tipo Pathology. Canales objetivo: Osmosis, Ninja Nerd, Khan Academy Medicine, Enfermeria Evidente
- **Politica de progreso**: este documento se actualiza en cada sesion de trabajo

---

## 2026-03-26 — Sesion 1: Lanzamiento v1.0.0

### Resumen
- App completa con 151 patologias, 12 sistemas, 17 escalas, quiz, protocolos, NANDA-NIC-NOC
- 20 pantallas con diseno hero (fotos + gradientes)
- Sistema premium con trial 15 dias + suscripcion Google Play
- 34 fotos medicas reales de Unsplash
- Documentacion Play Store completa (ficha, privacy policy, IARC, instrucciones)
- AAB generado (45 MB)
- Correcciones de tildes/acentos en toda la app y documentacion
- Quiz dark mode readability fix + mostrar respuesta correcta al fallar

### Commits principales
- `591e0c3` feat: improve splash screen and app icon design
- `9f5e08d` fix: correct missing ñ in legal screens
- `6b22118` fix: add missing accents/tildes across all visible UI text
- `c0bc00b` fix: complete accent/tilde corrections across entire app and docs
- `c4a490c` fix: quiz dark mode readability + show correct answer on wrong
