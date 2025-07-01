export interface WebGPUDevice {
    device: GPUDevice;
    context: GPUCanvasContext;
    format: GPUTextureFormat;
}

export async function initWebGPUDevice(canvas: HTMLCanvasElement): Promise<WebGPUDevice> {
    if (!navigator.gpu) {
        throw new Error('WebGPU is not supported in this browser');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error('Failed to get GPU adapter');
    }

    const device = await adapter.requestDevice();
    
    const context = canvas.getContext('webgpu');
    if (!context) {
        throw new Error('Failed to get WebGPU context');
    }

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format,
    });

    return { device, context, format };
}