import { WebGPUDevice } from './webgpu/device.js';

export async function createRectangleRenderer(webgpu: WebGPUDevice) {
    const { device } = webgpu;

    // Rectangle vertex data: position (x, y) and color (r, g, b)
    // We'll create a colorful rectangle with different colors at each corner
    const vertices = new Float32Array([
        // Position    Color
        -0.5,  0.5,   1.0, 0.0, 0.0, // Top-left:     Red
         0.5,  0.5,   0.0, 1.0, 0.0, // Top-right:    Green  
         0.5, -0.5,   0.0, 0.0, 1.0, // Bottom-right: Blue
        -0.5, -0.5,   1.0, 1.0, 0.0, // Bottom-left:  Yellow
    ]);

    // Index data: which vertices form each triangle
    // Rectangle = 2 triangles: (0,1,2) and (0,2,3)
    const indices = new Uint16Array([
        0, 1, 2, // First triangle
        0, 2, 3, // Second triangle
    ]);

    // Create vertex buffer
    const vertexBuffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, 0, vertices);

    // Create index buffer
    const indexBuffer = device.createBuffer({
        size: indices.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(indexBuffer, 0, indices);

    // Load and compile the shader
    const shaderResponse = await fetch('/src/shaders/rectangle.wgsl');
    const shaderCode = await shaderResponse.text();
    
    const shaderModule = device.createShaderModule({
        code: shaderCode,
    });

    // Create the render pipeline with vertex buffer layout
    const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
            buffers: [{
                arrayStride: 5 * 4, // 5 floats * 4 bytes each (position + color)
                attributes: [
                    // Position attribute
                    {
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x2',
                    },
                    // Color attribute  
                    {
                        shaderLocation: 1,
                        offset: 2 * 4, // Skip 2 floats (position)
                        format: 'float32x3',
                    },
                ],
            }],
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
    return function renderRectangle() {
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
        renderPass.setVertexBuffer(0, vertexBuffer);
        renderPass.setIndexBuffer(indexBuffer, 'uint16');
        renderPass.drawIndexed(6); // Draw 6 indices (2 triangles)
        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);
    };
}