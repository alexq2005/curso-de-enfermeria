// ============================================================
// Curso de Enfermería — Type definitions
// ============================================================

export type CursoBlockType =
  | 'p'
  | 'h4'
  | 'list'
  | 'ol'
  | 'card'
  | 'table'
  | 'grid'
  | 'image'
  | 'crosslink';

export type CursoCardVariant = 'insight' | 'tip' | 'alert' | 'warn';

export type CrosslinkTarget = 'patologias' | 'farmacologia';

export interface CursoCardItem {
  title: string;
  text: string;
}

export type CursoBlock =
  | { type: 'p'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'ol'; items: string[] }
  | {
      type: 'card';
      variant: CursoCardVariant;
      title: string;
      text?: string;
      items?: string[];
    }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'grid'; cards: CursoCardItem[] }
  | { type: 'image'; src: string; caption?: string }
  | {
      type: 'crosslink';
      target: CrosslinkTarget;
      title: string;
      description: string;
      path?: string;
    };

export interface CursoSub {
  id: string;
  title: string;
  blocks: CursoBlock[];
}

export interface CursoModulo {
  id: string;
  num: number;
  title: string;
  lead: string;
  imageKey: string;
  iconName: string;
  gradient: [string, string];
  subs: CursoSub[];
  isPremium: boolean;
}

export interface CursoData {
  version: string;
  modulos: CursoModulo[];
}
