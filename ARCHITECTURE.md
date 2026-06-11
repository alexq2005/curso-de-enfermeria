# Arquitectura — Manual de Enfermería

## Diagrama General

```
App.tsx
└── ErrorBoundary (fallback con paleta light estática — NO usa useTheme,
    │              está por fuera de ThemeProvider a propósito)
    └── SafeAreaProvider
        └── ThemeProvider (light/dark/system, migra key legacy @patologias_theme)
            └── PremiumProvider (trial 15d + suscripción + código)
                └── CursoProgressProvider (subtemas leídos + último módulo)
                    └── AppNavigator (native-stack, SIN tabs)
                        ├── Onboarding (solo primer arranque)
                        ├── CursoScreen (home — lista de 10 módulos)
                        ├── CursoModulo (renderer de bloques tipados)
                        ├── GlosarioScreen (178 entradas)
                        ├── BuscadorScreen (full-text subtemas + glosario)
                        ├── MiSuite (deep links a Patologías / Farmacológica)
                        ├── PremiumScreen (paywall + código de activación)
                        ├── SettingsScreen (tema + easter egg activación)
                        ├── AboutScreen
                        ├── PrivacyPolicy
                        └── Terms
```

11 screens registradas en un único `createNativeStackNavigator` — esta app no
tiene tab bar (a diferencia de Patologías).

## Data Flow

```
JSON estáticos (offline, importados con require/import — sin SQLite)
├── curso.json    (10 módulos · 56 subtemas · 178 bloques, ~2.5 MB)
└── glosario.json (178 entradas: sigla, significado, tipos?, ejemplos?)
        │
        ├── CursoScreen ──→ lista módulos (isPremium gating por módulo)
        ├── CursoModuloScreen ──→ renderer de CursoBlock por discriminated union
        ├── GlosarioScreen ──→ búsqueda accent-insensitive
        ├── BuscadorScreen ──→ tokenize + stopwords ES + plural-stripping + scoring
        └── CursoProgressContext ──→ progreso por subtema (AsyncStorage @curso_progress_v2,
                                     persist debounceado 300 ms)
```

### Modelo de bloques (`src/types/curso.ts`)

`CursoBlock` es una discriminated union por `type`:

| type | Contenido |
|------|-----------|
| `p` / `h4` | texto plano / subtítulo |
| `list` / `ol` | listas (bullets / numeradas) |
| `card` | variantes `insight` · `tip` · `alert` · `warn` |
| `table` | headers + rows con scroll horizontal |
| `grid` | cards título+texto |
| `image` | imagen bundleada con caption opcional |
| `crosslink` | link a app Patologías o Farmacológica (deep link + Play Store fallback) |

## Premium Gating

```
isPremium = computeIsPremium({ isPremiumBuild, isCodeActivated, isSubscribed, isTrialActive })

IS_PREMIUM_BUILD = !(BuildConfigModule.IS_FREE)
  - Flavor free:    IS_FREE=true  → gating activo (trial/sub/código requerido)
  - Flavor premium: IS_FREE=false → siempre desbloqueado

Gating por módulo (curso.json → isPremium):
- Módulos 1-2 (m1, m2): GRATIS
- Módulos 3-10 (m3-m10): requieren Premium (CursoScreen navega a PremiumScreen si locked)
- Glosario y Buscador: siempre gratis

Trial: 15 días desde primera apertura
Suscripción: Google Play monthly (`curso_premium_monthly` — pendiente de crear en Play Console)
Código: SHA-256 puro en JS (utils/activation.ts) — input en PremiumScreen
        + easter egg en Settings (tap 5× en versión)
```

La lógica derivada vive en `src/utils/premiumLogic.ts` (módulo puro, sin React):
`computeTrialDaysLeft` (guard NaN/Infinity fail-closed + clamp superior contra
clock rollback), `computeIsPremium`, `computeTrialExpired`. Tests en
`__tests__/premiumLogic.test.ts`. Storage corrupto re-inicializa el trial en el
load de PremiumContext (no lo regala perpetuo).

## Persistencia

| Key | Motor | Descripción |
|-----|-------|-------------|
| `@patologias_trial_start` | EncryptedStorage | Inicio del trial (key legacy — NO renombrar) |
| `@patologias_subscription` | EncryptedStorage | Estado de suscripción (key legacy) |
| `@curso_activated` | EncryptedStorage | Activación por código (migra desde `@patologias_activated`) |
| `@curso_progress_v2` | AsyncStorage | Subtemas leídos + último módulo + recientes |
| `@patologias_onboarding_complete` | AsyncStorage | Onboarding completado (key legacy) |
| `@manual_theme` | AsyncStorage | Tema (migra desde `@patologias_theme`) |

Las keys legacy heredadas de Patologías se conservan a propósito: renombrarlas
resetearía trial/activación/onboarding de instalaciones existentes.

## Diseño Visual

- **Color primario**: Azul médico `#0EA5E9` (Patologías usa violeta, Farmacológica otro azul)
- **Estilo**: Neumorphism con sombras suaves + hero cards con fotos clínicas
- **Imágenes**: fotos clínicas royalty-free bundleadas (`utils/cursoImages.ts`)
- **Íconos**: MaterialCommunityIcons solo como indicadores pequeños
- **Tipografía**: system fonts con responsive scaling (`utils/responsive.ts`)
- **Dark mode**: completo, selector Claro/Oscuro/Sistema

## Decisiones de Arquitectura

| Decisión | Razón |
|----------|-------|
| JSON estático vs API | Funciona offline en hospitales sin WiFi |
| require() directo vs SQLite | ~2.5 MB de data cabe en memoria; sin deps nativas extra |
| Stack único sin tabs | App lineal: home → módulo → contenido; tabs sobraban |
| SHA-256 puro en JS | Sin dependencias nativas para validación de código |
| premiumLogic puro extraído | Lógica revenue-critical testeable sin React/nativos |
| Pre-bundle JS commiteado en assets | Bug de Metro BundleDownloader en Windows con RN 0.84 |
| JDK 21 vs Java 25 | Java 25 rompe CMake del Android Gradle Plugin |
| Keys de storage legacy | Migración transparente desde builds tempranos sin resetear usuarios |
| Neumorphism | Diferencia visual de apps médicas genéricas |
