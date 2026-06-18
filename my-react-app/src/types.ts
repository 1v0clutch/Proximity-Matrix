export type RelationshipKey = 'E' | 'I' | 'C' | 'N' | 'S' | 'X';

export interface RelationshipType {
  name: string;
  className: string;
}

export const RELATIONSHIP_TYPES: Record<Exclude<RelationshipKey, 'X'>, RelationshipType> = {
  E: { name: 'Essential',  className: 'essential'  },
  I: { name: 'Important',  className: 'important'  },
  C: { name: 'Convenient', className: 'convenient' },
  N: { name: 'Neutral',    className: 'neutral'    },
  S: { name: 'Separate',   className: 'separate'   },
};

export const MODES: { key: RelationshipKey; label: string }[] = [
  { key: 'E', label: 'Essential'  },
  { key: 'I', label: 'Important'  },
  { key: 'C', label: 'Convenient' },
  { key: 'N', label: 'Neutral'    },
  { key: 'S', label: 'Separate'   },
  { key: 'X', label: 'Clear'      },
];

export const DEFAULT_SPACES = ['Admin', 'Surgery', 'Inpatient', 'ICU', 'Pharmacy'];
