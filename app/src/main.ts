import { initWebGPUDevice } from './webgpu/device.js';
import { createPaddle, createBall, createBrick, updateShapeTransform, renderShape } from './shapes.js';

async function main(): Promise<void> {
    const canvas = document.getElementById('gpu-canvas') as HTMLCanvasElement;
    const statusEl = document.getElementById('status') as HTMLDivElement;
    
    try {
        statusEl.textContent = 'Initializing WebGPU...';
        
        // Initialize WebGPU device
        const webgpu = await initWebGPUDevice(canvas);
        
        statusEl.textContent = 'Creating shapes...';
        
        // Create all shapes
        const paddle = await createPaddle(webgpu);
        const ball = await createBall(webgpu);
        const brick = await createBrick(webgpu);
        
        statusEl.textContent = 'WebGPU functional shapes rendering active!';
        statusEl.className = 'success';
        
        // Set up transforms for each shape
        updateShapeTransform(webgpu.device, paddle, {
            position: [0.0, -0.8],     // Bottom center
            scale: [1.0, 1.0],         // Normal size
            color: [0.2, 0.8, 0.2]     // Green
        });
        
        updateShapeTransform(webgpu.device, ball, {
            position: [0.3, 0.2],      // Upper right
            scale: [1.0, 1.0],         // Normal size
            color: [1.0, 0.5, 0.1]     // Orange
        });
        
        updateShapeTransform(webgpu.device, brick, {
            position: [-0.3, 0.6],     // Upper left
            scale: [1.0, 1.0],         // Normal size
            color: [0.8, 0.2, 0.2]     // Red
        });
        
        // Render all shapes
        function renderFrame() {
            const commandEncoder = webgpu.device.createCommandEncoder();
            
            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: webgpu.context.getCurrentTexture().createView(),
                    clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 }, // Dark gray background
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
            });

            // Render shapes using functional approach
            renderShape(renderPass, paddle);
            renderShape(renderPass, ball);
            renderShape(renderPass, brick);

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