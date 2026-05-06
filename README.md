# Manual de Enfermería

Aplicación móvil de referencia y estudio integral para estudiantes y profesionales de enfermería. Cubre 10 módulos con 56 subtemas — desde fundamentos hasta emergencias — más glosario, buscador full-text y progreso de lectura persistente.

Forma parte de un ecosistema de 3 apps:
- **Manual de Enfermería** (esta app · CÓMO se hace)
- **Patologías de Enfermería** (QUÉ tiene el paciente · 151 patologías por sistema)
- **Guía Farmacológica** (QUÉ le doy · 2.877 fármacos)

## Características v1.0

- **10 módulos · 56 subtemas** estructurados con bloques tipados (párrafo, listas, cards de alerta, tablas, grids)
- **Bloques clínicos**: insight, tip, alert, warn — con dark mode propio
- **Glosario** de 94 siglas y abreviaturas (búsqueda accent-insensitive)
- **Buscador full-text** en subtemas + glosario, navegación directa al contenido
- **Progreso de lectura** por subtema con AsyncStorage debounceado
- **Continuar último módulo** + carrusel "Recién visto"
- **Modo oscuro/claro/sistema** con selector de 3 chips
- **Mi Suite** con deep links a Patologías + Farmacológica
- **Onboarding** 4 slides con stats animadas
- **Premium** con trial 15 días y activación por código (SHA-256)
- **Offline first** — toda la data es local, sin red

## Stack Tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React Native | 0.84.1 | Framework mobile |
| TypeScript | 5.8 | Tipado estático |
| React Navigation | 7.x | Stack navigator |
| AsyncStorage | 2.x | Persistencia de progreso + tema |
| EncryptedStorage | - | Estado Premium en Keystore |
| LinearGradient | - | Gradientes UI |
| Vector Icons | - | Material Community Icons |
| Safe Area Context | - | Safe areas Android |

## Estructura del proyecto

```
src/
├── assets/images/
│   └── conditions/        # imágenes clínicas para módulos y onboarding
├── components/            # ProgressBar, ErrorBoundary, etc.
├── config/                # features flags
├── context/               # ThemeContext, PremiumContext, CursoProgressContext
├── data/
│   ├── curso.json         # 10 módulos · 56 subtemas (~2.5 MB)
│   └── glosario.json      # 94 siglas
├── hooks/                 # useResponsiveScale, useOnboarding, useFadeIn
├── navigation/
│   └── AppNavigator.tsx   # stack con 11 screens
├── screens/               # 11 pantallas (Curso, Modulo, Glosario, Buscador, MiSuite, Settings, etc.)
├── types/
│   ├── index.ts           # RootStackParamList
│   └── curso.ts           # discriminated unions de bloques
└── utils/
    ├── colors.ts          # LIGHT_COLORS + DARK_COLORS
    ├── cursoImages.ts     # mapeo imageKey → require()
    └── responsive.ts      # escalado responsive
```

## Configuración Android

- **Namespace**: `com.cursoenfermeria`
- **App name** (launcher): "Manual de Enfermería"
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 36 (Android 16)
- **Flavors**: `free` (trial + suscripción) y `premium` (todo desbloqueado)
- **Versión actual**: v1.0.0 (versionCode 1)

## Desarrollo

### Requisitos
- Node.js 18+
- **JDK 21** (Android Studio JBR) — NO Java 25 (CMake crashea)
- Android SDK 36 + NDK

### Setup
```bash
npm install
```

### Build release (APK)
```bash
export JAVA_HOME="C:/Program Files/Android/Android Studio/jbr"
export JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8"

# Pre-bundle JS (obligatorio por bug Metro en Windows)
npx react-native bundle --platform android --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/

cd android
rm -rf app/build/intermediates/assets/freeRelease  # invalidar cache Hermes
./gradlew app:assembleFreeRelease --no-build-cache
```

### Build AAB (Play Store)
```bash
cd android && ./gradlew app:bundleFreeRelease
```

### Reglas críticas de build
- **NUNCA** usar Java 25 — CMake crashea con `restricted method`
- **SIEMPRE** pre-bundlear antes del build — Metro BundleDownloader falla en Windows
- **NUNCA** correr `./gradlew clean` — invalida cache CMake
- Emulador API 36 tiene ~600 MB libre — `pm uninstall` + `pm trim-caches` antes de install

## Modelo de monetización

| Concepto | Detalle |
|----------|---------|
| Trial | 15 días de prueba con acceso completo |
| Free después del trial | Módulos 1 y 2 abiertos · resto premium |
| Suscripción | Mensual vía Google Play (`patologias_premium_monthly`) |
| Activación por código | Easter egg: Settings → tap repetido en versión |

## Roadmap

Ver [ROADMAP.md](./ROADMAP.md) para el plan v1.0 → v2.0 (iOS, OTA, multi-idioma, quiz, casos clínicos).

## Documentos del proyecto

- `ARCHITECTURE.md` — diseño de bloques tipados y renderer
- `CHANGELOG.md` — historial de versiones
- `PROGRESO.md` — registro detallado de cada sesión
- `ROADMAP.md` — plan de evolución
- `CLAUDE.md` — instrucciones para Claude Code (build, reglas, estructura)

## Contacto

- **Email**: alexq2005@gmail.com

## Licencia

Todos los derechos reservados. Software propietario.
