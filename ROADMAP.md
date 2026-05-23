# Roadmap — Manual de Enfermería

> **Última actualización**: 2026-05-22
> **Versión actual**: v1.0.0 (versionCode 1) · main con 21 commits en preparación de v1.1.0
> **Política**: este documento se actualiza al cerrar cada release y al iniciar cada milestone. Mover items de "planeado" a "en progreso" → "completado" según avanza el trabajo.

---

## 🎯 Visión general

**Manual de Enfermería** es la pata "CÓMO se hace" del ecosistema (junto con **Patologías de Enfermería** = "QUÉ tiene el paciente" y **Guía Farmacológica** = "QUÉ le doy"). El objetivo es ser la referencia integral de estudio y consulta rápida para estudiantes y profesionales.

**Principios de evolución**
- Calidad clínica > cantidad de features (todo contenido nuevo con `revisadoEn` + `fuentes`)
- Offline-first (la app funciona sin red, OTA solo para actualizaciones de contenido)
- No telemetría sin consentimiento (privacidad estricta, todo local)
- Free tier útil + Premium con mejoras claras (sin paywall agresivo)

---

## ✅ v1.0.0 — Foundation (release inicial · mayo 2026)

**Estado**: ✅ Liberada — APK en `android/app/build/outputs/apk/free/release/`

Lo que incluye:
- 10 módulos · 56 subtemas (Fundamentos → Comunicación clínica)
- Bloques tipados: `p`, `h4`, `list`, `ol`, `card` (insight/tip/alert/warn), `table`, `grid`, `crosslink`
- Progreso de lectura por subtema (AsyncStorage v2)
- Continuar último módulo + carrusel "Recién visto"
- Glosario de 94 siglas/abreviaturas
- Buscador full-text (subtemas + glosario, normalize accent-insensitive)
- Tema claro/oscuro/sistema con selector de 3 chips
- Mi Suite (cross-app deep links a Patologías + Farmacológica)
- Onboarding 4 slides
- Free tier: módulos 1 y 2 abiertos · Premium: todo desbloqueado
- Trial 15 días · activación por código (SHA-256)
- Privacy/Terms/About con disclaimers clínicos
- Lavado vesical + lavado gástrico (M7) con guías AACT/EAPCCT 2024-25
- Corrección clínica M7.2: balón Foley con agua estéril (no SF)

---

## 🔜 v1.1.0 — Polish & Quality (Q3 2026 · ~6 semanas)

**Foco**: arreglar lo que se descubre en uso real, no agregar features grandes.

### Must-have
- [ ] **Telemetría opcional** (Sentry no instalado aún — el README mencionaba "DSN ya scaffold" pero no existe en código; pendiente desde 0)
- [x] **Scroll-to-sub** desde BuscadorScreen — `CursoModuloScreen` consume `route.params.subId` con `onLayout`-based tracking (2026-05-21, fix de measureLayout a JS-based en mismo día)
- [ ] **Pre-tests E2E** con Maestro o Detox para flujos críticos (onboarding, navegación módulo, toggle tema, buscador)
- [ ] **Auditoría de accesibilidad**: TalkBack labels, contraste WCAG AA en dark mode, escalado de fuente del sistema
- [x] **Highlight de matches en BuscadorScreen** — componente `HighlightedText` accent-insensitive con mapeo posicional normalizado→original (2026-05-21)
- [x] **Buscador inteligente (tokenize + ranking + plural-strip)** — algoritmo de búsqueda multi-palabra con stopwords ES, scoring por tokens, bonus por title/sigla match, sort por relevancia (2026-05-22)
- [ ] **Tablet layout** básico (md breakpoint en `useResponsiveScale`) — primitiva `isTablet` ya existe, falta consumirla en screens
- [ ] **Crash analytics local**: log de errores en archivo (offline) consultable desde Settings → Diagnóstico

