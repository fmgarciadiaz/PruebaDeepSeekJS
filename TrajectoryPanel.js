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
            <div class="trajectory-controls">
                <label>🔘 Cuentas a graficar (máx 3): 
                    <select id="beadSelector" multiple>
                        ${Array.from({length: 5}, (_, i) => 
                            `<option value="${i}">Cuenta ${i + 1}</option>`
                        ).join('')}
                    </select>
                </label>
                <button id="clearTrajectory">🧹 Limpiar</button>
            </div>
            <canvas id="trajectoryCanvas"></canvas>
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
        this.canvas.width = window.innerWidth;
        this.canvas.height = 150;
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
        for(let y = 0; y <= this.canvas.height; y += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        if(this.trajectory.length > 1) {
            const maxY = Math.max(...this.trajectory.flat());
            const minY = Math.min(...this.trajectory.flat());
            const yRange = maxY - minY || 1;

            this.selectedBeads.slice(0, 3).forEach((beadIndex, colorIndex) => {
                this.ctx.strokeStyle = this.colors[colorIndex];
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                
                this.trajectory.forEach((positions, i) => {
                    const x = (i / this.trajectory.length) * this.canvas.width;
                    const y = ((positions[beadIndex] - minY) / yRange) * this.canvas.height;
                    
                    if(i === 0) this.ctx.moveTo(x, this.canvas.height - y);
                    else this.ctx.lineTo(x, this.canvas.height - y);
                });
                
                this.ctx.stroke();
            });
        }
    }
}
