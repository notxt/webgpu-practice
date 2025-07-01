import { WebGPUDevice } from './webgpu/device.js';
import { createSampler } from './webgpu/texture.js';
import { SpriteAtlas, SpriteInfo } from './sprite-atlas.js';
import { Transform } from './shapes.js';

// Sprite render data
export interface SpriteRenderer {
    pipeline: GPURenderPipeline;
    vertexBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    transformBuffer: GPUBuffer;
    spriteUVBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
    sampler: GPUSampler;
    atlas: SpriteAtlas;
}

// Create sprite rendering system
export async function createSpriteRenderer(
    webgpu: WebGPUDevice,
    atlas: SpriteAtlas
): Promise<SpriteRenderer> {
    const { device } = webgpu;

    // Create quad geometry with texture coordinates
    // This will be reused for all sprites
    const vertices = new Float32Array([
        // Position    TexCoord
        -0.5,  0.5,   0.0, 0.0, // Top-left
         0.5,  0.5,   1.0, 0.0, // Top-right
         0.5, -0.5,   1.0, 1.0, // Bottom-right
        -0.5, -0.5,   0.0, 1.0, // Bottom-left
    ]);
    
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

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

    // Create uniform buffers
    const transformBuffer = device.createBuffer({
        size: 32, // Transform struct size
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const spriteUVBuffer = device.createBuffer({
        size: 16, // SpriteUV struct: 2 vec2f = 16 bytes
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Create sampler
    const sampler = createSampler(device);

    // Load and compile shader
    const shaderResponse = await fetch('src/shaders/sprite.wgsl');
    const shaderCode = await shaderResponse.text();
    const shaderModule = device.createShaderModule({ code: shaderCode });

    // Create render pipeline
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

    // Create bind group
    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: transformBuffer,
                },
            },
            {
                binding: 1,
                resource: {
                    buffer: spriteUVBuffer,
                },
            },
            {
                binding: 2,
                resource: sampler,
            },
            {
                binding: 3,
                resource: atlas.texture.createView(),
            },
        ],
    });

    return {
        pipeline,
        vertexBuffer,
        indexBuffer,
        transformBuffer,
        spriteUVBuffer,
        bindGroup,
        sampler,
        atlas,
    };
}

// Update sprite transform
export function updateSpriteTransform(
    device: GPUDevice,
    renderer: SpriteRenderer,
    transform: Transform
): void {
    // Pack transform data
    const data = new Float32Array(8); // 32 bytes / 4 = 8 floats
    data[0] = transform.position[0];
    data[1] = transform.position[1];
    data[2] = transform.scale[0];
    data[3] = transform.scale[1];
    data[4] = transform.color[0];
    data[5] = transform.color[1];
    data[6] = transform.color[2];
    // data[7] is padding

    device.queue.writeBuffer(renderer.transformBuffer, 0, data);
}

// Update sprite UV mapping
export function updateSpriteUV(
    device: GPUDevice,
    renderer: SpriteRenderer,
    sprite: SpriteInfo
): void {
    // Pack sprite UV data
    const data = new Float32Array(4); // 16 bytes / 4 = 4 floats
    data[0] = sprite.u;        // UV offset X
    data[1] = sprite.v;        // UV offset Y
    data[2] = sprite.uWidth;   // UV width
    data[3] = sprite.vHeight;  // UV height

    device.queue.writeBuffer(renderer.spriteUVBuffer, 0, data);
}

// Render sprite
export function renderSprite(
    renderPass: GPURenderPassEncoder,
    renderer: SpriteRenderer
): void {
    renderPass.setPipeline(renderer.pipeline);
    renderPass.setBindGroup(0, renderer.bindGroup);
    renderPass.setVertexBuffer(0, renderer.vertexBuffer);
    renderPass.setIndexBuffer(renderer.indexBuffer, 'uint16');
    renderPass.drawIndexed(6); // 6 indices for quad
}

// Convenience function to render a specific sprite
export function renderSpriteWithName(
    device: GPUDevice,
    renderPass: GPURenderPassEncoder,
    renderer: SpriteRenderer,
    spriteName: string,
    transform: Transform
): void {
    const sprite = renderer.atlas.sprites.get(spriteName);
    if (!sprite) {
        console.warn(`Sprite '${spriteName}' not found in atlas`);
        return;
    }

    // Create dedicated uniform buffers for this sprite instance
    const transformBuffer = device.createBuffer({
        size: 32, // Transform struct size
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const spriteUVBuffer = device.createBuffer({
        size: 16, // SpriteUV struct: 2 vec2f = 16 bytes
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Pack transform data
    const transformData = new Float32Array(8); // 32 bytes / 4 = 8 floats
    transformData[0] = transform.position[0];
    transformData[1] = transform.position[1];
    transformData[2] = transform.scale[0];
    transformData[3] = transform.scale[1];
    transformData[4] = transform.color[0];
    transformData[5] = transform.color[1];
    transformData[6] = transform.color[2];
    // transformData[7] is padding

    // Pack sprite UV data
    const uvData = new Float32Array(4); // 16 bytes / 4 = 4 floats
    uvData[0] = sprite.u;        // UV offset X
    uvData[1] = sprite.v;        // UV offset Y
    uvData[2] = sprite.uWidth;   // UV width
    uvData[3] = sprite.vHeight;  // UV height

    // Write data to buffers
    device.queue.writeBuffer(transformBuffer, 0, transformData);
    device.queue.writeBuffer(spriteUVBuffer, 0, uvData);

    // Create dedicated bind group for this sprite instance
    const bindGroup = device.createBindGroup({
        layout: renderer.pipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: transformBuffer,
                },
            },
            {
                binding: 1,
                resource: {
                    buffer: spriteUVBuffer,
                },
            },
            {
                binding: 2,
                resource: renderer.sampler,
            },
            {
                binding: 3,
                resource: renderer.atlas.texture.createView(),
            },
        ],
    });

    // Render with dedicated resources
    renderPass.setPipeline(renderer.pipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.setVertexBuffer(0, renderer.vertexBuffer);
    renderPass.setIndexBuffer(renderer.indexBuffer, 'uint16');
    renderPass.drawIndexed(6); // 6 indices for quad
}