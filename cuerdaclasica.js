const WIDTH = 1000;
const HEIGHT = 500;
const DX = 2;
const DT = 0.02;
const TENSION = 100;
const N_POINTS = Math.floor(WIDTH / DX);
const N_MODES = 15;

let y = [];
let vy = [];
let paused = true;
let density = 1.0;
let c;
let fourierCoefficients = [];

function setup() {
    const canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent('canvas-container');
    
    // Inicializar arrays
    y = new Array(N_POINTS).fill(0);
    vy = new Array(N_POINTS).fill(0);
    c = Math.sqrt(TENSION / density);
    
    // Configurar controles
    setupControls();
    resetSimulation();
}

function draw() {
    background(245);
    drawWave();
    if (!paused) updateWave();
    handleMouseInteraction();
    updateFourierDisplay();
}

function setupControls() {
    document.getElementById('playPause').addEventListener('click', togglePlay);
    document.getElementById('reset').addEventListener('click', resetSimulation);
    document.getElementById('modeSelector').addEventListener('change', handleModeChange);
    document.getElementById('timeScale').addEventListener('input', updateTimeScale);
    document.getElementById('density').addEventListener('input', updateDensity);
    document.getElementById('modeNumber').addEventListener('change', resetSimulation);
}

function updateWave() {
    const nextY = new Array(N_POINTS).fill(0);
    const timeScale = parseFloat(document.getElementById('timeScale').value);
    
    for (let i = 1; i < N_POINTS - 1; i++) {
        const acc = (y[i+1] - 2*y[i] + y[i-1]) * (c*c)/(DX*DX);
        vy[i] += acc * DT * timeScale;
        nextY[i] = y[i] + vy[i] * DT * timeScale;
    }
    
    y = nextY;
    y[0] = y[N_POINTS-1] = 0;
}

function drawWave() {
    strokeWeight(3);
    noFill();
    
    // Efecto de gradiente
    for (let i = 0; i < N_POINTS; i++) {
        const hue = map(y[i], -1, 1, 200, 300) % 360;
        stroke(hue, 80, 60);
        line(i*DX, HEIGHT/2, i*DX, HEIGHT/2 + y[i] * 100);
    }
    
    // Línea base
    stroke(200);
    line(0, HEIGHT/2, WIDTH, HEIGHT/2);
}

function handleMouseInteraction() {
    if (paused && mouseIsPressed && mouseY < HEIGHT) {
        const i = Math.floor(mouseX / DX);
        if (i > 0 && i < N_POINTS - 1) {
            const targetY = (mouseY - HEIGHT/2) / 100;
            applyGaussianDisplacement(i, targetY);
            calculateFourierCoefficients();
        }
    }
}

function applyGaussianDisplacement(center, amplitude) {
    const sigma = 3;
    for (let j = -3*sigma; j <= 3*sigma; j++) {
        const idx = center + j;
        if (idx > 0 && idx < N_POINTS - 1) {
            const weight = Math.exp(-(j*j)/(2*sigma*sigma));
            y[idx] += amplitude * weight;
        }
    }
}

function calculateFourierCoefficients() {
    fourierCoefficients = [];
    for (let n = 1; n <= N_MODES; n++) {
        let sum = 0;
        for (let x = 1; x < N_POINTS - 1; x++) {
            sum += y[x] * Math.sin(n * Math.PI * x / (N_POINTS - 1));
        }
        fourierCoefficients.push(2/(N_POINTS - 1) * sum);
    }
}

function updateFourierDisplay() {
    const container = document.getElementById('fourier-plot');
    container.innerHTML = '';
    
    fourierCoefficients.forEach(coeff => {
        const bar = document.createElement('div');
        bar.className = 'fourier-bar';
        bar.style.height = `${Math.abs(coeff * 150)}px`;
        container.appendChild(bar);
    });
}

// Funciones de control
function togglePlay() {
    paused = !paused;
    document.getElementById('playPause').textContent = paused ? 'Play' : 'Pause';
}

function resetSimulation() {
    y.fill(0);
    vy.fill(0);
    
    if (document.getElementById('modeSelector').value === 'normal') {
        const n = parseInt(document.getElementById('modeNumber').value);
        for (let i = 0; i < N_POINTS; i++) {
            y[i] = Math.sin(n * Math.PI * i / (N_POINTS - 1));
        }
    }
    
    calculateFourierCoefficients();
}

function handleModeChange() {
    document.getElementById('modeNumber').style.display = 
        document.getElementById('modeSelector').value === 'normal' ? 'inline' : 'none';
    resetSimulation();
}

function updateTimeScale(e) {
    document.getElementById('speedValue').textContent = e.target.value;
}

function updateDensity(e) {
    density = parseFloat(e.target.value);
    c = Math.sqrt(TENSION / density);
    document.getElementById('densityValue').textContent = density.toFixed(1);
    resetSimulation();
}

function keyPressed() {
    if (key === ' ') togglePlay();
}