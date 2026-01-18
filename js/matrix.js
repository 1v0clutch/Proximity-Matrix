/**
 * Proximity Matrix - ARE 5.0 Style Adjacency Matrix
 * A clean, interactive tool for creating spatial relationship diagrams
 */

class ProximityMatrix {
  constructor() {
    // Configuration
    this.config = {
      defaultSpaces: [
        'Admin', 'Surgery', 'Inpatient', 'Outpatient', 'Emergency',
        'Ancillary', 'Maternal', 'Food', 'Maintenance', 'Mortuary'
      ],
      relationshipTypes: {
        E: { name: 'Essential', class: 'essential' },
        I: { name: 'Important', class: 'important' },
        C: { name: 'Convenient', class: 'convenient' },
        N: { name: 'Neutral', class: 'neutral' },
        S: { name: 'Separate', class: 'separate' }
      }
    };

    // State
    this.spaces = [...this.config.defaultSpaces];
    this.cornerLabels = { left: 'Left Space', right: 'Right Space' }; // Separate corner labels
    this.currentMode = 'E';
    this.isPainting = false;
    this.relationships = []; // Matrix to store relationships

    // DOM Elements
    this.elements = {
      pyramid: document.getElementById('matrix-pyramid'),
      labels: document.getElementById('space-labels'),
      lines: document.getElementById('connection-lines'),
      spaceInput: document.getElementById('space-input'),
      addButton: document.getElementById('add-space-btn')
    };

    this.init();
  }

  /**
   * Initialize the matrix
   */
  init() {
    this.initializeRelationships();
    this.bindEvents();
    this.render();
    this.setMode('E');
  }

  /**
   * Initialize the relationships matrix
   */
  initializeRelationships() {
    const n = this.spaces.length;
    this.relationships = [];
    
    for (let r = 1; r <= n; r++) {
      const row = new Array(r).fill('');
      this.relationships.push(row);
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Mode selection
    document.querySelectorAll('.mode').forEach(mode => {
      mode.addEventListener('click', () => {
        this.setMode(mode.dataset.mode);
      });
    });

    // Add space functionality
    this.elements.addButton.addEventListener('click', () => this.addSpace());
    this.elements.spaceInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.addSpace();
    });

