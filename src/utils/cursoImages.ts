// ============================================================
// Curso Images — maps module imageKey to bundled photo assets
// ============================================================
// Until src/assets/curso/*.jpg are downloaded via selector-imagenes.html,
// we fall back to existing images of the asset library.

import type { ImageSourcePropType } from 'react-native';

const CURSO_IMAGES: Record<string, ImageSourcePropType> = {
  m1_hero:          require('../assets/images/conditions/iv_drip.jpg'),
  m2_anatomia:      require('../assets/images/systems/cardiovascular.jpg'),
  m3_signos:        require('../assets/images/conditions/heart_monitor.jpg'),
  m4_bioseguridad:  require('../assets/images/conditions/virus.jpg'),
  m5_equipamiento:  require('../assets/images/conditions/iv_drip.jpg'),
  m6_patologias:    require('../assets/images/conditions/ecg.jpg'),
  m7_tecnicas:      require('../assets/images/conditions/bandage.jpg'),
  m8_farmacologia:  require('../assets/images/conditions/glucose.jpg'),
  m9_emergencias:   require('../assets/images/conditions/surgery.jpg'),
  m10_comunicacion: require('../assets/images/conditions/brain_ct.jpg'),
};

export function getCursoImage(imageKey: string): ImageSourcePropType {
  return CURSO_IMAGES[imageKey] || CURSO_IMAGES.m1_hero;
}
