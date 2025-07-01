import { initWebGPUDevice } from './webgpu/device.js';
import { createBreakoutSpriteAtlas } from './sprite-atlas.js';
import { createSpriteRenderer, renderSpriteWithName } from './sprite-renderer.js';

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
        
        statusEl.textContent = 'Step 5: Sprite System Active!';
        statusEl.className = 'success';
        
        // Step 5: Render game objects using sprite atlas
        function renderFrame() {
            const commandEncoder = webgpu.device.createCommandEncoder();
            
            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: webgpu.context.getCurrentTexture().createView(),
                    clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
            });

            // Render paddle at bottom
            renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, 'paddle', {
                position: [0.0, -0.7],
                scale: [0.4, 0.08],
                color: [1.0, 1.0, 1.0]  // White (natural color)
            });
            
            // Render ball in center
            renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, 'ball', {
                position: [0.0, 0.0],
                scale: [0.06, 0.06],
                color: [1.0, 1.0, 1.0]  // White (natural color)
            });
            
            // Render some bricks at top
            renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, 'brick_blue', {
                position: [-0.3, 0.5],
                scale: [0.15, 0.08],
                color: [1.0, 1.0, 1.0]  // White (natural color)
            });
            
            renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, 'brick_green', {
                position: [0.0, 0.5],
                scale: [0.15, 0.08],
                color: [1.0, 1.0, 1.0]  // White (natural color)
            });
            
            renderSpriteWithName(webgpu.device, renderPass, spriteRenderer, 'brick_yellow', {
                position: [0.3, 0.5],
                scale: [0.15, 0.08],
                color: [1.0, 1.0, 1.0]  // White (natural color)
            });

            renderPass.end();
            webgpu.device.queue.submit([commandEncoder.finish()]);
        }
        
        renderFrame();
        
    } catch (error) {
        statusEl.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        statusEl.className = 'error';
        console.error('WebGPU initialization failed:', error);
    }
}

main();