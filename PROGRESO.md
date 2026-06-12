# Registro de Progreso — Manual de Enfermeria

> **Politica**: Este documento se actualiza en CADA sesion donde se realice cualquier modificacion o actualizacion. Registra que se hizo, cuando, y el estado resultante.

---

## 2026-06-12 — Sesión 13: Prueba en emulador, traducción de anglicismos y seguridad

### Resumen

Se probó la app en el emulador `Medium_Phone_API_36.1` (build freeDebug OK, corre bien). Durante la prueba se detectó (feedback del usuario) que el método **SBAR** mostraba sus términos en inglés sin traducir, mientras SOAPIE (mismo módulo) ya estaba en español — inconsistencia. Se aplicó el patrón sistémico: glosado `Inglés (Español)` en **SBAR, OPQRST y ABCDE** del curso (Módulos 9-10) y en **SBAR, OPQRST y FAST** del glosario, conservando el acrónimo. Verificado en vivo en el emulador.

Además se halló y mitigó un problema de seguridad: la password del keystore de release estaba **hardcodeada en `android/gradle.properties`** del repo público desde el commit inicial. Se eliminó (resuelve desde `~/.gradle`, igual que Patologías); `validateSigningFreeRelease` confirmó que el build sigue firmando. El keystore es **compartido con la app Patologías** (mismo archivo/upload key). Rotación de la password documentada como pendiente (decisión del usuario: no ejecutar ahora).

### Cambios
- `src/data/curso.json`: SBAR/OPQRST/ABCDE glosados al español
- `src/data/glosario.json`: SBAR/OPQRST/FAST glosados (3 líneas, sin reformateo)
- `android/gradle.properties`: removidas `RELEASE_STORE_PASSWORD`/`KEY_PASSWORD`/`KEY_ALIAS`
- Bundle JS regenerado en cada cambio de contenido
- Emulador: AVD ampliado a 16G + RAM 3 GB (config local, no versionado)

### Commits
- `39fa42b` content(curso): traducir terminos en ingles de SBAR, OPQRST y ABCDE
- `0c54f5a` content(glosario): glosar SBAR, OPQRST y FAST al espanol
- `f4fda48` fix(security): quitar passwords del keystore de gradle.properties trackeado

### Pendientes
- **🔐 Rotar la password del keystore** (`keytool -storepasswd`/`-keypasswd`): el valor sigue en el history público; rotar lo neutraliza. Cubre Curso + Patologías (mismo keystore). NO se recomienda scrub del history (rotar lo vuelve redundante).

---

## 2026-06-12 — Sesión 12: Enriquecimiento de contenido del glosario (+33 términos)

### Resumen

Pass de contenido educativo sobre `src/data/glosario.json` (178 entradas). Se enriquecieron **33 términos** que ganaban valor pedagógico con subtipos clínicos (`tipos`) y/o casos de presentación (`ejemplos`), replicando exactamente el estilo de las entradas ya enriquecidas (Astenia, Disnea, Cianosis): `tipos` con variantes/grados/estadios + "Red flags", y `ejemplos` con la forma "hallazgo + hallazgo → diagnóstico/conducta, estudio". Sin tocar código ni lógica; solo datos. 3 commits de contenido + docs.

| Métrica | Antes | Después | Δ |
|---------|-------|---------|---|
| Total de entradas | 178 | 178 | 0 (invariante) |
| Con `tipos` | 77 | 110 | +33 |
| Con `ejemplos` | 81 | 114 | +33 |
| Sin enriquecer (bare) | 97 | 64 | −33 |

### Términos enriquecidos por lote

1. **Lote 1 — cardiorrespiratorio (6)**: IAM, ICC, EAP, ACV, HTA, EPOC.
2. **Lote 2 — paro/ritmos, urológico/UPP, infeccioso (12)**: FV, TV, BAV, AESP, PCR, ITU, UPP, TEP, TBC, SARM, SAOS, OVACE.
3. **Lote 3 — PAE/taxonomías, examen físico, dispositivos (15)**: PAE, NANDA, NIC, NOC, SOAPIE, Apex cardíaco, Murmullo vesicular, Vómito en proyectil, SNG, NPT, CVC, PVC, PEG, FAV, VNI.

