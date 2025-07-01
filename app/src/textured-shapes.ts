import { WebGPUDevice } from './webgpu/device.js';
import { createSimpleTexture, createSampler } from './webgpu/texture.js';
import { Transform } from './shapes.js';

// Textured shape data structure
export interface TexturedShape {
    pipeline: GPURenderPipeline;
    vertexBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    uniformBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
    indexCount: number;
    texture: GPUTexture;
    sampler: GPUSampler;
}

// Create textured shape with texture coordinates
export async function createTexturedShape(
    webgpu: WebGPUDevice,
    vertices: Float32Array, // position + texCoord data
    indices: Uint16Array,
    textureColor: [number, number, number, number] = [100, 200, 100, 255]
): Promise<TexturedShape> {
    const { device } = webgpu;

    // Create vertex buffer (position + texture coordinates)
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

    // Create uniform buffer for transform data
    const uniformBuffer = device.createBuffer({
        size: 32,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Create texture and sampler
    const texture = createSimpleTexture(device, 64, 32, textureColor);
    const sampler = createSampler(device);

    // Load and compile shader
    const shaderResponse = await fetch('src/shaders/textured.wgsl');
    const shaderCode = await shaderResponse.text();
    const shaderModule = device.createShaderModule({ code: shaderCode });

    // Create render pipeline with texture coordinates
    const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
            buffers: [{
                arrayStride: 4 * 4, // 4 floats * 4 bytes (position + texCoord)
                attributes: [
                    // Position attribute
                    {
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x2',
                    },
                    // Texture coordinate attribute
                    {
                        shaderLocation: 1,
                        offset: 2 * 4, // Skip 2 floats (position)
                        format: 'float32x2',
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

    // Create bind group for uniforms, sampler, and texture
    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniformBuffer,
                },
            },
            {
                binding: 1,
                resource: sampler,
            },
            {
                binding: 2,
                resource: texture.createView(),
            },
        ],
    });

    return {
        pipeline,
        vertexBuffer,
        indexBuffer,
        uniformBuffer,
        bindGroup,
        indexCount: indices.length,
        texture,
        sampler,
    };
}

// Update textured shape transform
export function updateTexturedShapeTransform(
    device: GPUDevice,
    shape: TexturedShape,
    transform: Transform
): void {
    // Pack transform data to match WGSL struct layout
    const data = new Float32Array(8); // 32 bytes / 4 = 8 floats
    data[0] = transform.position[0];
    data[1] = transform.position[1];
    data[2] = transform.scale[0];
    data[3] = transform.scale[1];
    data[4] = transform.color[0];
    data[5] = transform.color[1];
    data[6] = transform.color[2];
    // data[7] is padding

    device.queue.writeBuffer(shape.uniformBuffer, 0, data);
}

// Render textured shape
export function renderTexturedShape(
    renderPass: GPURenderPassEncoder,
    shape: TexturedShape
): void {
    renderPass.setPipeline(shape.pipeline);
    renderPass.setBindGroup(0, shape.bindGroup);
    renderPass.setVertexBuffer(0, shape.vertexBuffer);
    renderPass.setIndexBuffer(shape.indexBuffer, 'uint16');
    renderPass.drawIndexed(shape.indexCount);
}

// Create textured paddle geometry with UV coordinates
export function createTexturedPaddleGeometry(): { vertices: Float32Array; indices: Uint16Array } {
    // Vertices: position(x,y) + texCoord(u,v)
    const vertices = new Float32Array([
        // Position    TexCoord
        -0.15,  0.05,  0.0, 0.0, // Top-left
         0.15,  0.05,  1.0, 0.0, // Top-right
         0.15, -0.05,  1.0, 1.0, // Bottom-right
        -0.15, -0.05,  0.0, 1.0, // Bottom-left
    ]);
    
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    return { vertices, indices };
}

// Factory function for creating textured paddle
export async function createTexturedPaddle(webgpu: WebGPUDevice): Promise<TexturedShape> {
    const { vertices, indices } = createTexturedPaddleGeometry();
    return createTexturedShape(webgpu, vertices, indices, [100, 200, 100, 255]); // Green texture
}