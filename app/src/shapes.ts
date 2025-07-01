import { WebGPUDevice } from './webgpu/device.js';

// Transform data structure that matches WGSL uniform
export interface Transform {
    position: [number, number];
    scale: [number, number];
    color: [number, number, number];
}

// Shape data structure
export interface Shape {
    pipeline: GPURenderPipeline;
    vertexBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    uniformBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
    indexCount: number;
}

// Create a shape with buffers and pipeline
export async function createShape(
    webgpu: WebGPUDevice,
    vertices: Float32Array,
    indices: Uint16Array
): Promise<Shape> {
    const { device } = webgpu;

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

    // Create uniform buffer for transform data
    // Transform struct: position(8) + scale(8) + color(12) + padding(4) = 32 bytes
    const uniformBuffer = device.createBuffer({
        size: 32,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Load and compile shader
    const shaderResponse = await fetch('src/shaders/shapes.wgsl');
    const shaderCode = await shaderResponse.text();
    const shaderModule = device.createShaderModule({ code: shaderCode });

    // Create render pipeline
    const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
            buffers: [{
                arrayStride: 2 * 4, // 2 floats * 4 bytes (position only)
                attributes: [{
                    shaderLocation: 0,
                    offset: 0,
                    format: 'float32x2',
                }],
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

    // Create bind group for uniforms
    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: {
                buffer: uniformBuffer,
            },
        }],
    });

    return {
        pipeline,
        vertexBuffer,
        indexBuffer,
        uniformBuffer,
        bindGroup,
        indexCount: indices.length,
    };
}

// Update shape transform
export function updateShapeTransform(
    device: GPUDevice,
    shape: Shape,
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

// Render shape
export function renderShape(
    renderPass: GPURenderPassEncoder,
    shape: Shape
): void {
    renderPass.setPipeline(shape.pipeline);
    renderPass.setBindGroup(0, shape.bindGroup);
    renderPass.setVertexBuffer(0, shape.vertexBuffer);
    renderPass.setIndexBuffer(shape.indexBuffer, 'uint16');
    renderPass.drawIndexed(shape.indexCount);
}

// Create paddle geometry
export function createPaddleGeometry(): { vertices: Float32Array; indices: Uint16Array } {
    const vertices = new Float32Array([
        -0.15,  0.05, // Top-left
         0.15,  0.05, // Top-right
         0.15, -0.05, // Bottom-right
        -0.15, -0.05, // Bottom-left
    ]);
    
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    return { vertices, indices };
}

// Create ball geometry (octagon)
export function createBallGeometry(): { vertices: Float32Array; indices: Uint16Array } {
    const vertices: number[] = [];
    const indices: number[] = [];
    const radius = 0.03;
    const sides = 8;

    // Center vertex
    vertices.push(0, 0);

    // Create vertices around circle
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        vertices.push(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
        );
    }

    // Create triangles from center to edge
    for (let i = 0; i < sides; i++) {
        indices.push(0, i + 1, ((i + 1) % sides) + 1);
    }

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices),
    };
}

// Create brick geometry
export function createBrickGeometry(): { vertices: Float32Array; indices: Uint16Array } {
    const vertices = new Float32Array([
        -0.08,  0.04, // Top-left
         0.08,  0.04, // Top-right
         0.08, -0.04, // Bottom-right
        -0.08, -0.04, // Bottom-left
    ]);
    
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    return { vertices, indices };
}

// Factory functions for creating game shapes
export async function createPaddle(webgpu: WebGPUDevice): Promise<Shape> {
    const { vertices, indices } = createPaddleGeometry();
    return createShape(webgpu, vertices, indices);
}

export async function createBall(webgpu: WebGPUDevice): Promise<Shape> {
    const { vertices, indices } = createBallGeometry();
    return createShape(webgpu, vertices, indices);
}

export async function createBrick(webgpu: WebGPUDevice): Promise<Shape> {
    const { vertices, indices } = createBrickGeometry();
    return createShape(webgpu, vertices, indices);
}