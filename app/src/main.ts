import { initWebGPUDevice } from './webgpu/device.js';
import { createBreakoutSpriteAtlas } from './sprite-atlas.js';
import { createSpriteRenderer, renderSpriteWithName } from './sprite-renderer.js';
import { createInputState, setupInput, isKeyPressed } from './game/input.js';
import { 
    updatePhysicsBody, 
    circleRectCollision, 
    calculateBounceDirection,
    calculatePaddleBounce,
    getPaddleHitPosition,
    isBallOutOfBounds,
    clamp
} from './game/physics.js';
import {
    createGameState,
    getPaddleRect,
    getBrickRect,
    damageBrick,
    resetBall,
    areAllBricksDestroyed,
    addScore
} from './game/gamestate.js';

async function main(): Promise<void> {
    const canvas = document.getElementById('gpu-canvas') as HTMLCanvasElement;
    const statusEl = document.getElementById('status') as HTMLDivElement;
    
    try {
        statusEl.textContent = 'Initializing WebGPU...';
        
        // Initialize WebGPU device
        const webgpu = await initWebGPUDevice(canvas);
        
        statusEl.textContent = 'Creating sprite atlas...';
        
        // Create sprite atlas with all game sprites
        const atlas = createBreakoutSpriteAtlas(webgpu.device);
        
        // Create sprite renderer
        const spriteRenderer = await createSpriteRenderer(webgpu, atlas);
        
        // Setup input handling
        const inputState = createInputState();
        setupInput(canvas, inputState);
        
        statusEl.textContent = 'Step 7: Physics & Collisions! Use Arrow Keys to play';
        statusEl.className = 'success';
        
        // Initialize game state
        const gameState = createGameState();
        
        // Physics constants
        const paddleSpeed = 2.0;
        const paddleAcceleration = 8.0;
        const paddleFriction = 0.9;
        const ballSpeedMultiplier = 1.02; // Ball speeds up 2% each paddle hit
        
        let lastTime = performance.now();
        let frameCount = 0;
        
        // Main game loop
        function renderFrame(currentTime: number) {
            // Calculate delta time in seconds
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            
            // Skip first frame or invalid delta times
            frameCount++;
            if (frameCount === 1 || deltaTime <= 0 || deltaTime > 0.1) {
                requestAnimationFrame(renderFrame);
                return;
            }
            
            // Handle paddle input
            let targetVelocity = 0;
            if (isKeyPressed(inputState, 'ArrowLeft')) {
                targetVelocity = -paddleSpeed;
            } else if (isKeyPressed(inputState, 'ArrowRight')) {
                targetVelocity = paddleSpeed;
            }
            
            // Update paddle physics
            if (targetVelocity !== 0) {
                const velocityDiff = targetVelocity - gameState.paddle.velocity;
                gameState.paddle.velocity += velocityDiff * paddleAcceleration * deltaTime;
            } else {
                gameState.paddle.velocity *= Math.pow(paddleFriction, deltaTime * 60);
                if (Math.abs(gameState.paddle.velocity) < 0.01) gameState.paddle.velocity = 0;
            }
            
            // Update paddle position
            gameState.paddle.position.x += gameState.paddle.velocity * deltaTime;
            gameState.paddle.position.x = clamp(gameState.paddle.position.x, -0.85, 0.85);
            
            // Update ball physics
            if (!gameState.isPaused && !gameState.isGameOver) {
                updatePhysicsBody(gameState.ball, deltaTime);
                
                // Wall collisions
                if (gameState.ball.position.x - gameState.ball.radius < -1 || 
                    gameState.ball.position.x + gameState.ball.radius > 1) {
                    gameState.ball.velocity.x = -gameState.ball.velocity.x;
                    gameState.ball.position.x = clamp(
                        gameState.ball.position.x, 
                        -1 + gameState.ball.radius, 
                        1 - gameState.ball.radius
                    );
                }
                
                // Ceiling collision
                if (gameState.ball.position.y + gameState.ball.radius > 1) {
                    gameState.ball.velocity.y = -gameState.ball.velocity.y;
                    gameState.ball.position.y = 1 - gameState.ball.radius;
                }
                
                // Ball out of bounds (lose life)
                if (isBallOutOfBounds(gameState.ball.position.y, -1)) {
                    gameState.lives--;
                    if (gameState.lives <= 0) {
                        gameState.isGameOver = true;
                        statusEl.textContent = `Game Over! Final Score: ${gameState.score}`;
                        statusEl.className = 'error';
                    } else {
                        resetBall(gameState);
                        statusEl.textContent = `Lives: ${gameState.lives} | Score: ${gameState.score}`;
                    }
                }
                
                // Paddle collision
                const paddleRect = getPaddleRect(gameState.paddle);
                if (circleRectCollision(gameState.ball.position, gameState.ball.radius, paddleRect)) {
                    // Only bounce if ball is moving downward
                    if (gameState.ball.velocity.y < 0) {
                        const hitPos = getPaddleHitPosition(
                            gameState.ball.position.x, 
                            gameState.paddle.position.x, 
                            gameState.paddle.width
                        );
                        gameState.ball.velocity = calculatePaddleBounce(
                            gameState.ball.velocity, 
                            hitPos, 
                            ballSpeedMultiplier
                        );
                        // Ensure ball doesn't get stuck in paddle
                        gameState.ball.position.y = paddleRect.y + paddleRect.height + gameState.ball.radius;
                    }
                }
                
                // Brick collisions
                for (const brick of gameState.bricks) {
                    if (!brick.isDestroyed) {
                        const brickRect = getBrickRect(brick);
                        if (circleRectCollision(gameState.ball.position, gameState.ball.radius, brickRect)) {
                            // Calculate bounce direction
                            gameState.ball.velocity = calculateBounceDirection(
                                gameState.ball.position,
                                gameState.ball.velocity,
                                brickRect
                            );
                            
                            // Damage brick
                            damageBrick(brick);
                            
                            // Update score
                            if (brick.isDestroyed) {
                                const points = brick.color === 'brick_yellow' ? 10 : 
                                              brick.color === 'brick_green' ? 20 : 30;
                                addScore(gameState, points);
                                statusEl.textContent = `Lives: ${gameState.lives} | Score: ${gameState.score}`;
                                
                                // Check victory condition
                                if (areAllBricksDestroyed(gameState)) {
                                    gameState.isGameOver = true;
                                    statusEl.textContent = `Victory! Final Score: ${gameState.score}`;
                                    statusEl.className = 'success';
                                }
                            }
                            
                            break; // Only handle one brick collision per frame
                        }
                    }
                }
            }
            
            // Render everything
            const commandEncoder = webgpu.device.createCommandEncoder();
            
            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: webgpu.context.getCurrentTexture().createView(),
                    clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
            });

            // Render paddle
            renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, 'paddle', {
                position: [gameState.paddle.position.x, gameState.paddle.position.y],
                scale: [gameState.paddle.width, gameState.paddle.height],
                color: [1.0, 1.0, 1.0]
            });
            
            // Render ball (no rotation for physics clarity)
            renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, 'ball', {
                position: [gameState.ball.position.x, gameState.ball.position.y],
                scale: [gameState.ball.radius * 2, gameState.ball.radius * 2],
                color: [1.0, 1.0, 1.0]
            });
            
            // Render bricks
            for (const brick of gameState.bricks) {
                if (!brick.isDestroyed) {
                    renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, brick.color, {
                        position: [brick.position.x, brick.position.y],
                        scale: [brick.width, brick.height],
                        color: [1.0, 1.0, 1.0]
                    });
                }
            }

            renderPass.end();
            webgpu.device.queue.submit([commandEncoder.finish()]);
            
            requestAnimationFrame(renderFrame);
        }
        
        // Start with initial status
        statusEl.textContent = `Lives: ${gameState.lives} | Score: ${gameState.score}`;
        requestAnimationFrame(renderFrame);
        
    } catch (error) {
        statusEl.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        statusEl.className = 'error';
        console.error('WebGPU initialization failed:', error);
    }
}

main();