### Mejoras descubiertas en uso real (no estaban en plan original)
- [x] **Botones Volver visibles** en BuscadorScreen y GlosarioScreen — bug pre-existente: ambas screens tenían `headerShown: false` sin back button propio (2026-05-22)
- [x] **Glosario ampliado** de 94 a 178 entradas + schema extendido con `tipos?` y `ejemplos?` opcionales (2026-05-22)
- [x] **27 términos clínicos enriquecidos** con tipos y ejemplos clínicos (ver "Tracker de glosario" abajo)

### Nice-to-have
- [ ] Animación de transición entre módulos
- [ ] Feedback haptico al marcar como leído
- [ ] Preview de subtema al long-press en lista
- [ ] Compartir subtema como texto/imagen

### Bugs conocidos a resolver
- [x] Storage key compartido con Patologías (`@patologias_theme`) — migrado a `@manual_theme` con lectura legacy de respaldo (2026-05-21)
- [x] TS errors pre-existentes en `EmergencyBadge.tsx` y `colors.ts` — resueltos eliminando dead code heredado de Patologías (2026-05-21)
- [x] 8 ESLint errors pre-existentes (`no-unused-vars` en 5 screens) — limpiados (2026-05-22)
- [x] `react-native-encrypted-storage` no mockeado en `jest.setup.js` — mock agregado, `App.test.tsx` pasa 1/1 (2026-05-21)
- [ ] **Gradle bundle task no detecta cambios en `glosario.json`/`curso.json` como inputs** — descubierto 2026-05-22 al cambiar solo data sin tocar código. Workaround: `--rerun-tasks` en gradle + `--reset-cache` en RN bundle. Fix real: declarar JSON como input explícito del task `bundleReleaseJsAndAssets`.

**Criterio de release**: 0 crashes en Sentry durante 7 días con >50 instalaciones.

### 🟡 Puntos sin resolver de la sesión 2026-05-22
El usuario reportó "veo la app incompleta" con 4 ejes (multi-select). Atendido el eje #1 (contenido magro) y #4 (glosario corto). Pendientes para próxima sesión con detalle específico del usuario:
- [ ] **"Faltan secciones enteras en algún módulo"** — requiere identificar qué módulo se ve truncado. Pedir screenshot/nombre del módulo afectado.
- [ ] **"Una pantalla se renderiza mal o parcial"** — requiere identificar la pantalla afectada. Sin reproducción específica.

---

## 📘 Tracker de glosario — Fase 2 y siguientes

**Estado actual (2026-05-22)**: 178 entradas · 27 enriquecidas con `tipos` + `ejemplos`.

**Schema extendido** (backward-compatible):
```ts
interface Entry {
  sigla: string;       // término o sigla (mismo field name)
  definicion: string;
  tipos?: string[];    // clasificación de variantes (1 línea c/u)
  ejemplos?: string[]; // escenarios clínicos típicos (1 línea c/u)
}
```

**Criterio de inclusión**: signos, síntomas, terminología procedimental y anatomo-funcional. NO entidades clínicas completas (esas viven en app Patologías).

