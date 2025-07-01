async function initWebGPU(): Promise<void> {
    const canvas = document.getElementById('gpu-canvas') as HTMLCanvasElement;
    const statusEl = document.getElementById('status') as HTMLDivElement;
    
    if (!navigator.gpu) {
        statusEl.textContent = 'WebGPU is not supported in this browser';
        statusEl.className = 'error';
        throw new Error('WebGPU not supported');
    }
    
    try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            statusEl.textContent = 'Failed to get GPU adapter';
            statusEl.className = 'error';
            throw new Error('Failed to get GPU adapter');
        }
        
        const device = await adapter.requestDevice();
        
        const context = canvas.getContext('webgpu');
        if (!context) {
            statusEl.textContent = 'Failed to get WebGPU context';
            statusEl.className = 'error';
            throw new Error('Failed to get WebGPU context');
        }
        
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device: device,
            format: canvasFormat,
        });
        
        const encoder = device.createCommandEncoder();
        
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                loadOp: 'clear',
                clearValue: { r: 0.0, g: 0.2, b: 0.4, a: 1.0 },
                storeOp: 'store',
            }],
        });
        
        pass.end();
        device.queue.submit([encoder.finish()]);
        
        statusEl.textContent = 'WebGPU initialized successfully!';
        statusEl.className = 'success';
        
    } catch (error) {
        statusEl.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        statusEl.className = 'error';
        console.error('WebGPU initialization failed:', error);
    }
}

initWebGPU();