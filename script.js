// Game Variables
        let currentScreen = 'welcome';
        let canvas, ctx, demoCanvas, demoCtx;
        let gameState = {
            score: 0,
            lives: 3,
            level: 1,
            gameRunning: false,
            cat: { x: 13, y: 23, direction: 0 }, // 0=right, 1=down, 2=left, 3=up
            ghosts: [],
            dots: [],
            powerPellets: [],
            vulnerableTime: 0,
            dotsCollected: 0,
            totalDots: 0
        };

        // Maze layout (1=wall, 0=dot, 2=power pellet, 3=empty)
        const mazeTemplate = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,2,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,2,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,1,1,1,1,1,3,1,3,1,1,1,1,1,0,1,1,1,1,1,1],
            [3,3,3,3,3,1,0,1,3,3,3,3,3,3,3,3,3,3,3,1,0,1,3,3,3,3,3],
            [1,1,1,1,1,1,0,1,3,1,1,3,3,3,3,3,1,1,3,1,0,1,1,1,1,1,1],
            [0,0,0,0,0,0,0,0,3,1,3,3,3,3,3,3,3,1,3,0,0,0,0,0,0,0,0],
            [1,1,1,1,1,1,0,1,3,1,3,3,3,3,3,3,3,1,3,1,0,1,1,1,1,1,1],
            [3,3,3,3,3,1,0,1,3,1,1,1,1,1,1,1,1,1,3,1,0,1,3,3,3,3,3],
            [1,1,1,1,1,1,0,1,3,3,3,3,3,3,3,3,3,3,3,1,0,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
            [1,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,1],
            [1,1,1,0,0,1,0,1,1,0,1,1,1,1,1,1,1,0,1,1,0,1,0,0,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        // Initialize game
        function initGame() {
            canvas = document.getElementById('gameCanvas');
            ctx = canvas.getContext('2d');
            demoCanvas = document.getElementById('demoCanvas');
            demoCtx = demoCanvas.getContext('2d');
            
            setupEventListeners();
            startDemo();
        }

        function setupEventListeners() {
            document.addEventListener('keydown', handleKeyPress);
            document.addEventListener('click', hideThemeDropdown);
        }

        function handleKeyPress(e) {
            if (!gameState.gameRunning) return;
            
            const key = e.key.toLowerCase();
            let newDirection = gameState.cat.direction;
            
            switch(key) {
                case 'arrowup':
                case 'w':
                    newDirection = 3;
                    break;
                case 'arrowdown':
                case 's':
                    newDirection = 1;
                    break;
                case 'arrowleft':
                case 'a':
                    newDirection = 2;
                    break;
                case 'arrowright':
                case 'd':
                    newDirection = 0;
                    break;
            }
            
            // Check if new direction is valid
            if (isValidMove(gameState.cat.x, gameState.cat.y, newDirection)) {
                gameState.cat.direction = newDirection;
            }
        }

        function resetGameState() {
            gameState.score = 0;
            gameState.lives = 3;
            gameState.level = 1;
            gameState.vulnerableTime = 0;
            setupLevel();
        }

        function setupLevel() {
            // Reset cat position
            gameState.cat = { x: 13, y: 15, direction: 0 };
            
            // Setup ghosts
            gameState.ghosts = [
                { x: 13, y: 9, direction: 0, color: '#ff0000', vulnerable: false },
                { x: 12, y: 9, direction: 1, color: '#ffb8ff', vulnerable: false },
                { x: 14, y: 9, direction: 2, color: '#00ffff', vulnerable: false },
                { x: 13, y: 10, direction: 3, color: '#ffb852', vulnerable: false }
            ];
            
            // Setup dots and power pellets
            gameState.dots = [];
            gameState.powerPellets = [];
            gameState.dotsCollected = 0;
            gameState.totalDots = 0;
            
            for (let y = 0; y < mazeTemplate.length; y++) {
                for (let x = 0; x < mazeTemplate[y].length; x++) {
                    if (mazeTemplate[y][x] === 0) {
                        gameState.dots.push({x, y});
                        gameState.totalDots++;
                    } else if (mazeTemplate[y][x] === 2) {
                        gameState.powerPellets.push({x, y});
                        gameState.totalDots++;
                    }
                }
            }
        }

        function startGame() {
            currentScreen = 'game';
            document.getElementById('welcomeScreen').classList.add('hidden');
            document.getElementById('instructionsScreen').classList.add('hidden');
            document.getElementById('gameScreen').classList.remove('hidden');
            
            resetGameState();
            gameState.gameRunning = true;
            gameLoop();
        }

        function showWelcome() {
            currentScreen = 'welcome';
            gameState.gameRunning = false;
            document.getElementById('welcomeScreen').classList.remove('hidden');
            document.getElementById('instructionsScreen').classList.add('hidden');
            document.getElementById('gameScreen').classList.add('hidden');
            document.getElementById('gameOverPopup').classList.add('hidden');
        }

        function showInstructions() {
            currentScreen = 'instructions';
            document.getElementById('welcomeScreen').classList.add('hidden');
            document.getElementById('instructionsScreen').classList.remove('hidden');
            document.getElementById('gameScreen').classList.add('hidden');
            startDemo();
        }

        function restartGame() {
            document.getElementById('gameOverPopup').classList.add('hidden');
            startGame();
        }

        function gameLoop() {
            if (!gameState.gameRunning) return;
            
            update();
            render();
            setTimeout(gameLoop, 150 - (gameState.level * 5)); // Increase speed with level
        }

        function update() {
            // Move cat
            moveCat();
            
            // Move ghosts
            moveGhosts();
            
            // Check collisions
            checkCollisions();
            
            // Update vulnerable time
            if (gameState.vulnerableTime > 0) {
                gameState.vulnerableTime--;
                if (gameState.vulnerableTime === 0) {
                    gameState.ghosts.forEach(ghost => {
                        ghost.vulnerable = false;
                    });
                }
            }
            
            // Check if level is complete
            if (gameState.dotsCollected >= gameState.totalDots) {
                nextLevel();
            }
            
            updateUI();
        }

        function moveCat() {
            const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
            const [dx, dy] = directions[gameState.cat.direction];
            
            const newX = gameState.cat.x + dx;
            const newY = gameState.cat.y + dy;
            
            if (isValidMove(gameState.cat.x, gameState.cat.y, gameState.cat.direction)) {
                gameState.cat.x = newX;
                gameState.cat.y = newY;
                
                // Wrap around edges
                if (gameState.cat.x < 0) gameState.cat.x = 26;
                if (gameState.cat.x > 26) gameState.cat.x = 0;
            }
        }

        function moveGhosts() {
            gameState.ghosts.forEach(ghost => {
                const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
                let validDirections = [];
                
                // Find valid directions
                for (let i = 0; i < 4; i++) {
                    if (isValidMove(ghost.x, ghost.y, i) && i !== (ghost.direction + 2) % 4) {
                        validDirections.push(i);
                    }
                }
                
                // Choose direction (simple AI - random with slight preference towards cat)
                if (validDirections.length > 0) {
                    if (Math.random() < 0.7 && !ghost.vulnerable) {
                        // Move towards cat
                        const catDir = getDirectionToCat(ghost);
                        if (validDirections.includes(catDir)) {
                            ghost.direction = catDir;
                        } else {
                            ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
                        }
                    } else {
                        ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
                    }
                }
                
                const [dx, dy] = directions[ghost.direction];
                const newX = ghost.x + dx;
                const newY = ghost.y + dy;
                
                if (isValidMove(ghost.x, ghost.y, ghost.direction)) {
                    ghost.x = newX;
                    ghost.y = newY;
                    
                    // Wrap around edges
                    if (ghost.x < 0) ghost.x = 26;
                    if (ghost.x > 26) ghost.x = 0;
                }
            });
        }

        function getDirectionToCat(ghost) {
            const dx = gameState.cat.x - ghost.x;
            const dy = gameState.cat.y - ghost.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                return dx > 0 ? 0 : 2; // right or left
            } else {
                return dy > 0 ? 1 : 3; // down or up
            }
        }

        function isValidMove(x, y, direction) {
            const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
            const [dx, dy] = directions[direction];
            let newX = x + dx;
            let newY = y + dy;
            
            // Handle wrapping
            if (newX < 0) newX = 26;
            if (newX > 26) newX = 0;
            
            if (newY < 0 || newY >= mazeTemplate.length) return false;
            if (newX < 0 || newX >= mazeTemplate[0].length) return true; // Allow wrapping
            
            return mazeTemplate[newY][newX] !== 1;
        }

        function checkCollisions() {
            // Check dot collection
            gameState.dots = gameState.dots.filter(dot => {
                if (dot.x === gameState.cat.x && dot.y === gameState.cat.y) {
                    gameState.score += 10;
                    gameState.dotsCollected++;
                    return false;
                }
                return true;
            });
            
            // Check power pellet collection
            gameState.powerPellets = gameState.powerPellets.filter(pellet => {
                if (pellet.x === gameState.cat.x && pellet.y === gameState.cat.y) {
                    gameState.score += 50;
                    gameState.dotsCollected++;
                    gameState.vulnerableTime = 100;
                    gameState.ghosts.forEach(ghost => {
                        ghost.vulnerable = true;
                    });
                    return false;
                }
                return true;
            });
            
            // Check ghost collision
            gameState.ghosts.forEach((ghost, index) => {
                if (ghost.x === gameState.cat.x && ghost.y === gameState.cat.y) {
                    if (ghost.vulnerable) {
                        gameState.score += 200;
                        // Reset ghost to center
                        ghost.x = 13;
                        ghost.y = 9;
                        ghost.vulnerable = false;
                    } else {
                        // Cat dies
                        gameState.lives--;
                        if (gameState.lives <= 0) {
                            gameOver();
                        } else {
                            // Reset positions
                            gameState.cat.x = 13;
                            gameState.cat.y = 15;
                            gameState.ghosts.forEach((g, i) => {
                                g.x = 13 + (i % 2 === 0 ? 0 : i === 1 ? -1 : 1);
                                g.y = 9 + (i > 1 ? 1 : 0);
                                g.vulnerable = false;
                            });
                            gameState.vulnerableTime = 0;
                        }
                    }
                }
            });
        }

        function nextLevel() {
            gameState.level++;
            setupLevel();
        }

        function gameOver() {
            gameState.gameRunning = false;
            document.getElementById('finalScore').textContent = gameState.score;
            document.getElementById('gameOverPopup').classList.remove('hidden');
        }

        function updateUI() {
            document.getElementById('score').textContent = gameState.score;
            document.getElementById('lives').textContent = gameState.lives;
            document.getElementById('currentLevel').textContent = gameState.level;
            document.getElementById('levelIndicator').textContent = `Level: ${gameState.level}`;
        }

        function render() {
            const cellSize = 20;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw maze
            for (let y = 0; y < mazeTemplate.length; y++) {
                for (let x = 0; x < mazeTemplate[y].length; x++) {
                    const cellX = x * cellSize;
                    const cellY = y * cellSize;
                    
                    if (mazeTemplate[y][x] === 1) {
                        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--wall-color');
                        ctx.fillRect(cellX + 1, cellY + 1, cellSize - 2, cellSize - 2);
                    }
                }
            }
            
            // Draw dots
            ctx.fillStyle = '#ffff00';
            gameState.dots.forEach(dot => {
                const x = dot.x * cellSize + cellSize/2;
                const y = dot.y * cellSize + cellSize/2;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw power pellets
            ctx.fillStyle = '#ffff00';
            gameState.powerPellets.forEach(pellet => {
                const x = pellet.x * cellSize + cellSize/2;
                const y = pellet.y * cellSize + cellSize/2;
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw cat
            const catX = gameState.cat.x * cellSize + cellSize/2;
            const catY = gameState.cat.y * cellSize + cellSize/2;
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
            ctx.beginPath();
            ctx.arc(catX, catY, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw cat face
            ctx.fillStyle = '#000';
            // Eyes
            ctx.beginPath();
            ctx.arc(catX - 3, catY - 2, 1, 0, Math.PI * 2);
            ctx.arc(catX + 3, catY - 2, 1, 0, Math.PI * 2);
            ctx.fill();
            
            // Ears
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(catX - 4, catY - 6);
            ctx.lineTo(catX - 2, catY - 8);
            ctx.lineTo(catX, catY - 6);
            ctx.moveTo(catX, catY - 6);
            ctx.lineTo(catX + 2, catY - 8);
            ctx.lineTo(catX + 4, catY - 6);
            ctx.stroke();
            
            // Draw ghosts
            gameState.ghosts.forEach(ghost => {
                const ghostX = ghost.x * cellSize + cellSize/2;
                const ghostY = ghost.y * cellSize + cellSize/2;
                
                if (ghost.vulnerable) {
                    ctx.fillStyle = gameState.vulnerableTime > 20 ? '#0000ff' : '#ffffff';
                } else {
                    ctx.fillStyle = ghost.color;
                }
                
                // Ghost body
                ctx.beginPath();
                ctx.arc(ghostX, ghostY - 2, 8, 0, Math.PI);
                ctx.rect(ghostX - 8, ghostY - 2, 16, 12);
                ctx.fill();
                
                // Ghost bottom wavy part
                ctx.beginPath();
                ctx.moveTo(ghostX - 8, ghostY + 10);
                ctx.lineTo(ghostX - 4, ghostY + 6);
                ctx.lineTo(ghostX, ghostY + 10);
                ctx.lineTo(ghostX + 4, ghostY + 6);
                ctx.lineTo(ghostX + 8, ghostY + 10);
                ctx.lineTo(ghostX + 8, ghostY - 2);
                ctx.lineTo(ghostX - 8, ghostY - 2);
                ctx.closePath();
                ctx.fill();
                
                // Ghost eyes
                ctx.fillStyle = ghost.vulnerable ? '#ff0000' : '#ffffff';
                ctx.beginPath();
                ctx.arc(ghostX - 3, ghostY - 2, 2, 0, Math.PI * 2);
                ctx.arc(ghostX + 3, ghostY - 2, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Demo animation
        let demoTime = 0;
        function startDemo() {
            if (currentScreen !== 'instructions') return;
            
            demoTime = 0;
            animateDemo();
        }

        function animateDemo() {
            if (currentScreen !== 'instructions') return;
            
            const cellSize = 15;
            demoCtx.fillStyle = '#000';
            demoCtx.fillRect(0, 0, demoCanvas.width, demoCanvas.height);
            
            // Simple demo maze
            const demoMaze = [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
                [1,2,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,2,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
                [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
                [1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1],
                [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
                [1,1,1,1,0,1,0,1,1,0,0,1,1,0,1,0,1,1,1,1],
                [1,0,0,0,0,1,0,1,0,0,0,0,1,0,1,0,0,0,0,1],
                [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
                [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
                [1,2,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,2,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            ];
            
            // Draw demo maze
            for (let y = 0; y < demoMaze.length; y++) {
                for (let x = 0; x < demoMaze[y].length; x++) {
                    const cellX = x * cellSize + 50;
                    const cellY = y * cellSize + 30;
                    
                    if (demoMaze[y][x] === 1) {
                        demoCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--wall-color');
                        demoCtx.fillRect(cellX, cellY, cellSize - 2, cellSize - 2);
                    } else if (demoMaze[y][x] === 0) {
                        demoCtx.fillStyle = '#ffff00';
                        demoCtx.beginPath();
                        demoCtx.arc(cellX + cellSize/2, cellY + cellSize/2, 1, 0, Math.PI * 2);
                        demoCtx.fill();
                    } else if (demoMaze[y][x] === 2) {
                        demoCtx.fillStyle = '#ffff00';
                        demoCtx.beginPath();
                        demoCtx.arc(cellX + cellSize/2, cellY + cellSize/2, 3, 0, Math.PI * 2);
                        demoCtx.fill();
                    }
                }
            }
            
            // Animated cat
            const catPath = [
                {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 4, y: 1}, {x: 5, y: 1},
                {x: 5, y: 2}, {x: 5, y: 3}, {x: 6, y: 3}, {x: 7, y: 3}, {x: 8, y: 3},
                {x: 9, y: 3}, {x: 10, y: 3}, {x: 11, y: 3}, {x: 12, y: 3}, {x: 13, y: 3},
                {x: 14, y: 3}, {x: 15, y: 3}, {x: 16, y: 3}, {x: 17, y: 3}, {x: 18, y: 3}
            ];
            
            const catPos = catPath[Math.floor(demoTime / 10) % catPath.length];
            const catX = catPos.x * cellSize + cellSize/2 + 50;
            const catY = catPos.y * cellSize + cellSize/2 + 30;
            
            // Draw demo cat
            demoCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
            demoCtx.beginPath();
            demoCtx.arc(catX, catY, 6, 0, Math.PI * 2);
            demoCtx.fill();
            
            // Cat ears
            demoCtx.strokeStyle = '#000';
            demoCtx.lineWidth = 1;
            demoCtx.beginPath();
            demoCtx.moveTo(catX - 3, catY - 4);
            demoCtx.lineTo(catX - 1, catY - 6);
            demoCtx.lineTo(catX + 1, catY - 4);
            demoCtx.moveTo(catX + 1, catY - 4);
            demoCtx.lineTo(catX + 3, catY - 6);
            demoCtx.lineTo(catX + 5, catY - 4);
            demoCtx.stroke();
            
            // Demo ghosts
            const ghostPositions = [
                {x: 9, y: 7, color: '#ff0000'},
                {x: 11, y: 7, color: '#ffb8ff'}
            ];
            
            ghostPositions.forEach(ghost => {
                const ghostX = ghost.x * cellSize + cellSize/2 + 50;
                const ghostY = ghost.y * cellSize + cellSize/2 + 30;
                
                demoCtx.fillStyle = ghost.color;
                demoCtx.beginPath();
                demoCtx.arc(ghostX, ghostY - 1, 6, 0, Math.PI);
                demoCtx.rect(ghostX - 6, ghostY - 1, 12, 8);
                demoCtx.fill();
                
                // Ghost bottom
                demoCtx.beginPath();
                demoCtx.moveTo(ghostX - 6, ghostY + 7);
                demoCtx.lineTo(ghostX - 3, ghostY + 4);
                demoCtx.lineTo(ghostX, ghostY + 7);
                demoCtx.lineTo(ghostX + 3, ghostY + 4);
                demoCtx.lineTo(ghostX + 6, ghostY + 7);
                demoCtx.lineTo(ghostX + 6, ghostY - 1);
                demoCtx.lineTo(ghostX - 6, ghostY - 1);
                demoCtx.closePath();
                demoCtx.fill();
                
                // Eyes
                demoCtx.fillStyle = '#ffffff';
                demoCtx.beginPath();
                demoCtx.arc(ghostX - 2, ghostY - 1, 1, 0, Math.PI * 2);
                demoCtx.arc(ghostX + 2, ghostY - 1, 1, 0, Math.PI * 2);
                demoCtx.fill();
            });
            
            // Instructions text overlay
            demoCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            demoCtx.fillRect(10, 10, 200, 60);
            demoCtx.fillStyle = '#ffffff';
            demoCtx.font = '12px Arial';
            demoCtx.fillText('🐱 Use arrow keys to move', 15, 25);
            demoCtx.fillText('🟡 Collect all dots', 15, 40);
            demoCtx.fillText('👻 Avoid the ghosts!', 15, 55);
            
            demoTime++;
            setTimeout(animateDemo, 100);
        }

        // Theme and mode functions
        function toggleThemeDropdown() {
            const dropdown = document.getElementById('themeDropdown');
            dropdown.classList.toggle('show');
        }

        function hideThemeDropdown(e) {
            if (!e || !e.target || !e.target.matches('.dropdown-btn')) {
                document.getElementById('themeDropdown').classList.remove('show');
            }
        }

        function changeTheme(theme) {
            document.body.className = document.body.className.replace(/theme-\w+/, `theme-${theme}`);
            hideThemeDropdown();
        }

        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const btn = document.querySelector('.mode-toggle');
            btn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light' : '🌙 Dark';
        }

        // Initialize when page loads
        window.addEventListener('load', initGame);