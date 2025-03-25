let positions = [];
let velocities = [];
let n = 5;
let k = 1;
let isPaused = true;
let selectedBead = -1;
let boundary = { left: 'Fija', right: 'Fija' };

function setup() {
    createCanvas(windowWidth, windowHeight);
    createControls();
    resetSystem();
}

function resetSystem() {
    n = document.getElementById('nSlider').valueAsNumber;
    positions = new Array(n).fill(0);
    velocities = new Array(n).fill(0);
    isPaused = true;
    updateButtonText();
}

function createControls() {
    const panel = document.getElementById('controls');
    
    // Control deslizante para número de cuentas
    panel.innerHTML = `
        <label>Cuentas: <input type="range" id="nSlider" min="1" max="30" value="5"></label>
        <button id="resetBtn">Reset</button>
        <button id="pauseBtn">Play</button>
        <label>Rigidez: <input type="range" id="kSlider" min="0.1" max="5" step="0.1" value="1"></label>
        <label>Borde Izq:
            <select id="leftBound">
                <option>Fija</option>
                <option>Libre</option>
                <option>Periódica</option>
            </select>
        </label>
        <label>Borde Der:
            <select id="rightBound">
                <option>Fija</option>
                <option>Libre</option>
                <option>Periódica</option>
            </select>
        </label>
    `;

    // Event listeners
    document.getElementById('nSlider').addEventListener('input', resetSystem);
    document.getElementById('resetBtn').addEventListener('click', resetSystem);
    document.getElementById('pauseBtn').addEventListener('click', () => {
        isPaused = !isPaused;
        updateButtonText();
    });
    document.getElementById('leftBound').addEventListener('change', (e) => boundary.left = e.target.value);
    document.getElementById('rightBound').addEventListener('change', (e) => boundary.right = e.target.value);
}

function updateButtonText() {
    document.getElementById('pauseBtn').textContent = isPaused ? 'Play' : 'Pause';
}

function applyBoundaryConditions() {
    const last = positions.length - 1;
    
    // Condiciones izquierda
    switch(boundary.left) {
        case 'Fija': positions[0] = 0; break;
        case 'Libre': positions[0] = positions[1]; break;
        case 'Periódica': positions[0] = positions[last]; break;
    }
    
    // Condiciones derecha
    switch(boundary.right) {
        case 'Fija': positions[last] = 0; break;
        case 'Libre': positions[last] = positions[last - 1]; break;
        case 'Periódica': positions[last] = positions[0]; break;
    }
}

function calculateForces() {
    k = document.getElementById('kSlider').valueAsNumber;
    const accelerations = new Array(n).fill(0);
    
    for(let i = 0; i < n; i++) {
        const left = i > 0 ? positions[i-1] : positions[i];
        const right = i < n-1 ? positions[i+1] : positions[i];
        accelerations[i] = k * (left + right - 2 * positions[i]);
    }
    return accelerations;
}

function mousePressed() {
    if(!isPaused) return;
    
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
    background(245);
    
    if(!isPaused) {
        const dt = 0.016;
        const accelerations = calculateForces();
        
        for(let i = 0; i < n; i++) {
            velocities[i] += accelerations[i] * dt;
            positions[i] += velocities[i] * dt;
        }
        applyBoundaryConditions();
    }
    
    // Dibujar resortes
    const spacing = width / (n + 1);
    for(let i = 0; i < n; i++) {
        const x = (i + 1) * spacing;
        const y = height/2 + positions[i];
        
        // Dibujar cuenta
        fill(30, 100, 100);
        noStroke();
        ellipse(x, y, 30, 30);
        
        // Dibujar resorte
        if(i > 0) {
            const px = (i) * spacing;
            const py = height/2 + positions[i-1];
            drawSpring(px, py, x, y);
        }
    }
}

function drawSpring(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = dist(x1, y1, x2, y2);
    const angle = atan2(dy, dx);
    
    push();
    translate(x1, y1);
    rotate(angle);
    
    stroke(150);
    noFill();
    beginShape();
    for(let i = 0; i <= 12; i++) {
        const t = i / 12;
        const x = t * length;
        const y = sin(t * TWO_PI * 3) * 8;
        vertex(x, y);
    }
    endShape();
    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}