import type { RelationshipKey } from '../types';
import { MODES } from '../types';
import styles from './Legend.module.css';

interface Props {
  currentMode: RelationshipKey;
  onSelect: (mode: RelationshipKey) => void;
}

export function Legend({ currentMode, onSelect }: Props) {
  return (
    <div className={styles.legend} role="toolbar" aria-label="Relationship modes">
      {MODES.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`${styles.mode} ${styles[`mode${key}`]} ${currentMode === key ? styles.selected : ''}`}
          onClick={() => onSelect(key)}
          aria-pressed={currentMode === key}
        >
          <span className={styles.dot} aria-hidden="true">
            {currentMode === key && (
              <span className={styles.check} aria-hidden="true" />
            )}
          </span>
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </div>
  );
}