### Decisiones de contenido (qué se dejó bare a propósito)

Se mantuvieron sin `tipos`/`ejemplos` las siglas que NO se prestan a clasificación o casuística clínica:
- **Mnemotecnias / protocolos de procedimiento**: ABCDE, ACLS, RCP, SBAR, OPQRST, FAST.
- **Instituciones / paneles**: CDC, OMS, EAUN, RCN, NPUAP.
- **EPP y dispositivos de ventilación manual**: EPP, AMBU, BVM.
- **Unidades, vías y abreviaturas simples**: UI, CH, ATB, BZD, EV/IV, IM, ID, SC, SL, VO, MMII, FC, FR, TA, TAS, SatO₂, SF, EIC, FID, FII, SNC, SNP, SNA, HD, RIN, SCQ.
- **Escalas de dolor**: BPS, CPOT, EVA, FLACC, PAINAD.
- **Virus/vacuna/medición puntual**: HBV, HIV, BCG, NIBP.
- **Cross-references ya cubiertos por una entrada hermana** (para no duplicar): PICC y CPAP (cubiertos por CVC y VNI), RTU, IVC, ARM/AVM, TEC, TET, CAUTI, FV/TV (compuesto), UCO, UTI, CAPS.

### Contrato respetado (render)

`GlosarioScreen.tsx` renderiza `tipos` bajo el encabezado **"Tipos"** y `ejemplos` bajo **"Ejemplos clínicos"** (bullets). Ambos campos son opcionales (`tipos?`, `ejemplos?`) y solo se muestran si tienen longitud > 0 — las entradas bare siguen mostrando únicamente la definición, sin cambios visuales.

### Formato del JSON

Se respetó el formato existente: entradas bare en una sola línea compacta `{ "sigla": ..., "definicion": ... }` y entradas enriquecidas multilínea con indent de 2/6/8 espacios. Las ediciones fueron quirúrgicas (reemplazo línea-por-entrada) para NO reformatear el archivo completo. Verificado por `git diff` (solo inserciones + la línea bare reemplazada).

### Verificación

- `node -e "...entries.length"`: **178** (invariante mantenido tras cada lote).
- `npx tsc --noEmit`: 0 errores (tras cada lote).
- `npm test -- --ci`: **23/23** tests, 2 suites (tras cada lote).
- JSON válido (`require()` sin error) tras cada edición.

### Commits

- `1b5ad4f` content(glosario): enriquecer 6 terminos cardiorrespiratorios con tipos y ejemplos
- `231f542` content(glosario): enriquecer 12 terminos de paro, urologico e infeccioso
- `e4d0560` content(glosario): enriquecer 15 terminos de PAE, examen fisico y dispositivos

### Pendientes

- ✅ **Bundle JS regenerado y commiteado** (2026-06-12): `npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/`. Verificado empíricamente que los 33 términos nuevos están en el bundle (grep ASCII con `-Encoding utf8`: "Dolor opresivo retroesternal", "SOAPIE", "Apex card" → PRESENTE). El contenido nuevo ya llegará a la app empaquetada en el próximo build.
- Quedan 64 entradas bare; la mayoría son intencionales (ver "qué se dejó bare"). Si en el futuro se quiere ampliar cobertura, candidatos menores: PICC, CPAP, RTU (hoy cubiertos por cross-reference).

---

## 2026-06-11 — Sesión 11: Polish UX/UI — lectura, candado premium, glosario/buscador, accesibilidad

### Resumen

Pass de pulido visual incremental sobre las 11 pantallas, en 4 commits + docs. Sin dependencias nuevas, sin tocar lógica premium ni datos.

1. **Experiencia de lectura (CursoModuloScreen)** — `feat(lectura)`:
   - Tipografía de cuerpo 15/24 (line-height 1.6×) con jerarquía clara: título de sub (18) > h4 (16) > cuerpo (15) > tablas (12.5).
   - **Indicador de progreso de lectura**: barra fina (3px) bajo el header que se llena con el scroll. Implementada con `Animated.ScrollView` + `scaleX` interpolado con native driver (no bloquea el hilo JS).
   - Cards destacadas (insight/tip/alert/warn) ahora renderizan su emoji identificador — estaba definido en `CARD_STYLES` pero nunca se usaba.
   - Bullets de listas alineados al line-height del texto; espaciado vertical consistente entre bloques y subtemas (28→32).
   - Estado "módulo no encontrado" útil (ícono + mensaje + botón Volver).

