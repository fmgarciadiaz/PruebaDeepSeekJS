let positions = [], velocities = [];
let n = 5, k = 1, damping = 0, mass = 1, simSpeed = 1, amplitude = 50, coils = 8;
let isPaused = true, selectedBead = -1;
let boundary = { left: 'Fija', right: 'Fija' };
let trajectoryPanel;
let hoveredBead = -1;
let showTooltip = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100);
    createControls();
    resetSystem();
    frameRate(60);
    trajectoryPanel = new TrajectoryPanel();
}

function resetSystem() {
    n = parseInt(document.getElementById('nSlider').value);
    positions = new Array(n).fill(0);
    velocities = new Array(n).fill(0);
    
    const maxMode = n;
    let selectedMode = parseInt(document.getElementById('modeSelector').value);
    
    // Validación mejorada para Modo 0
    if(selectedMode > maxMode && selectedMode !== 0) {
        selectedMode = maxMode;
        document.getElementById('modeSelector').value = maxMode;
    }
    
    setNormalMode(selectedMode);
    
    if(trajectoryPanel) {
        trajectoryPanel.updateBeads(n);
    }
    isPaused = true;
    updateButtonText();
}

function setNormalMode(mode) {
    const N = positions.length;
    
    if (mode === 0) {
        // Modo cero: todas las posiciones en 0
        positions.fill(0);
    } else {
        // Modos normales existentes
        mode = Math.min(Math.max(1, mode), N);
        for(let i = 0; i < N; i++) {
            positions[i] = amplitude * Math.sin((Math.PI * mode * (i + 1)) / (N + 1));
        }
    }
    velocities.fill(0);
}

