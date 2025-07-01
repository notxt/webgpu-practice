import { WebGPUDevice } from './webgpu/device.js';

export async function createTriangleRenderer(webgpu: WebGPUDevice) {
    const { device } = webgpu;

    // Load and compile the shader
    const shaderResponse = await fetch('/src/shaders/triangle.wgsl');
    const shaderCode = await shaderResponse.text();
    
    const shaderModule = device.createShaderModule({
        code: shaderCode,
    });

    // Create the render pipeline
    const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
        },
        fragment: {
            module: shaderModule,
            entryPoint: 'fs_main',
            targets: [{
                format: webgpu.format,
            }],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });

    // Return render function
    return function renderTriangle() {
        const commandEncoder = device.createCommandEncoder();
        
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: webgpu.context.getCurrentTexture().createView(),
                clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 }, // Dark gray background
                loadOp: 'clear',
                storeOp: 'store',
            }],
        });

        renderPass.setPipeline(pipeline);
        renderPass.draw(3); // Draw 3 vertices (triangle)
        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);
    };
}