### ✅ Enriquecidos (76)
**Respiratorios** (18): Apnea, Disnea, Taquipnea, Cianosis, Hipoxia, Hipoxemia, Estridor, Tiraje, Crepitantes, Sibilancias, Hemoptisis, **Bradipnea**, **Eupnea** (referencia normal), **Ortopnea** (con DPN, trepopnea, platipnea), **Hiperpnea** (con Kussmaul), **Roncus**, **Hipercapnia**, **Esputo** (7 tipos por aspecto).
**Cardiovasculares** (11): Bradicardia, Taquicardia, Hipotensión, Síncope, Edema, Soplo cardíaco, **Palpitaciones**, **Ingurgitación yugular**, **Frialdad distal**, **Relleno capilar**, **Fóvea** (godet con grados 1+ a 4+).
**Neurológicos** (17): Cefalea, Convulsión, Afasia, Somnolencia, Obnubilación, Estupor, Coma (gradient completo), Anisocoria, Midriasis, Miosis, **Hemiparesia**, **Hemiplejía**, **Disartria**, **Mareo** (umbrella diferencial), **Vértigo**, **Lipotimia**, **Parestesia**.
**Digestivos** (9): Vómito (umbrella), Hematemesis, Melena, Disfagia, **Hematoquecia**, **Pirosis**, **Náuseas** (7 tipos por origen), **Borborigmos** (gradient: aumentados → metálicos → disminuidos → ausentes), **Distensión abdominal** (las 6 F's).
**Urinarios** (7): Oliguria, Anuria, Hematuria, **Poliuria** (6 tipos incluyendo DI central vs nefrogénica), **Polaquiuria**, **Disuria**, **Tenesmo** (vesical vs rectal vs doble).
**Dermatológicos / generales** (8): Palidez, Ictericia, **Equimosis** (con Cullen, Grey-Turner, ojos de mapache), **Petequias** (vs púrpura vs equimosis), **Eritema** (con UPP grado I), **Diaforesis** (fría vs caliente vs nocturna), **Astenia**, **Adinamia**.
**Procedimentales** (6): Sondaje, Catéter, Cánula, Drenaje, Decúbito, Flebitis (con escala de Maddox).

### 🔜 Candidatos prioritarios para Fase 2 (~30-40 términos)

**Respiratorios**: ✅ Módulo respiratorio cerrado en esta fase (18 términos enriquecidos).

**Cardiovasculares**: ✅ Módulo cardiovascular cerrado en esta fase (11 términos enriquecidos).

**Neurológicos**: ✅ Módulo neurológico cerrado en esta fase (17 términos enriquecidos).

**Digestivos**: ✅ Módulo digestivo cerrado en esta fase (9 términos enriquecidos).

**Urinarios**: ✅ Módulo urinario cerrado en esta fase (7 términos enriquecidos).

**Dermatológicos / generales**: ✅ Módulo cerrado en esta fase (8 términos enriquecidos).

**Procedimentales**:
- [ ] Aspiración de secreciones · Permeable · Extravasación
- [ ] Sonda nasogástrica (SNG) · Sonda vesical (Foley) — actualmente solo definición

### 📋 Política de enriquecimiento

Al elegir candidatos:
1. **Frecuencia clínica** en el contenido del Manual (rastrear menciones en `curso.json`).
2. **Existencia de tipos naturales** — si el término no se sub-clasifica de forma útil, omitir `tipos` y dejar solo `ejemplos`.
3. **Diferenciación útil** — terminos que se confunden frecuentemente (hipoxia vs hipoxemia, melena vs pseudomelena, mareo vs vértigo) son alta prioridad.
4. **Tamaño**: 2-7 tipos, 3-4 ejemplos. Más de eso = mover a un subtema de un módulo, no a glosario.
5. **No solape con Patologías**: si entidad clínica completa con etiología/cuidados → app Patologías.

### 🔍 Issue UX descubierto (2026-05-22)
GlosarioScreen ordena resultados de búsqueda **alfabéticamente**, no por relevancia. Ejemplo: buscar "hipotension" muestra Bradicardia (B) antes que Hipotensión (H), porque ambas matchean pero la sort key es la sigla. El BuscadorScreen sí rankea por scoring; el Glosario quedó atrás. Fix futuro: reusar la misma lógica de scoring + sort en GlosarioScreen.filter().

### 🛠️ Workflow para futuras sesiones de enriquecimiento

```bash
# 1. Editar src/data/glosario.json (agregar tipos/ejemplos a una entrada existente)
# 2. Validar JSON + contar entradas enriquecidas:
PYTHONIOENCODING=utf-8 python -c "import json; g=json.load(open('src/data/glosario.json',encoding='utf-8')); print(sum(1 for e in g['entries'] if 'tipos' in e or 'ejemplos' in e), '/', len(g['entries']))"

# 3. Pre-bundle con --reset-cache (importante por bug del task input):
npx react-native bundle --platform android --dev false --reset-cache --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/

# 4. Gradle con --rerun-tasks (idem):
cd android && ./gradlew app:assembleFreeRelease --rerun-tasks

# 5. Reinstalar y smoke test visual en emulador
```

---

## 🚀 v1.2.0 — Aprendizaje activo (Q4 2026 · ~8 semanas)

**Foco**: convertir el manual de pasivo (leer) a activo (practicar).

### Quiz por módulo (Premium)
- [ ] 5-10 preguntas multi-opción por módulo
- [ ] Modo "estudiar" (feedback inmediato + explicación) y "examen" (resultado al final)
- [ ] Banco de ~500 preguntas en `src/data/quiz.json` con `moduloId` + `subId` para trazabilidad
- [ ] Tracking de aciertos por módulo en `CursoProgressContext`
- [ ] Insignias por dominio (≥80% acierto en 3 intentos)

### Casos clínicos cortos (Premium)
- [ ] 20 viñetas tipo "paciente llega con X, ¿qué hacés primero?"
- [ ] Decision tree con feedback en cada nodo
- [ ] Vinculados al subtema relevante (deep link interno)

### Notas personales
- [ ] Highlight + nota por subtema (AsyncStorage encrypted)
- [ ] Vista "Mis notas" agrupadas por módulo
- [ ] Export a PDF (opcional)

**Criterio de release**: ≥30% de usuarios Premium activan al menos 1 quiz en la primera semana.

---

## 🌱 v1.3.0 — Contenido ampliado (Q1 2027 · ~10 semanas)

**Foco**: ampliar el corpus clínico para llegar a "manual de cabecera".

### Nuevos módulos
- [ ] **Módulo 11**: Pediatría (signos vitales por edad, dosificación pediátrica, escalas FLACC/Wong-Baker)
- [ ] **Módulo 12**: Geriatría (fragilidad, polifarmacia, prevención de caídas, deterioro cognitivo)
- [ ] **Módulo 13**: Salud mental (contención, RIESGO suicida, escalas Hamilton/PHQ-9)
- [ ] **Módulo 14**: Cuidados paliativos (dolor, sedación, comunicación de malas noticias)

### Calculadora clínica integrada (deep link desde subtemas)
- [ ] Goteo IV (gotas/min, microgotas/min, ml/h)
- [ ] Dosis pediátrica (mg/kg, mg/m²)
- [ ] BMI + peso ideal
- [ ] Clearance de creatinina (Cockcroft-Gault)
- [ ] Score qSOFA, NEWS2, Glasgow

### Versionado clínico
- [ ] CI job `check-stale.js` rechaza patologías con `revisadoEn` > 18 meses
- [ ] Footer en cada subtema: fecha de revisión + fuentes específicas
- [ ] Página "Cambios clínicos" en Settings: log de qué se actualizó por release

**Criterio de release**: ≥80 subtemas totales · 100% con `revisadoEn` ≤ 12 meses · al menos 3 fuentes por módulo.

---

## 🌐 v2.0.0 — Plataforma & escala (mediados 2027)

**Foco**: salir de Android-only y abrir el ecosistema.

### iOS (TestFlight)
- [ ] Build iOS con CocoaPods + signing
- [ ] App Store screenshots + privacy nutrition labels
- [ ] Verificar deep links universales (universal links replacement de schemes Android)
- [ ] Adaptación de iconos a SF Symbols donde aplique

### OTA de contenido (real)
- [ ] Activar `FEATURES.contentOTA = true`
- [ ] Hosting en GitHub Pages o Cloudflare R2: `manifest.json` + `curso.json` + `glosario.json`
- [ ] Throttle 6h, signature verification (Ed25519) opcional
- [ ] UI en Settings: "Última verificación · vN · forzar actualización"

### Sincronización Premium (opcional)
- [ ] Backend mínimo (Cloudflare Workers + KV/D1) para sync de progreso entre devices
- [ ] Auth con código de activación (no email/password)
- [ ] Conflict resolution: last-write-wins por subtema
- [ ] **Solo opt-in explícito** — privacy first

### Multi-idioma
- [ ] Portugués (PT-BR) — mercado Brasil grande
- [ ] Inglés (EN) — mercado internacional
- [ ] i18n con `react-i18next`, JSON por idioma
- [ ] Fallback a español si key no existe

### Audio TTS
- [ ] Lectura del subtema con voice del sistema (RN TTS lib)
- [ ] Play/pausa/skip en footer de CursoModuloScreen
- [ ] Útil para estudio mientras se hace otra tarea

**Criterio de release**: ≥1000 instalaciones activas · NPS ≥30 · funcionando en iOS + Android.

---

## 📋 Ideas en evaluación (sin compromiso de fecha)

- [ ] Modo "examen ENF" — simulacro tipo final de carrera
- [ ] Integración con anki/exportar quiz como flashcards
- [ ] Comunidad de usuarios (foro liviano por módulo) — solo si demanda
- [ ] Modo "guardia" — cards minimalistas para consulta rápida en piso
- [ ] Plantillas de SOAPIE / SBAR rellenables
- [ ] Diccionario de fármacos integrado (sin llamada cruzada a Farmacológica)
- [ ] Sistema de logros / streak diario (puede ser gimmicky — evaluar)
- [ ] Watch app (Apple Watch / Wear OS) para timers de medicación

---

## ⚙️ Deuda técnica permanente (siempre activa)

- [ ] Subir cobertura de tests (actual: smoke App.test.tsx · target: 60% líneas en hooks/utils)
- [ ] Migrar Class components remanentes a functional + hooks (actual: solo ErrorBoundary, OK)
- [ ] Reducir tamaño de APK (actualmente ~70 MB free release · target: <50 MB)
  - Imágenes WebP en vez de JPG
  - Tree-shaking de iconos MaterialCommunity (1MB+ del set completo)
  - Hermes optimizations
- [ ] Refactor periódico de `curso.json` por módulo si supera 200 KB por archivo
- [x] ~~Limpieza de TS errors pre-existentes (3 en EmergencyBadge/colors)~~ → resuelto 2026-05-21
- [x] ~~8 ESLint errors `no-unused-vars` pre-existentes~~ → resuelto 2026-05-22
- [ ] **Declarar `src/data/*.json` como input del gradle bundle task** — actualmente cambios solo en data no disparan re-bundle. Workaround usar `--rerun-tasks`.
- [ ] **Inline-style warnings ESLint (~270)** — convención del proyecto: estilos paramétricos con `rs.font/rs.space` no migrables a StyleSheet.create. Considerar `eslintrc` config para silenciar la regla en archivos con `useResponsiveScale`.

---

## 📦 Política de versionado

- **MAJOR (v1 → v2)**: cambio de plataforma o break en formato de datos almacenados
- **MINOR (v1.0 → v1.1)**: nuevo set de features, sin romper compat con datos previos
- **PATCH (v1.0.0 → v1.0.1)**: bugfixes, correcciones clínicas, sin features nuevas
- `versionCode` siempre incrementa (Play Store rule), `versionName` sigue semver

**Cadencia objetivo**: 1 minor cada 2-3 meses · patches según necesidad · majors solo cuando hay razón estructural.

---

## 🚦 Cómo proponer cambios al roadmap

1. Issue/nota describiendo el qué + por qué (problema o oportunidad)
2. Estimar esfuerzo (S/M/L) y dependencia con otros items
3. Asignar a milestone (v1.1 / v1.2 / etc) o "evaluación"
4. Si es feature mayor: prototipar en HTML standalone primero (como `curso-enfermeria.html`)
5. Solo entra a milestone activo si está priorizado por encima de algo ya planeado

**Criterio de "no": no se agrega lo que no aporta a "ser el manual de cabecera del estudiante de enfermería"**.
