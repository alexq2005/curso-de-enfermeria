# Manual de Enfermería — Project Instructions

App React Native 0.84.1 + TypeScript ("Manual de Enfermería", antes "Curso de
Enfermería"). Curso integral offline con 10 módulos, glosario clínico y
buscador global. Parte del ecosistema de 3 apps junto a Patologías de
Enfermería y Guía Farmacológica.

## Build Commands

```bash
# OBLIGATORIO: usar JDK 21, NO Java 25
export JAVA_HOME="C:/Program Files/Android/Android Studio/jbr"
export JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8"

# Pre-bundle JS (obligatorio antes de build por bug Metro Windows)
npx react-native bundle --platform android --dev false --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/

# Build debug
cd android && ./gradlew app:assembleFreeDebug

# Build release (APK)
cd android && ./gradlew app:assembleFreeRelease app:assemblePremiumRelease

# Build release (AAB para Play Store)
cd android && ./gradlew app:bundleFreeRelease

# Instalar en emulador
adb install -g android/app/build/outputs/apk/free/release/app-free-release.apk
```

## Verificación (correr tras cada cambio en src/)

```bash
npx tsc --noEmit                      # 0 errores esperados
npm test -- --ci                      # todos los tests en verde
npx eslint src --ext .ts,.tsx         # 0 errores (warnings de inline-styles OK)
```

CI en `.github/workflows/ci.yml` corre estos 3 jobs en push/PR a `main`.

## Critical Rules

- **NEVER use Java 25** for Gradle builds — CMake crashes with `restricted method` error
- **ALWAYS pre-bundle JS** before build — Metro BundleDownloader fails on Windows emulator.
  El bundle `android/app/src/main/assets/index.android.bundle` está COMMITEADO
  a propósito (workaround del bug de Metro en Windows) — regenerarlo y
  commitearlo cuando cambie src/ o los JSON de datos
- **NEVER run `./gradlew clean`** — invalidates CMake cache, Java 25 can't rebuild
- Gradle bundle task NO detecta cambios solo-data (curso.json/glosario.json):
  usar `--rerun-tasks` + `--reset-cache` en esos casos
- Emulator API 36 has ~600MB free — `pm uninstall` + `pm trim-caches` before install
- Emulator takes ~25-40 seconds to initialize Hermes

## Project Structure

- `src/data/curso.json` — 10 módulos · 56 subtemas · 178 bloques tipados (~2.5 MB), fuente principal
- `src/data/glosario.json` — 178 entradas (sigla/término + significado, `tipos?`/`ejemplos?` opcionales)
- `src/types/curso.ts` — discriminated unions de bloques (p, h4, list, ol, card, table, grid, image, crosslink)
- `src/navigation/AppNavigator.tsx` — native-stack con 11 screens (SIN tabs)
- `src/context/` — ThemeContext (light/dark/system), PremiumContext (trial/sub/código), CursoProgressContext (subtemas leídos)
- `src/utils/premiumLogic.ts` — lógica premium PURA y testeada (REVENUE-CRITICAL, no tocar sin correr tests)
- `src/utils/activation.ts` — validación de código por SHA-256 puro en JS
- `src/utils/cursoImages.ts` — mapeo imageKey → assets bundleados
- Contact email: alexq2005@gmail.com (in About, Terms, Privacy screens)

## Premium System

- Free: módulos 1-2 (`isPremium: false` en curso.json) + glosario + buscador
- Premium: los 10 módulos completos
- Trial: 15 días, EncryptedStorage `@patologias_trial_start` (key legacy — NO renombrar,
  resetearía el trial de instalaciones existentes)
- Subscription SKU: `curso_premium_monthly` (PENDIENTE crear en Play Console)
- Play Store listing: `com.cursoenfermeria.free` (se publica el flavor free)
- Código de activación: input directo en PremiumScreen + easter egg en Settings
  (tap 5× en la fila de versión); validación SHA-256 en `utils/activation.ts`
- Flavor `free`: IS_FREE=true → gating + trial. Flavor `premium`: todo desbloqueado
- `IS_PREMIUM_BUILD = !(BuildConfigModule.IS_FREE)`
- Lógica derivada en `utils/premiumLogic.ts` (computeTrialDaysLeft con guard
  NaN/Infinity fail-closed y clamp anti clock-rollback) — tests en
  `__tests__/premiumLogic.test.ts`

## Design Preferences

- Color primario: Azul médico `#0EA5E9` (diferenciado de Patologías, violeta)
- Hero cards con fotos clínicas + gradient overlays (NOT flat icons)
- Neumorphic card style para light mode (`utils/neumorphism.ts`)
- Dark mode completo (selector Claro/Oscuro/Sistema en Settings)
- Responsive scaling vía `useResponsiveScale` (`utils/responsive.ts`)

## Play Store

- AAB: `android/app/build/outputs/bundle/freeRelease/app-free-release.aab`
- applicationId: `com.cursoenfermeria` (premium) / `com.cursoenfermeria.free` (free)
- All docs in `playstore/` folder
- Privacy policy needs to be hosted publicly (GitHub Pages recommended)
