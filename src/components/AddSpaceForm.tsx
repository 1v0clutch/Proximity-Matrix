import { useState } from 'react';
import styles from './AddSpaceForm.module.css';

interface Props {
  onAdd: (name: string) => boolean;
}

export function AddSpaceForm({ onAdd }: Props) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim()) return;
    const ok = onAdd(value);
    if (ok) setValue('');
  };

  return (
    <div className={styles.form}>
      <input
        className={styles.input}
        type="text"
        value={value}
        maxLength={20}
        placeholder="Add new space (e.g., Lobby, Kitchen)"
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        aria-label="New space name"
      />
      <button
        className={styles.btn}
        type="button"
        onClick={submit}
      >
        Add Space
      </button>
    </div>
  );
}
