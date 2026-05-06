# Roadmap — Manual de Enfermería

> **Última actualización**: 2026-05-06
> **Versión actual**: v1.0.0 (versionCode 1)
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
- [ ] **Telemetría opcional** (Sentry DSN ya scaffold) — opt-in en Settings, solo crashes y errores no-PII
- [ ] **Scroll-to-sub** desde BuscadorScreen (param `subId` ya existe en route, falta implementar el scroll en CursoModuloScreen)
- [ ] **Pre-tests E2E** con Maestro o Detox para flujos críticos (onboarding, navegación módulo, toggle tema, buscador)
- [ ] **Auditoría de accesibilidad**: TalkBack labels, contraste WCAG AA en dark mode, escalado de fuente del sistema
- [ ] **Highlight de matches en BuscadorScreen** — resaltar la query dentro del preview
- [ ] **Tablet layout** básico (md breakpoint en `useResponsiveScale`)
- [ ] **Crash analytics local**: log de errores en archivo (offline) consultable desde Settings → Diagnóstico

### Nice-to-have
- [ ] Animación de transición entre módulos
- [ ] Feedback haptico al marcar como leído
- [ ] Preview de subtema al long-press en lista
- [ ] Compartir subtema como texto/imagen

### Bugs conocidos a resolver
- Onboarding storage key compartido con Patologías (`@patologias_theme`) — renombrar a `@manual_theme` y migrar
- TS errors pre-existentes en `EmergencyBadge.tsx` y `colors.ts` (tipos legacy)

**Criterio de release**: 0 crashes en Sentry durante 7 días con >50 instalaciones.

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

- [ ] Subir cobertura de tests (actual: snapshots + util tests · target: 60% líneas en hooks/utils)
- [ ] Migrar Class components remanentes a functional + hooks (actual: solo ErrorBoundary, OK)
- [ ] Reducir tamaño de APK (actualmente ~70 MB free release · target: <50 MB)
  - Imágenes WebP en vez de JPG
  - Tree-shaking de iconos MaterialCommunity (1MB+ del set completo)
  - Hermes optimizations
- [ ] Refactor periódico de `curso.json` por módulo si supera 200 KB por archivo
- [ ] Limpieza de TS errors pre-existentes (3 actuales en EmergencyBadge/colors)

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