2. **Lista de módulos (CursoScreen)** — `feat(curso)`:
   - Candado premium claro: scrim oscuro `rgba(15,23,42,0.32)` sobre la foto + fila "Contenido Premium — desbloquealo con PRO" con candado en lugar del contador de subtemas.
   - a11y completa: labels descriptivos en cards (con estado bloqueado/progreso), botones del hero con role + hitSlop (touch target ≥44pt efectivo).
   - 4 botones del hero deduplicados en subcomponente `HeaderAction`.

3. **Glosario + Buscador** — `feat(glosario-buscador)`:
   - Contador de resultados: subtítulo dinámico "N de 178 términos" (Glosario) y header "N resultados" (Buscador).
   - Empty states con acción: ícono en círculo + sugerencia + botón "Limpiar búsqueda".
   - Botón de borrar búsqueda ahora es `TouchableOpacity` con hitSlop y label (antes ícono con `onPress` de 18pt).
   - Definiciones del glosario 13→14 con line-height 21.

4. **Pass transversal de accesibilidad** — `fix(a11y)`:
   - **Contraste WCAG**: `textLight` light `#9BA4B5` (2.4:1) → `#67738C` (4.5:1); dark `#636E83` (2.9:1) → `#8C96AD` (5:1). Verificado con cálculo de luminancia relativa.
   - StatusBar light-content explícito en Settings y About (headers con gradiente).
   - Roles/labels/states en: chips de tema, modal de activación, rows de Settings/About, mailto, cards de MiSuite, botones de Premium (suscribir/restaurar/back), back de Privacy/Terms, Omitir/Siguiente del Onboarding (+ Omitir deshabilitado en última slide).
   - AppNavigator: `headerBackground` extraído a componente estable (fix `react/no-unstable-nested-components`) + ActivityIndicator en el loading inicial.

### Decisiones técnicas
- **Patrón de estilos**: factory `createStyles(colors, rs, isDark)` + `useMemo` (mismo patrón que PremiumScreen ya usaba). Estilos dinámicos por ítem (accents de módulo) quedan como objetos variable-only que la regla `no-inline-styles` no marca.
- **StatusBar sigue `light-content` fijo** en pantallas con header/hero de gradiente azul: el fondo bajo la status bar es siempre oscuro en ambos temas — `dark-content` sería ilegible. Es theme-aware por diseño del fondo, no por condicional.
- **No se agregaron filtros por tipo al Glosario**: `glosario.json` no tiene campo de categoría por entrada (`tipos` es contenido del término, no taxonomía) — no hay data para chips de filtro.
- **`activation.ts` (60 warnings `no-bitwise`) no se tocó**: es lógica de premium (restricción dura) y los bitwise son intencionales (hashing).

### Verificación
- `npx tsc --noEmit`: 0 errores (después de cada commit)
- `npm test -- --ci`: 23/23 tests, 2 suites (después de cada commit)
- `npx eslint src --ext .ts,.tsx`: 0 errores; **warnings 273 → 132** (-141: los 4 screens refactorizados quedaron en 0 inline-styles; restan 132 = 60 `no-bitwise` intencionales de activation.ts + 72 inline-styles en pantallas no refactorizadas: Settings 23, MiSuite 21, About/Premium/ErrorBoundary/etc.)

### Commits
- `2a61bc9` feat(lectura): mejorar experiencia de lectura en CursoModuloScreen
- `2554c06` feat(curso): pulir lista de modulos — candado premium claro y accesibilidad
- `79a619a` feat(glosario-buscador): jerarquia de cards, contador de resultados y empty states con accion
- `d740952` fix(a11y): contraste WCAG, StatusBar, roles y touch targets transversales

### Pendientes (heredados + nuevos)
- Regenerar y commitear el bundle JS (`index.android.bundle`) antes del próximo release — los cambios de src/ de hoy no están en el bundle commiteado (pendiente conocido, fuera de alcance).
- Migrar los inline-styles restantes de Settings/MiSuite/About/Premium a StyleSheet (72 warnings).
- Crear el producto `curso_premium_monthly` en Play Console.