    // Global pointer events for painting
    this.bindGlobalPointerEvents();
  }

  /**
   * Bind global pointer events for drag painting
   */
  bindGlobalPointerEvents() {
    if (!window._matrixPointerEventsAdded) {
      window.addEventListener('pointerup', () => {
        this.isPainting = false;
      });
      window._matrixPointerEventsAdded = true;
    }
  }

  /**
   * Set the current relationship mode
   */
  setMode(mode) {
    this.currentMode = mode;
    
    document.querySelectorAll('.mode').forEach(el => {
      el.classList.toggle('selected', el.dataset.mode === mode);
    });
  }

  /**
   * Add a new space to the matrix
   */
  addSpace() {
    const value = this.elements.spaceInput.value.trim();
    
    if (!value) {
      this.showMessage('Please enter a space name');
      return;
    }

    if (this.spaces.includes(value)) {
      this.showMessage('Space already exists');
      return;
    }

    this.spaces.push(value);
    this.initializeRelationships();
    this.elements.spaceInput.value = '';
    this.render();
  }

  /**
   * Remove a space from the matrix
   */
  removeSpace(index) {
    if (this.spaces.length <= 2) {
      this.showMessage('Matrix must have at least 2 spaces');
      return;
    }

    // Remove from relationships matrix
    const n = this.spaces.length;
    for (let r = index + 1; r <= n; r++) {
      if (this.relationships[r - 1] && this.relationships[r - 1].length > index) {
        this.relationships[r - 1].splice(index, 1);
      }
    }

    // Remove last row
    this.relationships.pop();
    this.spaces.splice(index, 1);
    this.render();
  }

  /**
   * Paint a cell with the current relationship type
   */
  paintCell(row, col) {
    if (this.currentMode === 'X') {
      // Clear the cell
      this.relationships[row][col] = '';
      return;
    }

    // Toggle: if same mode, clear it
    if (this.relationships[row][col] === this.currentMode) {
      this.relationships[row][col] = '';
    } else {
      this.relationships[row][col] = this.currentMode;
    }
  }

  /**
   * Create a matrix cell element
   */
  createCell(row, col) {
    const cell = document.createElement('div');
    cell.className = 'matrix-cell';
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('role', 'button');
    cell.setAttribute('aria-label', `Cell ${row + 1},${col + 1}`);

    const content = document.createElement('span');
    content.className = 'cell-content';
    cell.appendChild(content);

    // Apply saved relationship if any
    const relationship = this.relationships[row][col];
    if (relationship && this.config.relationshipTypes[relationship]) {
      const type = this.config.relationshipTypes[relationship];
      cell.classList.add(type.class);
      content.textContent = relationship;
    }

    // Event handlers
    const paint = () => {
      this.paintCell(row, col);
      this.updateCell(cell, row, col);
    };

    cell.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.isPainting = true;
      paint();
    });

    cell.addEventListener('pointerenter', () => {
      if (this.isPainting) paint();
    });

    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        paint();
        e.preventDefault();
      }
    });

    return cell;
  }

  /**
   * Update a cell's appearance based on its relationship
   */
  updateCell(cell, row, col) {
    const content = cell.querySelector('.cell-content');
    const relationship = this.relationships[row][col];

    // Clear all relationship classes
    Object.values(this.config.relationshipTypes).forEach(type => {
      cell.classList.remove(type.class);
    });

    if (relationship && this.config.relationshipTypes[relationship]) {
      const type = this.config.relationshipTypes[relationship];
      cell.classList.add(type.class);
      content.textContent = relationship;
    } else {
      content.textContent = '';
    }
  }

  /**
   * Create a space label element
   */
  createLabel(text, index) {
    const label = document.createElement('div');
    label.className = 'space-label';

    const content = document.createElement('div');
    content.className = 'label-content';

    const textEl = document.createElement('div');
    textEl.className = 'label-text';
    textEl.contentEditable = true;
    textEl.textContent = text;
    textEl.setAttribute('role', 'textbox');
    textEl.setAttribute('aria-label', `Edit space ${index + 1}`);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'label-remove';
    removeBtn.textContent = '✕';
    removeBtn.setAttribute('aria-label', `Remove ${text}`);

    // Event handlers
    textEl.addEventListener('blur', () => {
      const newText = textEl.textContent.trim() || `Space ${index + 1}`;
      this.spaces[index] = newText;
      this.render();
    });

    textEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        textEl.blur();
      }
    });

    removeBtn.addEventListener('click', () => {
      this.removeSpace(index);
    });

    content.appendChild(textEl);
    content.appendChild(removeBtn);
    label.appendChild(content);

    return label;
  }

  /**
   * Render the matrix pyramid
   */
  renderPyramid() {
    this.elements.pyramid.innerHTML = '';
    const n = this.spaces.length;

    for (let r = 1; r <= n; r++) {
      const row = document.createElement('div');
      row.className = 'matrix-row';

      for (let c = 0; c < r; c++) {
        const cell = this.createCell(r - 1, c);
        row.appendChild(cell);
      }

      this.elements.pyramid.appendChild(row);
    }
  }

  /**
   * Render the space labels
   */
  renderLabels() {
    this.elements.labels.innerHTML = '';

    this.spaces.forEach((space, index) => {
      const label = this.createLabel(space, index);
      this.elements.labels.appendChild(label);
    });

    // Add side labels
    this.addSideLabels();

    // Position labels after DOM update
    requestAnimationFrame(() => this.positionLabels());
  }

  /**
   * Add side labels for the matrix
   */
  addSideLabels() {
    // Left side label - independent from spaces array
    const leftLabel = this.createCornerLabel(this.cornerLabels.left, 'left');
    this.elements.labels.appendChild(leftLabel);

    // Right side label - independent from spaces array
    const rightLabel = this.createCornerLabel(this.cornerLabels.right, 'right');
    this.elements.labels.appendChild(rightLabel);
  }

  /**
   * Create a corner label element with full functionality
   */
  createCornerLabel(text, side) {
    const label = document.createElement('div');
    label.className = `corner-label ${side}-corner`;

    const content = document.createElement('div');
    content.className = 'corner-content';

    const textEl = document.createElement('div');
    textEl.className = 'corner-text';
    textEl.contentEditable = true;
    textEl.textContent = text;
    textEl.setAttribute('role', 'textbox');
    textEl.setAttribute('aria-label', `Edit ${side} corner space`);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'corner-remove';
    removeBtn.textContent = '✕';
    removeBtn.setAttribute('aria-label', `Move adjacent space to ${side} corner`);

    // Event handlers - independent corner label functionality
    textEl.addEventListener('blur', () => {
      const newText = textEl.textContent.trim() || `${side} Space`;
      this.cornerLabels[side] = newText; // Update corner labels separately
      textEl.textContent = newText;
    });

    textEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        textEl.blur();
      }
    });

    // Clear corner label functionality - shift adjacent labels to corners
    removeBtn.addEventListener('click', () => {
      if (side === 'left' && this.spaces.length > 0) {
        // Move first space to left corner and remove it from spaces
        this.cornerLabels.left = this.spaces[0];
        this.removeSpace(0);
      } else if (side === 'right' && this.spaces.length > 0) {
        // Move last space to right corner and remove it from spaces
        const lastIndex = this.spaces.length - 1;
        this.cornerLabels.right = this.spaces[lastIndex];
        this.removeSpace(lastIndex);
      }
    });

    content.appendChild(textEl);
    content.appendChild(removeBtn);
    label.appendChild(content);

    return label;
  }

  /**
   * Position labels under their corresponding cells
   */
  positionLabels() {
    const rows = this.elements.pyramid.querySelectorAll('.matrix-row');
    if (!rows.length) return;

    const baseRow = rows[rows.length - 1];
    const baseCells = Array.from(baseRow.children);
    const labelsRect = this.elements.labels.getBoundingClientRect();

    const labels = this.elements.labels.querySelectorAll('.space-label');
    labels.forEach((label, index) => {
      const cell = baseCells[index];
      if (!cell) return;

      const cellRect = cell.getBoundingClientRect();
      const cx = cellRect.left + cellRect.width / 2;
      const left = Math.round(cx - labelsRect.left - (label.offsetWidth / 2));
      const top = Math.round(cellRect.bottom - labelsRect.top + 10);

      label.style.left = left + 'px';
      label.style.top = top + 'px';
    });

    // Position side labels
    this.positionSideLabels(baseCells, labelsRect);
  }

  /**
   * Position the side labels next to corner lines
   */
  positionSideLabels(baseCells, labelsRect) {
    if (baseCells.length === 0) return;

    const leftCell = baseCells[0];
    const rightCell = baseCells[baseCells.length - 1];

    // Position left corner label - move further left
    const leftLabel = this.elements.labels.querySelector('.left-corner');
    if (leftLabel && leftCell) {
      const leftRect = leftCell.getBoundingClientRect();
      const leftCx = leftRect.left + leftRect.width / 2;
      const leftCornerX = leftCx - (leftRect.width / 2) * Math.sqrt(2) / 2 - 35; // Move further left
      
      leftLabel.style.left = (leftCornerX - labelsRect.left - (leftLabel.offsetWidth / 2)) + 'px';
      leftLabel.style.top = (leftRect.bottom - labelsRect.top + 10) + 'px';
    }

    // Position right corner label - move further right
    const rightLabel = this.elements.labels.querySelector('.right-corner');
    if (rightLabel && rightCell) {
      const rightRect = rightCell.getBoundingClientRect();
      const rightCx = rightRect.left + rightRect.width / 2;
      const rightCornerX = rightCx + (rightRect.width / 2) * Math.sqrt(2) / 2 + 35; // Move further right
      
      rightLabel.style.left = (rightCornerX - labelsRect.left - (rightLabel.offsetWidth / 2)) + 'px';
      rightLabel.style.top = (rightRect.bottom - labelsRect.top + 10) + 'px';
    }
  }

  /**
   * Render connection lines
   */
  renderConnectionLines() {
    this.elements.lines.innerHTML = '';

    const rows = this.elements.pyramid.querySelectorAll('.matrix-row');
    if (!rows.length) return;

    const containerRect = this.elements.lines.getBoundingClientRect();
    const baseRow = rows[rows.length - 1];
    const baseCells = Array.from(baseRow.children);

    if (baseCells.length === 0) return;

    // Draw vertical lines from each cell
    this.drawVerticalLines(baseCells, containerRect);
    
    // Draw corner lines from leftmost and rightmost cells
    this.drawCornerLines(baseCells, containerRect);
  }

  /**
   * Draw vertical lines from cells to labels
   */
  drawVerticalLines(baseCells, containerRect) {
    baseCells.forEach(cell => {
      const cellRect = cell.getBoundingClientRect();
      const cx = cellRect.left + cellRect.width / 2;
      const cy = cellRect.top + cellRect.height / 2;
      const bottomY = cy + (cellRect.height / 2) * Math.sqrt(2) / 2 + 10; // Move down a bit

      const vLine = this.createLine('vertical');
      vLine.style.left = (cx - containerRect.left - 1) + 'px';
      vLine.style.top = (bottomY - containerRect.top) + 'px';
      vLine.style.height = '70px'; // Shorter since they start lower
      this.elements.lines.appendChild(vLine);
    });
  }

  /**
   * Draw corner lines from leftmost and rightmost cells
   */
  drawCornerLines(baseCells, containerRect) {
    if (baseCells.length === 0) return;

    const leftCell = baseCells[0];
    const rightCell = baseCells[baseCells.length - 1];

    // Left corner line - spread out more from the cell
    const leftRect = leftCell.getBoundingClientRect();
    const leftCx = leftRect.left + leftRect.width / 2;
    const leftCy = leftRect.top + leftRect.height / 2;
    const leftCornerX = leftCx - (leftRect.width / 2) * Math.sqrt(2) / 2 - 15; // Spread out more

    const leftCornerLine = this.createLine('vertical');
    leftCornerLine.style.left = (leftCornerX - containerRect.left - 1) + 'px';
    leftCornerLine.style.top = (leftCy - containerRect.top) + 'px';
    leftCornerLine.style.height = '100px';
    this.elements.lines.appendChild(leftCornerLine);

    // Right corner line - spread out more from the cell
    const rightRect = rightCell.getBoundingClientRect();
    const rightCx = rightRect.left + rightRect.width / 2;
    const rightCy = rightRect.top + rightRect.height / 2;
    const rightCornerX = rightCx + (rightRect.width / 2) * Math.sqrt(2) / 2 + 15; // Spread out more

    const rightCornerLine = this.createLine('vertical');
    rightCornerLine.style.left = (rightCornerX - containerRect.left - 1) + 'px';
    rightCornerLine.style.top = (rightCy - containerRect.top) + 'px';
    rightCornerLine.style.height = '100px';
    this.elements.lines.appendChild(rightCornerLine);
  }

  /**
   * Create a connection line element
   */
  createLine(type) {
    const line = document.createElement('div');
    line.className = `connection-line ${type}`;
    return line;
  }

  /**
   * Show a temporary message to the user
   */
  showMessage(message) {
    // Simple alert for now - could be enhanced with a toast system
    alert(message);
  }

  /**
   * Render the entire matrix
   */
  render() {
    this.renderPyramid();
    this.renderLabels();
    this.renderConnectionLines();
  }
}

// Initialize the matrix when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProximityMatrix();
});