let positions = [], velocities = [];
let n = 5, k = 1, damping = 0, mass = 1, simSpeed = 1, amplitude = 50, coils = 8;
let isPaused = true, selectedBead = -1;
let boundary = { left: 'Fija', right: 'Fija' };

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100);
    createControls();
    resetSystem();
    frameRate(60);
}

function resetSystem() {
    n = parseInt(document.getElementById('nSlider').value);
    positions = new Array(n).fill(0);
    velocities = new Array(n).fill(0);
    
    // Condición inicial visible
    const mid = Math.floor(n/2);
    positions[mid] = height/4;
    isPaused = true;
    updateButtonText();
}

function createControls() {
    const panel = document.getElementById('controls');
    panel.innerHTML = `
        <div class="control-group">
            <h3 style="margin:0 0 15px 0; color: #2d3748;">🏗️ Controles</h3>
            
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

            <div class="control-row" style="gap:8px; margin-top:10px;">
                <button id="resetBtn">🔄 Reset</button>
                <button id="pauseBtn">⏸️ Pausa</button>
                <button id="randomBtn">🎲 Aleatorio</button>
            </div>
        </div>
    `;

    const updateLabels = () => {
        document.querySelectorAll('.value-display').forEach(span => {
            const input = document.getElementById(span.id.replace('Value', 'Slider'));
            span.textContent = input.value;
        });
    };

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateLabels);
        if(input.id === 'nSlider') input.addEventListener('input', resetSystem);
    });

    document.getElementById('resetBtn').addEventListener('click', resetSystem);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('randomBtn').addEventListener('click', () => {
        positions = positions.map(() => random(-height/4, height/4));
    });

    document.getElementById('leftBound').addEventListener('change', (e) => boundary.left = e.target.value);
    document.getElementById('rightBound').addEventListener('change', (e) => boundary.right = e.target.value);

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
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = dist(x1, y1, x2, y2);
    const angle = atan2(dy, dx);
    const segments = coils * 10;
    
    push();
    translate(x1, y1);
    rotate(angle);
    
    // Resorte azul con efecto 3D
    stroke(210, 100, 70);  // Azul brillante (HSB: 210°, 100%, 70%)
    strokeWeight(3);
    noFill();
    beginShape();
    for(let i = 0; i <= segments; i++) {
        const t = i/segments;
        const x = t * length;
        const y = 12 * sin(t * TWO_PI * coils);
        vertex(x, y);
    }
    endShape();
    
    // Extremos metálicos
    fill(210, 100, 90);
    noStroke();
    ellipse(0, 0, 8, 8);
    ellipse(length, 0, 8, 8);
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

function mouseReleased() {
    selectedBead = -1;
}

function draw() {
    background(240);  // Fondo gris claro
    
    if(!isPaused) {
        const dt = 0.016 * parseFloat(document.getElementById('speedSlider').value);
        damping = parseFloat(document.getElementById('dampSlider').value);
        const accelerations = calculateForces();
        
        for(let i = 0; i < n; i++) {
            velocities[i] = velocities[i] * (1 - damping) + accelerations[i] * dt;
            positions[i] += velocities[i] * dt;
        }
        applyBoundaryConditions();
    }
    
    const spacing = width / (n + 1);
    
    // Dibujar resortes primero
    for(let i = 0; i < n - 1; i++) {
        drawSpring(
            (i + 1) * spacing, height/2 + positions[i],
            (i + 2) * spacing, height/2 + positions[i + 1]
        );
    }
    
    // Dibujar cuentas después
    fill(210, 100, 90);  // Azul vibrante
    noStroke();
    for(let i = 0; i < n; i++) {
        ellipse((i + 1) * spacing, height/2 + positions[i], 30, 30);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}