function createControls() {
    const panel = document.getElementById('controls');
    const initialN = parseInt(document.getElementById('nSlider')?.value || 5);
    const initialModes = Math.min(initialN, 50);

    panel.innerHTML = `
    
        <div class="control-group">
    <div class="control-group">
            <h3 style="margin:0 0 12px 0; color: #2d3748; font-size: 1.1em;">🏗️ Controles</h3>
            
            <!-- Botones primero -->
            <div class="control-row" style="gap:8px; margin-bottom: 15px;">
                <button id="resetBtn" class="main-button">🔄 Reset</button>
                <button id="pauseBtn" class="main-button">⏸️ Pausa</button>
                <button id="randomBtn" class="main-button">🎲 Aleatorio</button>
            </div>

            <div class="control-row">
                <label>🔢 Cuentas: 
                    <input type="range" id="nSlider" min="1" max="50" value="5">
                    <span class="value-display" id="nValue">5</span>
                </label>
                
                <label>🎚️ Rigidez: 
                    <input type="range" id="kSlider" min="0.1" max="10" step="0.1" value="1">
                    <span class="value-display" id="kValue">1.0</span>
                </label>
            </div>

            <div class="control-row">
                <label>📉 Amortiguación: 
                    <input type="range" id="dampSlider" min="0" max="0.5" step="0.01" value="0">
                    <span class="value-display" id="dampValue">0.00</span>
                </label>
                
                <label>⚖️ Masa: 
                    <input type="range" id="massSlider" min="0.1" max="5" step="0.1" value="1">
                    <span class="value-display" id="massValue">1.0</span>
                </label>
            </div>

            <div class="control-row">
                <label>🏃♂️ Velocidad: 
                    <input type="range" id="speedSlider" min="0.1" max="5" step="0.1" value="1">
                    <span class="value-display" id="speedValue">1.0</span>
                </label>
                
                <label>🌀 Vueltas: 
                    <input type="range" id="coilSlider" min="2" max="20" value="8">
                    <span class="value-display" id="coilValue">8</span>
                </label>
            </div>

            <div class="control-row">
                <label>🔘 Borde Izq:
                    <select id="leftBound">
                        <option>Fija</option>
                        <option>Libre</option>
                        <option>Periódica</option>
                    </select>
                </label>
                
                <label>🔘 Borde Der:
                    <select id="rightBound">
                        <option>Fija</option>
                        <option>Libre</option>
                        <option>Periódica</option>
                    </select>
                </label>
            </div>

            <div class="control-row">
                <label>🎛️ Modo Normal: 
                    <select id="modeSelector">
                        <option value="0">Modo 0 (Cero)</option>
                        ${Array.from({length: initialModes}, (_, i) => 
                            `<option value="${i + 1}">Modo ${i + 1}</option>`
                        ).join('')}
                    </select>
                </label>
            </div>
        </div>
    `;

    const updateLabels = () => {
        document.querySelectorAll('.value-display').forEach(span => {
            const input = document.getElementById(span.id.replace('Value', 'Slider'));
            if(input) span.textContent = input.value;
        });
    };

    document.getElementById('nSlider').addEventListener('input', () => {
        const newN = parseInt(document.getElementById('nSlider').value);
        const modeSelector = document.getElementById('modeSelector');
        const currentMode = parseInt(modeSelector.value);
        
        const newModes = Math.min(newN, 50);
        const selectedMode = currentMode === 0 ? 0 : Math.min(currentMode, newN);
        
        modeSelector.innerHTML = `
            <option value="0" ${0 === selectedMode ? 'selected' : ''}>Modo 0 (Cero)</option>
            ${Array.from({length: newModes}, (_, i) => 
                `<option value="${i + 1}" ${i + 1 === selectedMode ? 'selected' : ''}>Modo ${i + 1}</option>`
            ).join('')}
        `;
        
        resetSystem();
    });

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateLabels);
        if(input.id === 'nSlider') input.addEventListener('input', resetSystem);
    });

    document.getElementById('resetBtn').addEventListener('click', resetSystem);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('randomBtn').addEventListener('click', () => {
        positions = positions.map(() => random(-amplitude, amplitude));
    });

    document.getElementById('leftBound').addEventListener('change', (e) => boundary.left = e.target.value);
    document.getElementById('rightBound').addEventListener('change', (e) => boundary.right = e.target.value);

    document.getElementById('toggleControls').addEventListener('click', () => {
        const panel = document.getElementById('controls');
        panel.classList.toggle('collapsed');
        document.getElementById('toggleControls').textContent = 
            panel.classList.contains('collapsed') ? '▶️' : '◀️';
    });

    document.getElementById('coilSlider').addEventListener('input', (e) => {
        coils = parseInt(e.target.value); // Actualiza la variable global
    });

    updateLabels();
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').innerHTML = isPaused ? '▶️ Play' : '⏸️ Pause';
}

function updateButtonText() {
    document.getElementById('pauseBtn').textContent = isPaused ? 'Play' : 'Pause';
}

function applyBoundaryConditions() {
    const last = positions.length - 1;
    switch(boundary.left) {
        case 'Fija': positions[0] = 0; velocities[0] = 0; break;
        case 'Libre': positions[0] = positions[1]; break;
        case 'Periódica': positions[0] = positions[last]; break;
    }
    switch(boundary.right) {
        case 'Fija': positions[last] = 0; velocities[last] = 0; break;
        case 'Libre': positions[last] = positions[last - 1]; break;
        case 'Periódica': positions[last] = positions[0]; break;
    }
}

function calculateForces() {
    k = parseFloat(document.getElementById('kSlider').value);
    mass = parseFloat(document.getElementById('massSlider').value);
    const accelerations = new Array(n).fill(0);
    
    for(let i = 0; i < n; i++) {
        const left = i > 0 ? positions[i-1] : positions[i];
        const right = i < n-1 ? positions[i+1] : positions[i];
        accelerations[i] = (k * (left + right - 2 * positions[i])) / mass;
    }
    return accelerations;
}

