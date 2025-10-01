// Visualizador de Modelo Atômico 2D para a Tabela Periódica
class AtomVisualizer2D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.currentElement = null;
        this.animationId = null;
        this.isPaused = false;
        this.animationSpeed = 1;
        this.time = 0;
        
        // Configurações das camadas eletrônicas - K=2, L=8, M=18, N=32, O=32, P=18, Q=8
        this.shellCapacities = [2, 8, 18, 32, 32, 18, 8];
        this.shellColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
        this.shellNames = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
        
        // Dados de nêutrons para elementos (simplificado)
        this.neutronData = {};
        
        // Preencher dados de nêutrons a partir de elementsData
        elementsData.forEach(element => {
            // Estimar nêutrons quando não especificado (arredondando a massa atômica menos o número atômico)
            let neutrons = 0;
            if (element.mass && element.mass !== "N/A") {
                const massValue = parseFloat(element.mass);
                if (!isNaN(massValue)) {
                    neutrons = Math.round(massValue) - element.number;
                } else {
                    // Para elementos com massa em formato especial, usar aproximação
                    neutrons = element.number;
                }
            } else {
                // Para elementos sem massa definida, usar aproximação
                neutrons = element.number;
            }
            
            this.neutronData[element.number] = neutrons;
        });
        
        // Inicialização
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const container = this.container;
        // Reduzir o tamanho para garantir que não corte no container
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Definir o tamanho do canvas baseado no contêiner
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;
        
        // Redesenhar o átomo após redimensionar
        if (this.currentElement) {
            this.drawAtom();
        }
    }
    
    setElement(atomicNumber) {
        // Encontrar o elemento pelo número atômico
        this.currentElement = elementsData.find(e => e.number === atomicNumber);
        
        // Parar animação anterior se existir
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Iniciar nova animação
        this.time = 0;
        this.isPaused = false;
        this.animate();
    }
    
    toggleAnimation() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }
    
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
    }
    
    getElectronDistribution(atomicNumber) {
        const distribution = [];
        let remainingElectrons = atomicNumber;
        
        for (let i = 0; i < this.shellCapacities.length && remainingElectrons > 0; i++) {
            const electronsInShell = Math.min(remainingElectrons, this.shellCapacities[i]);
            distribution.push(electronsInShell);
            remainingElectrons -= electronsInShell;
        }
        
        return distribution;
    }
    
    getElectronConfiguration(atomicNumber) {
        // Configurações eletrônicas para elementos comuns
        const configs = {
            1: "1s¹", 2: "1s²", 3: "1s² 2s¹", 4: "1s² 2s²", 5: "1s² 2s² 2p¹",
            6: "1s² 2s² 2p²", 7: "1s² 2s² 2p³", 8: "1s² 2s² 2p⁴", 9: "1s² 2s² 2p⁵",
            10: "1s² 2s² 2p⁶", 11: "1s² 2s² 2p⁶ 3s¹", 12: "1s² 2s² 2p⁶ 3s²",
            13: "1s² 2s² 2p⁶ 3s² 3p¹", 14: "1s² 2s² 2p⁶ 3s² 3p²", 15: "1s² 2s² 2p⁶ 3s² 3p³",
            16: "1s² 2s² 2p⁶ 3s² 3p⁴", 17: "1s² 2s² 2p⁶ 3s² 3p⁵", 18: "1s² 2s² 2p⁶ 3s² 3p⁶",
            19: "1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹", 20: "1s² 2s² 2p⁶ 3s² 3p⁶ 4s²"
        };
        
        // Se o elemento tiver configuração definida, usar ela
        if (this.currentElement && this.currentElement.config) {
            return this.currentElement.config;
        }
        
        // Caso contrário, usar a configuração padrão ou simplificada
        return configs[atomicNumber] || "Configuração complexa";
    }
    
    drawAtom() {
        if (!this.currentElement) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Ajustar o tamanho do canvas para manter a proporção
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const minDimension = Math.min(canvasWidth, canvasHeight);
        
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        const atomicNumber = this.currentElement.number;
        
        // Calcular o número de camadas para ajustar o tamanho do modelo
        const distribution = this.getElectronDistribution(atomicNumber);
        const numShells = distribution.length;
        
        // Ajustar o tamanho base do raio de acordo com o número de camadas
        // Quanto mais camadas, menor o raio base para evitar que as camadas externas sejam cortadas
        let baseRadius;
        if (numShells <= 2) {
            baseRadius = minDimension * 0.08;
        } else if (numShells <= 4) {
            baseRadius = minDimension * 0.07;
        } else if (numShells <= 6) {
            baseRadius = minDimension * 0.06;
        } else {
            baseRadius = minDimension * 0.05;
        }
        
        const neutrons = this.neutronData[atomicNumber] || atomicNumber;
        
        // Desenhar núcleo
        this.drawNucleus(centerX, centerY, atomicNumber, neutrons);
        
        // Desenhar camadas eletrônicas
        distribution.forEach((electronCount, shellIndex) => {
            if (electronCount > 0) {
                // Ajustar o espaçamento entre camadas com base no número total de camadas
                let shellSpacing;
                if (numShells <= 2) {
                    shellSpacing = minDimension * 0.09;
                } else if (numShells <= 4) {
                    shellSpacing = minDimension * 0.08;
                } else if (numShells <= 6) {
                    shellSpacing = minDimension * 0.07;
                } else {
                    shellSpacing = minDimension * 0.06;
                }
                
                const radius = baseRadius + (shellIndex + 1) * shellSpacing;
                this.drawElectronShell(centerX, centerY, radius, electronCount, shellIndex);
            }
        });
        
        // Desenhar rótulos das camadas
        distribution.forEach((electronCount, shellIndex) => {
            if (electronCount > 0) {
                // Usar o mesmo espaçamento que foi usado para desenhar as camadas
                let shellSpacing;
                if (numShells <= 2) {
                    shellSpacing = minDimension * 0.09;
                } else if (numShells <= 4) {
                    shellSpacing = minDimension * 0.08;
                } else if (numShells <= 6) {
                    shellSpacing = minDimension * 0.07;
                } else {
                    shellSpacing = minDimension * 0.06;
                }
                
                const radius = baseRadius + (shellIndex + 1) * shellSpacing;
                this.drawShellLabel(centerX, centerY, radius, shellIndex);
            }
        });
    }
    
    drawNucleus(x, y, protons, neutrons) {
        // Tamanho do núcleo proporcional ao canvas
        const canvasMinDimension = Math.min(this.canvas.width, this.canvas.height);
        const nucleusRadius = Math.max(canvasMinDimension * 0.03, Math.sqrt(protons + neutrons) * (canvasMinDimension * 0.006));
        
        // Fundo do núcleo com gradiente
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, nucleusRadius);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(1, '#FFA500');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, nucleusRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Borda do núcleo
        this.ctx.strokeStyle = '#FF8C00';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Texto do núcleo - tamanho da fonte proporcional
        const fontSize = Math.max(10, canvasMinDimension * 0.025);
        this.ctx.fillStyle = '#8B0000';
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${protons}p`, x, y - fontSize * 0.25);
        if (neutrons > 0) {
            this.ctx.fillText(`${neutrons}n`, x, y + fontSize * 0.8);
        }
    }
    
    drawElectronShell(centerX, centerY, radius, electronCount, shellIndex) {
        // Desenhar órbita
        this.ctx.strokeStyle = this.shellColors[shellIndex];
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Desenhar elétrons
        for (let i = 0; i < electronCount; i++) {
            // Velocidade inversamente proporcional à camada (camadas mais internas giram mais rápido)
            const speedFactor = this.animationSpeed * 0.01 * (this.shellCapacities.length - shellIndex) / this.shellCapacities.length * 1.5;
            const angle = (2 * Math.PI * i / electronCount) + (this.time * speedFactor);
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            this.drawElectron(x, y, shellIndex);
        }
    }
    
    drawElectron(x, y, shellIndex) {
        // Tamanho do elétron proporcional ao canvas
        const canvasMinDimension = Math.min(this.canvas.width, this.canvas.height);
        const electronRadius = canvasMinDimension * 0.012;
        
        // Corpo do elétron com gradiente
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, electronRadius);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#4682B4');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, electronRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Borda do elétron
        this.ctx.strokeStyle = '#191970';
        this.ctx.lineWidth = Math.max(1, canvasMinDimension * 0.004);
        this.ctx.stroke();
        
        // Símbolo do elétron - tamanho da fonte proporcional
        const fontSize = Math.max(8, canvasMinDimension * 0.02);
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('e⁻', x, y + fontSize * 0.3);
    }
    
    drawShellLabel(centerX, centerY, radius, shellIndex) {
        const angle = Math.PI / 4; // 45 graus
        const canvasMinDimension = Math.min(this.canvas.width, this.canvas.height);
        const padding = canvasMinDimension * 0.03; // Espaçamento proporcional reduzido
        
        const x = centerX + (radius + padding) * Math.cos(angle);
        const y = centerY + (radius + padding) * Math.sin(angle);
        
        // Obter a contagem de elétrons para esta camada
        const distribution = this.getElectronDistribution(this.currentElement.number);
        const electronCount = distribution[shellIndex];
        
        // Tamanho da fonte proporcional ao canvas
        const fontSize = Math.max(10, canvasMinDimension * 0.025);
        
        this.ctx.fillStyle = this.shellColors[shellIndex];
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.shellNames[shellIndex]}: ${electronCount}e⁻`, x, y);
    }
    
    animate() {
        if (!this.isPaused) {
            this.time += 0.5;
            this.drawAtom();
        }
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Limpar o canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Remover o canvas do container
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}
