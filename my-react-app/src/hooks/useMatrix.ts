import { useState, useCallback } from 'react';
import { DEFAULT_SPACES, type RelationshipKey } from '../types';

/**
 * Builds a fresh triangular relationships matrix for n spaces.
 * Row r (0-indexed) has r+1 cells.
 */
function buildRelationships(n: number): string[][] {
  return Array.from({ length: n }, (_, r) => new Array(r + 1).fill(''));
}

export function useMatrix() {
  const [spaces, setSpaces] = useState<string[]>([...DEFAULT_SPACES]);
  const [relationships, setRelationships] = useState<string[][]>(() =>
    buildRelationships(DEFAULT_SPACES.length)
  );
  const [currentMode, setCurrentMode] = useState<RelationshipKey>('E');

  // ── Mode ──────────────────────────────────────────────────────────────────
  const selectMode = useCallback((mode: RelationshipKey) => {
    setCurrentMode(mode);
  }, []);

  // ── Paint ─────────────────────────────────────────────────────────────────
  const paintCell = useCallback((row: number, col: number, mode: RelationshipKey) => {
    setRelationships(prev => {
      if (row < 0 || row >= prev.length) return prev;
      const next = prev.map(r => [...r]);
      if (!next[row] || col < 0 || col >= next[row].length) return prev;

      if (mode === 'X') {
        next[row][col] = '';
      } else {
        next[row][col] = next[row][col] === mode ? '' : mode;
      }
      return next;
    });
  }, []);

  // ── Add space ─────────────────────────────────────────────────────────────
  const addSpace = useCallback((name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    setSpaces(prev => {
      const next = [...prev, trimmed];
      setRelationships(buildRelationships(next.length));
      return next;
    });
    return true;
  }, []);

  // ── Remove space ──────────────────────────────────────────────────────────
  const removeSpace = useCallback((index: number) => {
    setSpaces(prev => {
      if (prev.length <= 2) return prev;
      const next = prev.filter((_, i) => i !== index);
      setRelationships(prevRel => {
        const n = prev.length;
        const updated = prevRel.map(row => [...row]);
        // Remove column `index` from all rows that have it
        for (let r = index + 1; r < n; r++) {
          if (updated[r] && updated[r].length > index) {
            updated[r].splice(index, 1);
          }
        }
        updated.pop(); // remove the last row
        return updated;
      });
      return next;
    });
  }, []);

  // ── Rename space ──────────────────────────────────────────────────────────
  const renameSpace = useCallback((index: number, newName: string) => {
    setSpaces(prev => {
      const next = [...prev];
      next[index] = newName.trim() || `Space ${index + 1}`;
      return next;
    });
  }, []);

  return {
    spaces,
    relationships,
    currentMode,
    selectMode,
    paintCell,
    addSpace,
    removeSpace,
    renameSpace,
  };
}