function drawSpring(x1, y1, x2, y2) {
    const beadRadius = 15; // Radio de las cuentas (30px de diámetro)
    const springThickness = 3;
    
    // Calcular dirección y distancia real entre centros
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = dist(x1, y1, x2, y2);
    const angle = atan2(dy, dx);
    
    // Ajustar puntos de inicio/fin al borde de las cuentas
    const startX = x1 + beadRadius * cos(angle);
    const startY = y1 + beadRadius * sin(angle);
    const endX = x2 - beadRadius * cos(angle);
    const endY = y2 - beadRadius * sin(angle);
    
    // Calcular nueva longitud del resorte
    const effectiveLength = dist(startX, startY, endX, endY);
    
    push();
    translate(startX, startY);
    rotate(angle);
    
    // Dibujar resorte
    stroke(210, 100, 70);
    strokeWeight(springThickness);
    noFill();
    beginShape();
    for(let i = 0; i <= coils * 10; i++) {
        const t = i / (coils * 10);
        const x = t * effectiveLength;
        const y = 10 * sin(t * TWO_PI * coils);
        vertex(x, y);
    }
    endShape();
    
    // Dibujar conectores físicos
    fill(210, 100, 70);
    noStroke();
    ellipse(0, 0, springThickness * 2.5); // Conector izquierdo
    ellipse(effectiveLength, 0, springThickness * 2.5); // Conector derecho
    pop();
}

function mousePressed() {
    if(isPaused) {
        const spacing = width / (n + 1);
        for(let i = 0; i < n; i++) {
            const x = (i + 1) * spacing;
            const y = height/2 + positions[i];
            if(dist(mouseX, mouseY, x, y) < 15) {
                selectedBead = i;
                break;
            }
        }
    }
}

function mouseDragged() {
    if(selectedBead >= 0 && isPaused) {
        positions[selectedBead] = mouseY - height/2;
        velocities[selectedBead] = 0;
    }
}

function mouseMoved() {
    hoveredBead = -1;
    const spacing = width / (n + 1);
    for(let i = 0; i < n; i++) {
      const x = (i + 1) * spacing;
      const y = height/2 + positions[i];
      if(dist(mouseX, mouseY, x, y) < 15) {
        hoveredBead = i;
        break;
      }
    }
}

function drawTooltip() {
    if(hoveredBead >= 0) {
      const currentPos = positions[hoveredBead];
      const spacing = width / (n + 1);
      const x = (hoveredBead + 1) * spacing + 15;
      const y = height/2 + currentPos - 15;
  
      push();
      fill(255, 230);
      noStroke();
      rectMode(CORNER);
      rect(x, y - 20, 120, 25, 5);
      
      fill(50);
      textSize(12);
      textAlign(LEFT, CENTER);
      text(`Cuenta ${hoveredBead + 1} | Pos: ${currentPos.toFixed(1)}`, x + 5, y - 8);
      pop();
    }
}



function drawTooltip() {
  if(hoveredBead >= 0) {
    const currentPos = positions[hoveredBead];
    const spacing = width / (n + 1);
    const x = (hoveredBead + 1) * spacing + 15;
    const y = height/2 + currentPos - 15;

    push();
    fill(255, 230);
    noStroke();
    rectMode(CORNER);
    rect(x, y - 20, 120, 25, 5);
    
    fill(50);
    textSize(12);
    textAlign(LEFT, CENTER);
    text(`Cuenta ${hoveredBead + 1} | Pos: ${currentPos.toFixed(1)}`, x + 5, y - 8);
    pop();
  }
}

function mouseReleased() {
    selectedBead = -1;
}

