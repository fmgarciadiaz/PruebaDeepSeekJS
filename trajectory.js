class TrajectoryPanel {
    constructor() {
        this.trajectory = [];
        this.selectedBead = 0;
        this.init();
    }

    init() {
        this.container = document.getElementById('trajectoryPanel');
        this.container.innerHTML = `
            <div class="trajectory-controls">
                <label>🔘 Cuenta a graficar: 
                    <select id="beadSelector">
                        ${Array.from({length: 5}, (_, i) => 
                            `<option value="${i}">Cuenta ${i + 1}</option>`
                        ).join('')}
                    </select>
                </label>
                <button id="clearTrajectory">🧹 Limpiar</button>
            </div>
            <canvas id="trajectoryCanvas"></canvas>
        `;
        
        this.canvas = document.getElementById('trajectoryCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        document.getElementById('beadSelector').addEventListener('change', (e) => {
            this.selectedBead = parseInt(e.target.value);
        });
        
        document.getElementById('clearTrajectory').addEventListener('click', () => {
            this.trajectory = [];
            this.draw();
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = 180;
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
        
        // Fondo y cuadrícula
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 0.5;
        for(let y = 0; y <= this.canvas.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        if(this.trajectory.length > 1) {
            // Calcular escalas
            const minY = Math.min(...this.trajectory.flat());
            const maxY = Math.max(...this.trajectory.flat());
            const yRange = maxY - minY || 1;
            
            // Dibujar trayectoria
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            this.trajectory.forEach((positions, i) => {
                const x = (i / this.trajectory.length) * this.canvas.width;
                const y = ((positions[this.selectedBead] - minY) / yRange) * this.canvas.height;
                
                if(i === 0) this.ctx.moveTo(x, this.canvas.height - y);
                else this.ctx.lineTo(x, this.canvas.height - y);
            });
            
            this.ctx.stroke();
        }
    }
}