---

## 2026-06-10 — Sesión 10: Auditoría aplicada — monetización, ErrorBoundary, premiumLogic, CI, limpieza

### Resumen

Sesión de remediación de una auditoría previa. Ocho frentes:

1. **Monetización heredada de Patologías (CRÍTICO)**: `PLAY_STORE_URL` apuntaba al listing de Patologías (`com.patologiasenfermeria`) → corregido a `com.cursoenfermeria.free` (el AAB publicado es el flavor free). SKU `patologias_premium_monthly` → `curso_premium_monthly` (pendiente crearlo en Play Console). PremiumScreen vendía features de Patologías que no existen acá (quiz, escalas, NANDA/NIC/NOC, dashboard) → listas veraces: 10 módulos (m1-m2 gratis), 56 subtemas, 178 bloques, glosario 178, buscador, progreso, dark mode, offline. PrivacyPolicy decía "Patologias de Enfermeria" → "Manual de Enfermeria".
2. **ErrorBoundary auto-crash**: el fallback llamaba `useTheme()` estando el boundary POR FUERA de ThemeProvider → al capturar cualquier error lanzaba y dejaba pantalla blanca. Fix: paleta light estática + `componentDidCatch` con `console.error`.
3. **premiumLogic portado del ecosistema**: módulo puro `src/utils/premiumLogic.ts` con guard NaN/Infinity (fail-closed) y clamp superior anti clock-rollback. PremiumContext re-inicializa el trial si el storage está corrupto. 22 tests nuevos.
4. **Feedback en Restaurar compra**: antes fallaba en silencio → banner de error + spinner.
5. **Dependencias**: desinstaladas 5 sin uso (op-sqlite, flash-list, clipboard, react-native-svg, new-app-screen) tras grep exhaustivo.
6. **Código muerto**: 8 scripts de Patologías (operaban sobre pathologies.json inexistente) + 6 componentes/utils sin imports, borrados en batches ≤5 con tsc+jest verdes entre batches.
7. **CI**: `.github/workflows/ci.yml` con typecheck + eslint + jest (push/PR a main), adaptado del de Patologías sin los jobs de data-integrity.
8. **Docs**: CLAUDE.md y ARCHITECTURE.md reescritos para ESTA app (eran copias de Patologías sin adaptar); README con glosario 178 (decía 94) y estructura real; basura del root borrada (13 png/jpg sin trackear, incl. heart.jpg que era un HTML 404 de 29 bytes).

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/context/PremiumContext.tsx` | URL/SKU correctos + load con guard de corrupción + usa premiumLogic |
| `src/screens/PremiumScreen.tsx` | features veraces + feedback de restore |
| `src/screens/PrivacyPolicyScreen.tsx` | nombre de app |
| `src/components/ErrorBoundary.tsx` | fallback sin useTheme + componentDidCatch |
| `src/utils/premiumLogic.ts` | NUEVO — lógica premium pura |
| `__tests__/premiumLogic.test.ts` | NUEVO — 22 tests |
| `App.tsx`, `src/hooks/useOnboarding.ts` | console.log removidos |
| `package.json` / `package-lock.json` | -5 dependencias |
| `scripts/` (8), `src/components/` (4), `src/utils/` (2) | código muerto eliminado |
| `.github/workflows/ci.yml` | NUEVO — CI |
| `CLAUDE.md`, `ARCHITECTURE.md`, `README.md`, `CHANGELOG.md`, `playstore/INSTRUCCIONES_PUBLICACION.md` | docs corregidos |

### Verificación
- `npx tsc --noEmit`: 0 errores
- `npm test -- --ci`: 23/23 tests (2 suites)
- `npx eslint src --ext .ts,.tsx`: 0 errores (273 warnings preexistentes de inline-styles)

### Pendientes
- Crear el producto `curso_premium_monthly` en Play Console (Monetización > Suscripciones) — sin esto el botón Suscribirse solo abre el listing.
- Integrar Google Play Billing real (restoreSubscription hoy solo lee EncryptedStorage local).
- `scripts/fix_tildes.js` también referencia pathologies.json inexistente — quedó fuera del alcance de esta limpieza, evaluar borrarlo.
- Regenerar y commitear el bundle JS (`index.android.bundle`) antes del próximo release — los cambios de src/ de hoy no están en el bundle commiteado.

---

## 2026-05-22 — Sesión 9: Buscador inteligente + glosario expandido + back buttons

### Resumen
Tres líneas de trabajo en una sesión:

1. **Bugs descubiertos en validación visual**:
   - Scroll-to-sub no funcionaba (measureLayout daba y=0 durante primer layout pass) → fix con `onLayout`-based tracking en JS.
   - Buscador y Glosario sin botón Volver visible (bug pre-existente desde v1.0, headerShown:false sin back affordance propio) → agregado ← junto al badge identitario en ambos heros.

2. **Buscador inteligente**: el algoritmo original era substring exacto, fallaba con queries multi-palabra. Rediseño con tokenize + stopwords ES + plural-stripping + scoring por tokens hallados + bonus por title/sigla match. Resultados:
   - "ta" → TA glosario al top (score 22).
   - "presion arterial" → NIBP, TA, TAS + M03 Tensión arterial (era 0 sub matches antes).
   - "tecnicas de medicion" → HD + M01/M03/M04/M05/M07 (era 0 resultados antes).

3. **Glosario expandido + schema enriquecido**: pasó de 94 a 178 entradas. Schema extendido con `tipos?` y `ejemplos?` opcionales (backward-compatible). 27 términos de alto valor enriquecidos con tipos + ejemplos clínicos en grupos: respiratorios (8), cardiovasculares (5), neurológicos (2), digestivos (4), urinario (1), dermatológicos/generales (2), procedimentales (5).

4. **Cleanup técnico**: 0 ESLint errors (eran 8 pre-existentes), 0 TS errors, jest 1/1 passed, app smoke OK.

### Archivos modificados (sesión completa)

| Archivo | Cambio |
|---------|--------|
| `src/screens/CursoModuloScreen.tsx` | scroll-to-sub con onLayout tracking |
| `src/screens/BuscadorScreen.tsx` | tokenize + ranking + back button + HighlightedText multi-token |
| `src/screens/GlosarioScreen.tsx` | back button + render de tipos/ejemplos en cada entry |
| `src/data/glosario.json` | 94 → 178 entradas; 27 enriquecidas con tipos/ejemplos |
| `src/components/CollapsibleSection.tsx` | lint cleanup (useEffect unused) |
| `src/screens/CursoScreen.tsx` | lint cleanup (idx unused) |
| `src/screens/PremiumScreen.tsx` | lint cleanup (isDark, isPremium, restoring) |
| `src/screens/TermsScreen.tsx` | lint cleanup (neuCard import) |
| `ROADMAP.md` | tracker de glosario + items completados de v1.1 + bug del gradle task |
| `PROGRESO.md` | esta entrada |
| `android/app/src/main/assets/index.android.bundle` | regenerado 4 veces |

### Commits creados (10+ en sesión total)
Ver `git log eabd4da..HEAD` para detalle. Highlights:
- `feat(buscador): tokenize + ranking + plural-stripping`
- `feat(glosario): expand to 177 entries + structured tipos/ejemplos`
- `feat(glosario): enrich vómito, hematemesis, melena, palidez`
- `feat(glosario): enrich 7 cardio-respiratorios + urinario + digestivo`
- `fix(nav): add back button to BuscadorScreen and GlosarioScreen`
- `fix(buscador): replace measureLayout with onLayout-based scroll tracking`
- `chore(lint): clear 8 pre-existing no-unused-vars errors`

### Bug del build descubierto
Gradle bundle task no detecta `glosario.json`/`curso.json` como inputs → en cambios solo-data, salta el bundling con cache stale. Workaround: `--rerun-tasks` + `--reset-cache`. Anotado en ROADMAP como deuda técnica con fix propuesto (declarar JSON como input explícito del task).

### Pendientes para próxima sesión
- Identificar qué módulo se ve "incompleto" / qué pantalla "renderiza mal" (feedback abierto del usuario).
- Continuar enriquecimiento de glosario por sistemas (lista priorizada en ROADMAP → "Tracker de glosario · Fase 2").
- Considerar agregar crosslinks desde subtemas de M03 (Signos vitales) hacia patologías relacionadas en app Patologías.

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