function draw() {
    background(240);
    
    if(!isPaused) {
        const dt = 0.016 * parseFloat(document.getElementById('speedSlider').value);
        damping = parseFloat(document.getElementById('dampSlider').value);
        const accelerations = calculateForces();
        
        for(let i = 0; i < n; i++) {
            velocities[i] = velocities[i] * (1 - damping) + accelerations[i] * dt;
            positions[i] += velocities[i] * dt;
        }
        applyBoundaryConditions();
        trajectoryPanel.addData(positions);
    }
    
    const spacing = width / (n + 1);
    
    // Dibujar resortes
    for(let i = 0; i < n - 1; i++) {
        drawSpring(
            (i + 1) * spacing, height/2 + positions[i],
            (i + 2) * spacing, height/2 + positions[i + 1]
        );
    }
    
    // Dibujar cuentas no seleccionadas primero
    for(let i = 0; i < n; i++) {
        if(!trajectoryPanel.selectedBeads.includes(i)) {
            drawBead((i + 1) * spacing, height/2 + positions[i]);
        }
    }
    
    // Dibujar cuentas seleccionadas con sus colores
    trajectoryPanel.selectedBeads.slice(0, 3).forEach((beadIndex, colorIndex) => {
        const color = trajectoryPanel.colors[colorIndex];
        drawBead((beadIndex + 1) * spacing, height/2 + positions[beadIndex], color);
    });
    
    trajectoryPanel.draw();
    drawTooltip();
}

// function draw() {
//     background(240);
    
//     if(!isPaused) {
//         const dt = 0.016 * simSpeed;
//         const accelerations = calculateForces();
        
//         for(let i = 0; i < n; i++) {
//             velocities[i] = velocities[i] * (1 - damping) + accelerations[i] * dt;
//             positions[i] += velocities[i] * dt;
//         }
//         applyBoundaryConditions();
//         trajectoryPanel.addData(positions);
//     }
    
//     const spacing = width / (n + 1);
    
//     // Dibujar resortes
//     for(let i = 0; i < n - 1; i++) {
//         drawSpring(
//             (i + 1) * spacing, height/2 + positions[i],
//             (i + 2) * spacing, height/2 + positions[i + 1]
//         );
//     }
    
//     // Dibujar cuentas
//     trajectoryPanel.selectedBeads.slice(0, 3).forEach((beadIndex, colorIndex) => {
//         fill(trajectoryPanel.colors[colorIndex]);
//         ellipse((beadIndex + 1) * spacing, height/2 + positions[beadIndex], 30, 30);
//     });
    
//     // Resto de las cuentas
//     fill(210, 100, 100, 0.3);
//     for(let i = 0; i < n; i++) {
//         if(!trajectoryPanel.selectedBeads.includes(i)) {
//             ellipse((i + 1) * spacing, height/2 + positions[i], 30, 30);
//         }
//     }
    
//     trajectoryPanel.draw();
// }


function drawBead(x, y, colorHex = '#A0AEC0') { // Color base gris-azul
    // Convertir HEX a HSL con mayor saturación
    const rgb = parseInt(colorHex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const hsl = RGBToHSL(r, g, b);
    
    // Aumentar saturación y ajustar luminosidad
    const enhancedHsl = {
        h: hsl.h,
        s: Math.min(hsl.s + 20, 100), // +20% de saturación
        l: hsl.l
    };

    // Crear gradiente mejor contrastado
    let gradient = drawingContext.createRadialGradient(
        x - 5, y - 5, 5, 
        x, y, 20
    );
    gradient.addColorStop(0, `hsla(${enhancedHsl.h}, ${enhancedHsl.s}%, ${enhancedHsl.l + 15}%, 1)`);
    gradient.addColorStop(0.5, `hsla(${enhancedHsl.h}, ${enhancedHsl.s}%, ${enhancedHsl.l}%, 1)`);
    gradient.addColorStop(1, `hsla(${enhancedHsl.h}, ${enhancedHsl.s}%, ${enhancedHsl.l - 15}%, 1)`);

    // Círculo principal con gradiente
    push();
    drawingContext.fillStyle = gradient;
    noStroke();
    ellipse(x, y, 30, 30);

    // Reflejo de luz
    fill(255, 180);
    ellipse(x - 6, y - 6, 12, 12);
    
    // Borde sutil para profundidad
    stroke(210, 100, 30);
    noFill();
    strokeWeight(1.5);
    ellipse(x, y, 30, 30);
    pop();

    // Resetear sombras
    drawingContext.shadowColor = 'transparent';
}

// Añade funciones de conversión RGB a HSL
function RGBToHSL(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}