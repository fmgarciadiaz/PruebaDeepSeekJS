class TrajectoryPanel {
    constructor() {
        this.trajectory = [];
        this.selectedBeads = [];
        this.colors = ['#FF6F61', '#4DBD74', '#4169E1'];
        this.init();
    }

    init() {
        this.panel = document.createElement('div');
        this.panel.id = 'trajectoryPanel';
        this.panel.innerHTML = `
        <div class="trajectory-container">
            <div class="trajectory-controls">
                <div class="bead-selection">
                    <label>🔘 Cuentas:</label>
                    <select id="beadSelector" multiple size="4">
                        ${Array.from({length: 5}, (_, i) => 
                            `<option value="${i}">${i + 1}</option>`
                        ).join('')}
                    </select>
                    <button id="clearTrajectory">🧹</button>
                </div>
            </div>
            <canvas id="trajectoryCanvas"></canvas>
        </div>
        `;
        document.body.appendChild(this.panel);
        
        this.canvas = document.getElementById('trajectoryCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupEvents();
        this.resize();
    }

    setupEvents() {
        const selector = document.getElementById('beadSelector');
        
        selector.addEventListener('change', (e) => {
            const options = Array.from(e.target.selectedOptions);
            this.selectedBeads = options.slice(0, 3).map(opt => parseInt(opt.value));
        });
        
        document.getElementById('clearTrajectory').addEventListener('click', () => {
            this.trajectory = [];
            this.draw();
        });
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // En el método resize():
        this.canvas.width = window.innerWidth * 0.8; // 80% del ancho
        this.canvas.height = 200; // Altura aumentada
    }

    updateBeads(n) {
        const selector = document.getElementById('beadSelector');
        selector.innerHTML = Array.from({length: n}, (_, i) => 
            `<option value="${i}">Cuenta ${i + 1}</option>`
        ).join('');
    }

    addData(positions) {
        this.trajectory.push([...positions]);
        if(this.trajectory.length > 500) this.trajectory.shift();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fondo y cuadrícula con margen para la escala
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(40, 0, this.canvas.width - 40, this.canvas.height);
    
        // Dibujar escala del eje Y
        if(this.trajectory.length > 0) {
            const maxY = Math.max(...this.trajectory.flat());
            const minY = Math.min(...this.trajectory.flat());
            const yRange = maxY - minY || 1;
    
            // Configuración de texto para los valores
            this.ctx.fillStyle = '#666';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'middle';
    
            // Dibujar 5 marcas equidistantes
            for(let i = 0; i <= 4; i++) {
                const yValue = minY + (i * yRange / 4);
                const yPosition = this.canvas.height - ((yValue - minY) / yRange) * this.canvas.height;
                this.ctx.fillText(yValue.toFixed(1), 35, yPosition);
            }
        }
    
        // Cuadrícula vertical
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 0.5;
        for(let x = 40; x <= this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    
        // Líneas horizontales de referencia
        this.ctx.strokeStyle = '#ddd';
        for(let y = 0; y <= this.canvas.height; y += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(40, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    
        // Dibujar trayectorias
        if(this.trajectory.length > 1) {
            const maxY = Math.max(...this.trajectory.flat());
            const minY = Math.min(...this.trajectory.flat());
            const yRange = maxY - minY || 1;
    
            this.selectedBeads.slice(0, 3).forEach((beadIndex, colorIndex) => {
                this.ctx.strokeStyle = this.colors[colorIndex];
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                
                this.trajectory.forEach((positions, i) => {
                    const x = 40 + ((i / this.trajectory.length) * (this.canvas.width - 40));
                    const y = ((positions[beadIndex] - minY) / yRange) * this.canvas.height;
                    
                    if(i === 0) this.ctx.moveTo(x, this.canvas.height - y);
                    else this.ctx.lineTo(x, this.canvas.height - y);
                });
                
                this.ctx.stroke();
            });
        }
    }
}
