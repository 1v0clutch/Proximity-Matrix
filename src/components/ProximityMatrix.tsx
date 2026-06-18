import { useRef, useLayoutEffect, useCallback, useEffect, useState } from 'react';
import type { RelationshipKey } from '../types';
import styles from './ProximityMatrix.module.css';

/* ── Row colours cycling for label tabs ── */
const ROW_COLORS = [
  '#4a90d9', '#e8743b', '#f0c040', '#8db87a',
  '#b5cca9', '#87ceeb', '#c8a97e', '#d4d4d4',
  '#e88080', '#a0c4a0', '#f4d06f', '#9bb8d4',
];

/* ── Cell fill colours — match Legend indicator dots exactly ── */
const FILL_COLORS: Record<string, string> = {
  E: '#e74c3c',
  I: '#f39c12',
  C: '#2ecc71',
  N: '#ecf0f1',
  S: '#2c3e50',
};

interface Props {
  spaces: string[];
  relationships: string[][];
  currentMode: RelationshipKey;
  onPaint: (row: number, col: number, mode: RelationshipKey) => void;
  onRename: (index: number, name: string) => void;
  onRemove: (index: number) => void;
}

export function ProximityMatrix({ spaces, relationships, currentMode, onPaint, onRename, onRemove }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isPaintingRef = useRef(false);
  const [outerH, setOuterH] = useState<number | undefined>();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const n = spaces.length;

  useEffect(() => {
    const stop = () => { isPaintingRef.current = false; };
    window.addEventListener('pointerup', stop);
    return () => window.removeEventListener('pointerup', stop);
  }, []);

  const computeLayout = useCallback(() => {
    const outer = outerRef.current;
    const wrapper = wrapperRef.current;
    if (!outer || !wrapper) return;

    wrapper.style.transform = 'scale(1)';
    wrapper.style.transformOrigin = 'top left';

    const availW = outer.clientWidth;
    const natW = wrapper.scrollWidth;
    const natH = wrapper.scrollHeight;
    const s = natW > availW && availW > 0 ? availW / natW : 1;

    wrapper.style.transform = `scale(${s})`;
    setOuterH(Math.ceil(natH * s));
  }, []);

  useLayoutEffect(() => { computeLayout(); }, [spaces, computeLayout]);
  useEffect(() => {
    window.addEventListener('resize', computeLayout);
    return () => window.removeEventListener('resize', computeLayout);
  }, [computeLayout]);

  const handlePaint = useCallback(
    (row: number, col: number) => onPaint(row, col, currentMode),
    [onPaint, currentMode]
  );

  return (
    <div
      ref={outerRef}
      className={styles.outer}
      style={outerH !== undefined ? { height: outerH } : undefined}
    >
      <div
        ref={wrapperRef}
        className={styles.wrapper}
        style={{ '--n': n } as React.CSSProperties}
      >
        {/* ── Left: label column (arrow points right) ── */}
        <div className={styles.labelCol}>
          {spaces.map((name, i) => (
            <LabelRow
              key={i}
              index={i}
              name={name}
              color={ROW_COLORS[i % ROW_COLORS.length]}
              isEditing={editingIndex === i}
              onEditStart={() => setEditingIndex(i)}
              onEditEnd={newName => { onRename(i, newName); setEditingIndex(null); }}
              onRemove={() => onRemove(i)}
            />
          ))}
        </div>

        {/* ── Centre: SVG diamond matrix ── */}
        <DiamondMatrix
          n={n}
          spaces={spaces}
          relationships={relationships}
          isPaintingRef={isPaintingRef}
          onPaint={handlePaint}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Diamond matrix — rendered as an SVG grid.
   Each cell spans between space u and space v (u < v).
   Lines meeting at 45 degrees form the cell boundaries.
══════════════════════════════════════════════════════════════════ */
interface DiamondProps {
  n: number;
  spaces: string[];
  relationships: string[][];
  isPaintingRef: React.MutableRefObject<boolean>;
  onPaint: (row: number, col: number) => void;
}

function DiamondMatrix({ n, spaces, relationships, isPaintingRef, onPaint }: DiamondProps) {
  const ROW_H = 30;
  const totalW = n * (ROW_H / 2);
  const totalH = n * ROW_H;

  // Render grid lines
  const lines: React.ReactNode[] = [];
  // Down-right lines starting at (0, k * ROW_H)
  for (let k = 0; k < n; k++) {
    const x1 = 0;
    const y1 = k * ROW_H;
    const x2 = (n - k) * (ROW_H / 2);
    const y2 = (n + k) * (ROW_H / 2);
    lines.push(
      <line
        key={`dr-${k}`}
        className={styles.gridLine}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
      />
    );
  }
  // Up-right lines starting at (0, v * ROW_H)
  for (let v = 1; v <= n; v++) {
    const x1 = 0;
    const y1 = v * ROW_H;
    const x2 = v * (ROW_H / 2);
    const y2 = v * (ROW_H / 2);
    lines.push(
      <line
        key={`ur-${v}`}
        className={styles.gridLine}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
      />
    );
  }

  // Render cell interactive overlays
  const cells: React.ReactNode[] = [];
  for (let v = 1; v < n; v++) {
    for (let u = 0; u < v; u++) {
      const xc = (v - u) * (ROW_H / 2);
      const yc = (u + v + 1) * (ROW_H / 2);

      const val = relationships[v]?.[u] ?? '';
      const fillColor = val ? (FILL_COLORS[val] ?? '#e74c3c') : undefined;

      const points = `${xc - ROW_H / 2},${yc} ${xc},${yc - ROW_H / 2} ${xc + ROW_H / 2},${yc} ${xc},${yc + ROW_H / 2}`;

      cells.push(
        <g
          key={`${v}-${u}`}
          className={styles.cellGroup}
          role="button"
          tabIndex={0}
          //title={`${spaces[u]} × ${spaces[v]}`}
          aria-label={`${spaces[u]} × ${spaces[v]}${val ? ': ' + val : ''}`}
          aria-pressed={!!val}
          onPointerDown={e => {
            e.preventDefault();
            isPaintingRef.current = true;
            onPaint(v, u);
          }}
          onPointerEnter={() => {
            if (isPaintingRef.current) {
              onPaint(v, u);
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onPaint(v, u);
            }
          }}
        >
          <title>{`${spaces[u]} × ${spaces[v]}`}</title>
          <polygon className={styles.cellDiamond} points={points} />
          <circle
            className={`${styles.cellCircle} ${val ? styles.cellCircleFilled : ''}`}
            cx={xc}
            cy={yc}
            r={8}
            style={val ? { fill: fillColor, stroke: fillColor } : undefined}
          />
          {val && (
            <text
              className={`${styles.cellText} ${val === 'N' ? styles.cellTextNeutral : ''}`}
              x={xc}
              y={yc}
            >
              {val}
            </text>
          )}
        </g>
      );
    }
  }

  return (
    <div className={styles.matrixArea}>
      <svg
        className={styles.matrixSvg}
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
      >
        {/* Draw grid lines first so cells sit on top */}
        {lines}
        {cells}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Label row
══════════════════════════════════════════════════════════════════ */
interface LabelRowProps {
  index: number;
  name: string;
  color: string;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: (name: string) => void;
  onRemove: () => void;
}

function LabelRow({ name, color, isEditing, onEditStart, onEditEnd, onRemove }: LabelRowProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  return (
    <div className={styles.labelRow}>
      <div className={styles.labelBg} style={{ background: color }} />
      <div
        ref={ref}
        className={styles.labelText}
        contentEditable={isEditing || undefined}
        suppressContentEditableWarning
        onDoubleClick={onEditStart}
        onBlur={e => { if (isEditing) onEditEnd(e.currentTarget.textContent ?? ''); }}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLElement).blur(); }
          if (e.key === 'Escape') { (e.target as HTMLElement).blur(); }
        }}
      >
        {name}
      </div>
      <div className={styles.labelActions}>
        <button className={styles.editBtn} type="button" onClick={onEditStart} aria-label={`Edit ${name}`} title="Rename">✎</button>
        <button className={styles.removeBtn} type="button" onClick={onRemove} aria-label={`Remove ${name}`} title="Remove">✕</button>
      </div>
    </div>
  );
}

