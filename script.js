document.addEventListener('DOMContentLoaded', function() {
    const periodicTable = document.getElementById('periodicTable');
    const modal = document.getElementById('elementModal');
    const closeBtn = document.querySelector('.close');
    
    createPeriodicTable();
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    function createPeriodicTable() {
        const grid = Array(9).fill().map(() => Array(18).fill(null));
        
        elementsData.forEach(element => {
            grid[element.row - 1][element.col - 1] = element;
        });
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 18; col++) {
                const element = grid[row][col];
                const elementDiv = document.createElement('div');
                
                if (element) {
                    elementDiv.className = `element ${element.category}`;
                    elementDiv.innerHTML = `
                        <div class="number">${element.number}</div>
                        <div class="symbol">${element.symbol}</div>
                        <div class="name">${element.name}</div>
                        <div class="mass">${element.mass}</div>
                    `;
                    
                    elementDiv.addEventListener('click', () => showElementDetails(element));
                    
                    elementDiv.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        elementDiv.style.transform = 'scale(0.95)';
                    });
                    
                    elementDiv.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        elementDiv.style.transform = '';
                        showElementDetails(element);
                    });
                } else {
                    elementDiv.className = 'element empty-space';
                    
                    if (row === 5 && col === 2) {
                        elementDiv.innerHTML = '<div class="symbol">57-71</div><div class="name">Lantanídeos</div>';
                        elementDiv.className = 'element lanthanide-indicator';
                        elementDiv.style.fontSize = '0.6rem';
                        elementDiv.style.cursor = 'default';
                    } else if (row === 6 && col === 2) {
                        elementDiv.innerHTML = '<div class="symbol">89-103</div><div class="name">Actinídeos</div>';
                        elementDiv.className = 'element actinide-indicator';
                        elementDiv.style.fontSize = '0.6rem';
                        elementDiv.style.cursor = 'default';
                    }
                }
                
                periodicTable.appendChild(elementDiv);
            }
        }
    }
    
    function showElementDetails(element) {
        document.getElementById('modalSymbol').textContent = element.symbol;
        document.getElementById('modalSymbol').className = `element-symbol ${element.category}`;
        document.getElementById('modalName').textContent = element.name;
        document.getElementById('modalNumber').textContent = `Número Atômico: ${element.number}`;
        document.getElementById('modalMass').textContent = element.mass;
        document.getElementById('modalCategory').textContent = categoryNames[element.category];
        document.getElementById('modalConfig').textContent = element.config;
        document.getElementById('modalState').textContent = element.state;
        document.getElementById('modalDensity').textContent = element.density;
        document.getElementById('modalMelting').textContent = element.melting;
        document.getElementById('modalBoiling').textContent = element.boiling;
        
        modal.style.display = 'block';
        
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    function searchElement(query) {
        const elements = document.querySelectorAll('.element:not(.empty-space)');
        const searchTerm = query.toLowerCase();
        
        elements.forEach(element => {
            const symbol = element.querySelector('.symbol').textContent.toLowerCase();
            const name = element.querySelector('.name').textContent.toLowerCase();
            const number = element.querySelector('.number').textContent;
            
            if (symbol.includes(searchTerm) || 
                name.includes(searchTerm) || 
                number.includes(searchTerm)) {
                element.style.opacity = '1';
                element.style.transform = 'scale(1.1)';
                element.style.boxShadow = '0 4px 15px rgba(255,255,255,0.5)';
            } else {
                element.style.opacity = '0.3';
                element.style.transform = 'scale(1)';
                element.style.boxShadow = 'none';
            }
        });
        
        if (!query) {
            elements.forEach(element => {
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
                element.style.boxShadow = 'none';
            });
        }
    }
    
    function filterByCategory(category) {
        const elements = document.querySelectorAll('.element:not(.empty-space)');
        
        if (category === 'all') {
            elements.forEach(element => {
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
            });
        } else {
            elements.forEach(element => {
                if (element.classList.contains(category)) {
                    element.style.opacity = '1';
                    element.style.transform = 'scale(1.05)';
                    element.style.boxShadow = '0 4px 15px rgba(255,255,255,0.4)';
                } else {
                    element.style.opacity = '0.2';
                    element.style.transform = 'scale(1)';
                    element.style.boxShadow = 'none';
                }
            });
        }
    }
    
    document.querySelectorAll('.legend-item').forEach(item => {
        item.addEventListener('click', function() {
            const colorDiv = this.querySelector('.legend-color');
            const category = Array.from(colorDiv.classList).find(cls => cls !== 'legend-color');
            
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                filterByCategory('all');
            } else {
                document.querySelectorAll('.legend-item').forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
                filterByCategory(category);
            }
        });
    });
    
    function addTouchFeedback() {
        const elements = document.querySelectorAll('.element:not(.empty-space)');
        
        elements.forEach(element => {
            element.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.style.transition = 'transform 0.1s ease';
                this.style.transform = 'scale(0.95)';
            });
            
            element.addEventListener('touchend', function(e) {
                e.preventDefault();
                this.style.transition = 'transform 0.3s ease';
                this.style.transform = '';
            });
        });
    }
    
    addTouchFeedback();
    
    function handleOrientationChange() {
        setTimeout(() => {
            const viewport = document.querySelector('meta[name="viewport"]');
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no');
        }, 100);
    }
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });
    
    document.addEventListener('gesturechange', function(e) {
        e.preventDefault();
    });
    
    document.addEventListener('gestureend', function(e) {
        e.preventDefault();
    });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    function showLoadingIndicator() {
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-size: 1.2rem;
        `;
        loader.innerHTML = '<div>Carregando Tabela Periódica...</div>';
        document.body.appendChild(loader);
        
        setTimeout(() => {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 1000);
    }
    
    function animateElementsEntry() {
        const elements = document.querySelectorAll('.element:not(.empty-space)');
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
            }, index * 10);
        });
    }
    
    setTimeout(animateElementsEntry, 500);
});

function highlightByProperty(property, value) {
    const elements = document.querySelectorAll('.element:not(.empty-space)');
    
    elements.forEach(elementDiv => {
        const symbol = elementDiv.querySelector('.symbol').textContent;
        const elementData = elementsData.find(el => el.symbol === symbol);
        
        if (elementData && elementData[property] === value) {
            elementDiv.style.boxShadow = '0 0 15px #ffff00';
            elementDiv.style.transform = 'scale(1.1)';
        } else {
            elementDiv.style.boxShadow = 'none';
            elementDiv.style.transform = 'scale(1)';
        }
    });
}

function resetHighlights() {
    const elements = document.querySelectorAll('.element:not(.empty-space)');
    elements.forEach(element => {
        element.style.boxShadow = 'none';
        element.style.transform = 'scale(1)';
        element.style.opacity = '1';
    });
}

window.periodicTableFunctions = {
    searchElement: function(query) {
    },
    filterByCategory: function(category) {
    },
    highlightByProperty,
    resetHighlights
};
