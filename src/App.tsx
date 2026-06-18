import { useMatrix } from './hooks/useMatrix';
import { Legend } from './components/Legend';
import { ProximityMatrix } from './components/ProximityMatrix';
import { AddSpaceForm } from './components/AddSpaceForm';
import './App.css';

export default function App() {
  const {
    spaces,
    relationships,
    currentMode,
    selectMode,
    paintCell,
    addSpace,
    removeSpace,
    renameSpace,
  } = useMatrix();

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Proximity Matrix</h1>
        <p className="subtitle">
          Select a relationship type, then click cells to define spatial relationships
        </p>
      </header>

      <main className="main">
        <Legend currentMode={currentMode} onSelect={selectMode} />

        <ProximityMatrix
          spaces={spaces}
          relationships={relationships}
          currentMode={currentMode}
          onPaint={paintCell}
          onRename={renameSpace}
          onRemove={removeSpace}
        />

        <AddSpaceForm onAdd={addSpace} />
      </main>
    </div>
  );
}
