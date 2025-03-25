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
    document.getElementById('toggleControls').addEventListener('click', () => {
        const panel = document.getElementById('controls');
        panel.classList.toggle('collapsed');
        document.getElementById('toggleControls').textContent = 
            panel.classList.contains('collapsed') ? '▶️' : '◀️';
    });
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
    }
    
    const spacing = width / (n + 1);
    
    // Dibujar resortes PRIMERO
    for(let i = 0; i < n - 1; i++) {
        const x1 = (i + 1) * spacing;
        const y1 = height/2 + positions[i];
        const x2 = (i + 2) * spacing;
        const y2 = height/2 + positions[i + 1];
        drawSpring(x1, y1, x2, y2);
    }
    
    // Dibujar cuentas DESPUÉS
    for(let i = 0; i < n; i++) {
        drawBead((i + 1) * spacing, height/2 + positions[i]);
    }
}

function drawBead(x, y) {
    // Degradado radial para efecto 3D
    let gradient = drawingContext.createRadialGradient(
        x - 5, y - 5, 5,  // Punto de origen del gradiente
        x, y, 20          // Punto final del gradiente
    );
    gradient.addColorStop(0, 'hsla(210, 100%, 70%, 1)');  // Centro brillante
    gradient.addColorStop(0.5, 'hsla(210, 100%, 40%, 1)'); // Medio tono
    gradient.addColorStop(1, 'hsla(210, 100%, 20%, 1)');   // Borde oscuro

    // Sombra proyectada
    drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
    drawingContext.shadowBlur = 10;
    drawingContext.shadowOffsetY = 5;

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

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}