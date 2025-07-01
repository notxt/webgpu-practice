export async function createTextureFromImageData(
    device: GPUDevice,
    imageData: ImageData
): Promise<GPUTexture> {
    const texture = device.createTexture({
        size: [imageData.width, imageData.height, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    device.queue.writeTexture(
        { texture },
        imageData.data,
        { 
            offset: 0,
            bytesPerRow: imageData.width * 4,
            rowsPerImage: imageData.height,
        },
        { width: imageData.width, height: imageData.height, depthOrArrayLayers: 1 }
    );

    return texture;
}

export async function loadTextureFromURL(
    device: GPUDevice,
    url: string
): Promise<GPUTexture> {
    const response = await fetch(url);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);
    
    const texture = device.createTexture({
        size: [imageBitmap.width, imageBitmap.height, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });

    device.queue.copyExternalImageToTexture(
        { source: imageBitmap },
        { texture },
        [imageBitmap.width, imageBitmap.height, 1]
    );

    return texture;
}

export function createSimpleTexture(
    device: GPUDevice,
    width: number,
    height: number,
    color: [number, number, number, number] = [255, 255, 255, 255]
): GPUTexture {
    // Create simple colored texture
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    
    // Fill with gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`);
    gradient.addColorStop(1, `rgba(${Math.floor(color[0] * 0.7)}, ${Math.floor(color[1] * 0.7)}, ${Math.floor(color[2] * 0.7)}, ${color[3] / 255})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add border
    ctx.strokeStyle = `rgba(${Math.floor(color[0] * 0.5)}, ${Math.floor(color[1] * 0.5)}, ${Math.floor(color[2] * 0.5)}, 1)`;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    
    const texture = device.createTexture({
        size: [width, height, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    device.queue.writeTexture(
        { texture },
        imageData.data,
        { 
            offset: 0,
            bytesPerRow: width * 4,
            rowsPerImage: height,
        },
        { width, height, depthOrArrayLayers: 1 }
    );

    return texture;
}

export function createSampler(device: GPUDevice): GPUSampler {
    return device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
        mipmapFilter: 'linear',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
    });
}