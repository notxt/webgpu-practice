import { initWebGPUDevice } from './webgpu/device.js';
import { createRectangleRenderer } from './rectangle.js';

async function main(): Promise<void> {
    const canvas = document.getElementById('gpu-canvas') as HTMLCanvasElement;
    const statusEl = document.getElementById('status') as HTMLDivElement;
    
    try {
        statusEl.textContent = 'Initializing WebGPU...';
        
        // Initialize WebGPU device
        const webgpu = await initWebGPUDevice(canvas);
        
        statusEl.textContent = 'Creating rectangle renderer...';
        
        // Create rectangle renderer
        const renderRectangle = await createRectangleRenderer(webgpu);
        
        statusEl.textContent = 'WebGPU rectangle rendering active!';
        statusEl.className = 'success';
        
        // Render the rectangle
        renderRectangle();
        
    } catch (error) {
        statusEl.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        statusEl.className = 'error';
        console.error('WebGPU initialization failed:', error);
    }
}

main();