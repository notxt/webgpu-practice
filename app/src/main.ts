import { initWebGPUDevice } from './webgpu/device.js';
import { createBreakoutSpriteAtlas } from './sprite-atlas.js';
import { createSpriteRenderer, renderSpriteWithName } from './sprite-renderer.js';
import { createInputState, setupInput, isKeyPressed } from './game/input.js';

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
        
        // Log sprite atlas info for debugging
        console.log('Atlas size:', atlas.atlasWidth, 'x', atlas.atlasHeight);
        console.log('Available sprites:');
        atlas.sprites.forEach((sprite, name) => {
            console.log(`${name}: UV(${sprite.u.toFixed(3)}, ${sprite.v.toFixed(3)}) Size(${sprite.uWidth.toFixed(3)}, ${sprite.vHeight.toFixed(3)})`);
        });
        
        // Create sprite renderer
        const spriteRenderer = await createSpriteRenderer(webgpu, atlas);
        
        // Setup input handling
        const inputState = createInputState();
        setupInput(canvas, inputState);
        
        statusEl.textContent = 'Step 6: Transform Matrices Active! Use Arrow Keys to move paddle';
        statusEl.className = 'success';
        
        // Game state
        let paddleX = 0.0;
        let paddleVelocity = 0.0;
        const paddleSpeed = 2.0; // Units per second
        const paddleAcceleration = 8.0; // Units per second^2
        const paddleFriction = 0.9; // Deceleration factor (0-1)
        let rotation = 0;
        
        let lastTime = performance.now();
        let frameCount = 0;
        
        // Step 6: Render game with transform matrices and movement
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
            
            
            
            // Handle paddle input with smooth acceleration
            let targetVelocity = 0;
            if (isKeyPressed(inputState, 'ArrowLeft')) {
                targetVelocity = -paddleSpeed;
            } else if (isKeyPressed(inputState, 'ArrowRight')) {
                targetVelocity = paddleSpeed;
            }
            
            
            // Smooth velocity changes
            if (targetVelocity !== 0) {
                // Accelerate towards target velocity
                const velocityDiff = targetVelocity - paddleVelocity;
                paddleVelocity += velocityDiff * paddleAcceleration * deltaTime;
            } else {
                // Apply friction when no input (exponential decay)
                paddleVelocity *= Math.pow(paddleFriction, deltaTime * 60); // Normalized to 60fps
                if (Math.abs(paddleVelocity) < 0.01) paddleVelocity = 0;
            }
            
            // Update paddle position
            paddleX += paddleVelocity * deltaTime;
            paddleX = Math.max(-0.8, Math.min(0.8, paddleX)); // Keep paddle on screen
            
            // Rotate ball continuously
            rotation += deltaTime * 2; // 2 radians per second
            
            const commandEncoder = webgpu.device.createCommandEncoder();
            
            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: webgpu.context.getCurrentTexture().createView(),
                    clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
            });

            // Render paddle with larger scale to ensure visibility
            renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, 'paddle', {
                position: [paddleX, -0.6],
                scale: [0.3, 0.1],
                color: [1.0, 1.0, 1.0]
            });
            
            
            // Render rotating ball
            renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, 'ball', {
                position: [0.0, 0.0],
                rotation: rotation,
                scale: [0.06, 0.06],
                color: [1.0, 1.0, 1.0]
            });
            
            // Render tilted bricks to show rotation works
            renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, 'brick_blue', {
                position: [-0.3, 0.5],
                rotation: -0.1, // Slight tilt
                scale: [0.15, 0.08],
                color: [1.0, 1.0, 1.0]
            });
            
            renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, 'brick_green', {
                position: [0.0, 0.5],
                rotation: 0.0,
                scale: [0.15, 0.08],
                color: [1.0, 1.0, 1.0]
            });
            
            renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, 'brick_yellow', {
                position: [0.3, 0.5],
                rotation: 0.1, // Slight tilt
                scale: [0.15, 0.08],
                color: [1.0, 1.0, 1.0]
            });

            renderPass.end();
            webgpu.device.queue.submit([commandEncoder.finish()]);
            
            requestAnimationFrame(renderFrame);
        }
        
        requestAnimationFrame(renderFrame);
        
    } catch (error) {
        statusEl.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        statusEl.className = 'error';
        console.error('WebGPU initialization failed:', error);
    }
}

main();