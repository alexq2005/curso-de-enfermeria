// ============================================================
// CursoProgressContext — Tracking de subtemas leídos + último módulo
// ============================================================

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cursoData from '../data/curso.json';
import type { CursoData } from '../types/curso';

const STORAGE_KEY = '@curso_progress_v2';
const MAX_RECENT = 5;
const PERSIST_DEBOUNCE_MS = 300;

interface PersistedState {
  readSubs: string[];
  lastModuloId: string | null;
  recentModuloIds: string[];
}

interface ProgressContextValue {
  ready: boolean;
  isRead: (subId: string) => boolean;
  toggleRead: (subId: string) => void;
  recordOpenModulo: (moduloId: string) => void;
  lastModuloId: string | null;
  recentModuloIds: string[];
  getModuloProgress: (moduloId: string) => {
    read: number;
    total: number;
    pct: number;
  };
  globalProgress: { read: number; total: number; pct: number };
  resetProgress: () => void;
}

const Ctx = createContext<ProgressContextValue | null>(null);
const data = cursoData as CursoData;

const moduloSubCount: Record<string, number> = Object.fromEntries(
  data.modulos.map(m => [m.id, m.subs.length]),
);
const totalSubsCount = data.modulos.reduce((acc, m) => acc + m.subs.length, 0);

export function CursoProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [readSubs, setReadSubs] = useState<Set<string>>(new Set());
  const [lastModuloId, setLastModuloId] = useState<string | null>(null);
  const [recentModuloIds, setRecentModuloIds] = useState<string[]>([]);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as PersistedState;
          if (Array.isArray(parsed.readSubs))
            setReadSubs(new Set(parsed.readSubs));
          if (
            parsed.lastModuloId === null ||
            typeof parsed.lastModuloId === 'string'
          ) {
            setLastModuloId(parsed.lastModuloId);
          }
          if (Array.isArray(parsed.recentModuloIds))
            setRecentModuloIds(parsed.recentModuloIds);
        }
      } catch (e) {
        console.warn('[CursoProgress] failed to load', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      const payload: PersistedState = {
        readSubs: Array.from(readSubs),
        lastModuloId,
        recentModuloIds,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(e =>
        console.warn('[CursoProgress] failed to persist', e),
      );
    }, PERSIST_DEBOUNCE_MS);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [ready, readSubs, lastModuloId, recentModuloIds]);

  const isRead = useCallback(
    (subId: string) => readSubs.has(subId),
    [readSubs],
  );

  const toggleRead = useCallback((subId: string) => {
    setReadSubs(prev => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId);
      else next.add(subId);
      return next;
    });
  }, []);

  const recordOpenModulo = useCallback((moduloId: string) => {
    setLastModuloId(moduloId);
    setRecentModuloIds(prev => {
      const filtered = prev.filter(id => id !== moduloId);
      return [moduloId, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const getModuloProgress = useCallback(
    (moduloId: string) => {
      const total = moduloSubCount[moduloId] ?? 0;
      const modSubs = data.modulos.find(m => m.id === moduloId)?.subs ?? [];
      const read = modSubs.reduce(
        (acc, s) => acc + (readSubs.has(s.id) ? 1 : 0),
        0,
      );
      const pct = total === 0 ? 0 : Math.round((read / total) * 100);
      return { read, total, pct };
    },
    [readSubs],
  );

  const globalProgress = useMemo(() => {
    const read = readSubs.size;
    const total = totalSubsCount;
    const pct = total === 0 ? 0 : Math.round((read / total) * 100);
    return { read, total, pct };
  }, [readSubs]);

  const resetProgress = useCallback(() => {
    setReadSubs(new Set());
    setLastModuloId(null);
    setRecentModuloIds([]);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      isRead,
      toggleRead,
      recordOpenModulo,
      lastModuloId,
      recentModuloIds,
      getModuloProgress,
      globalProgress,
      resetProgress,
    }),
    [
      ready,
      isRead,
      toggleRead,
      recordOpenModulo,
      lastModuloId,
      recentModuloIds,
      getModuloProgress,
      globalProgress,
      resetProgress,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCursoProgress() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error(
      'useCursoProgress must be used within CursoProgressProvider',
    );
  return ctx;
}
