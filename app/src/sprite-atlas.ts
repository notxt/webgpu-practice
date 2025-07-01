// Sprite definition in atlas
export interface SpriteInfo {
    name: string;
    x: number;      // Pixel coordinates in atlas
    y: number;
    width: number;
    height: number;
    u: number;      // UV coordinates (0-1)
    v: number;
    uWidth: number;
    vHeight: number;
}

// Sprite atlas data
export interface SpriteAtlas {
    texture: GPUTexture;
    sprites: Map<string, SpriteInfo>;
    atlasWidth: number;
    atlasHeight: number;
}

// Create a sprite atlas with procedurally generated sprites
export function createBreakoutSpriteAtlas(device: GPUDevice): SpriteAtlas {
    const atlasWidth = 256;
    const atlasHeight = 128;
    
    // Create canvas for atlas
    const canvas = new OffscreenCanvas(atlasWidth, atlasHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    
    // Clear with transparent background
    ctx.clearRect(0, 0, atlasWidth, atlasHeight);
    
    const sprites = new Map<string, SpriteInfo>();
    
    // 1. PADDLE SPRITE (0, 0, 96, 32)
    const paddleWidth = 96;
    const paddleHeight = 32;
    
    // Paddle gradient background
    const paddleGradient = ctx.createLinearGradient(0, 0, paddleWidth, paddleHeight);
    paddleGradient.addColorStop(0, '#60a060');
    paddleGradient.addColorStop(1, '#305030');
    ctx.fillStyle = paddleGradient;
    ctx.fillRect(0, 0, paddleWidth, paddleHeight);
    
    // Paddle highlights and details
    ctx.fillStyle = '#80c080';
    ctx.fillRect(2, 2, paddleWidth - 4, 6); // Top highlight
    ctx.fillStyle = '#204020';
    ctx.fillRect(0, paddleHeight - 2, paddleWidth, 2); // Bottom shadow
    
    // Paddle border
    ctx.strokeStyle = '#405040';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, paddleWidth - 1, paddleHeight - 1);
    
    sprites.set('paddle', {
        name: 'paddle',
        x: 0, y: 0, width: paddleWidth, height: paddleHeight,
        u: 0, v: 0, 
        uWidth: paddleWidth / atlasWidth, 
        vHeight: paddleHeight / atlasHeight
    });
    
    // 2. BALL SPRITE (96, 0, 32, 32)
    const ballSize = 32;
    const ballX = 96;
    const ballY = 0;
    
    // Ball gradient (orange)
    const ballGradient = ctx.createRadialGradient(
        ballX + ballSize * 0.3, ballY + ballSize * 0.3, 0,
        ballX + ballSize * 0.5, ballY + ballSize * 0.5, ballSize * 0.6
    );
    ballGradient.addColorStop(0, '#ffa040');
    ballGradient.addColorStop(1, '#cc5010');
    
    ctx.beginPath();
    ctx.arc(ballX + ballSize / 2, ballY + ballSize / 2, ballSize / 2 - 1, 0, Math.PI * 2);
    ctx.fillStyle = ballGradient;
    ctx.fill();
    
    // Ball highlight
    ctx.beginPath();
    ctx.arc(ballX + ballSize * 0.35, ballY + ballSize * 0.35, ballSize * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc80';
    ctx.fill();
    
    // Ball border
    ctx.beginPath();
    ctx.arc(ballX + ballSize / 2, ballY + ballSize / 2, ballSize / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = '#994010';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    sprites.set('ball', {
        name: 'ball',
        x: ballX, y: ballY, width: ballSize, height: ballSize,
        u: ballX / atlasWidth, v: ballY / atlasHeight,
        uWidth: ballSize / atlasWidth, 
        vHeight: ballSize / atlasHeight
    });
    
    // 3. BRICK SPRITE (128, 0, 64, 32) 
    const brickWidth = 64;
    const brickHeight = 32;
    const brickX = 128;
    const brickY = 0;
    
    // Brick gradient (red)
    const brickGradient = ctx.createLinearGradient(brickX, brickY, brickX, brickY + brickHeight);
    brickGradient.addColorStop(0, '#d04040');
    brickGradient.addColorStop(1, '#802020');
    ctx.fillStyle = brickGradient;
    ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
    
    // Brick highlights
    ctx.fillStyle = '#ff6060';
    ctx.fillRect(brickX + 1, brickY + 1, brickWidth - 2, 4); // Top highlight
    ctx.fillStyle = '#601010';
    ctx.fillRect(brickX, brickY + brickHeight - 2, brickWidth, 2); // Bottom shadow
    
    // Brick mortar lines
    ctx.strokeStyle = '#601010';
    ctx.lineWidth = 1;
    ctx.strokeRect(brickX + 0.5, brickY + 0.5, brickWidth - 1, brickHeight - 1);
    
    sprites.set('brick', {
        name: 'brick',
        x: brickX, y: brickY, width: brickWidth, height: brickHeight,
        u: brickX / atlasWidth, v: brickY / atlasHeight,
        uWidth: brickWidth / atlasWidth, 
        vHeight: brickHeight / atlasHeight
    });
    
    // 4. BRICK VARIANTS (different colors) - Row 2
    const brickVariants = [
        { name: 'brick_blue', color: ['#4040d0', '#202080', '#6060ff', '#101060'] },
        { name: 'brick_green', color: ['#40d040', '#208020', '#60ff60', '#106010'] },
        { name: 'brick_yellow', color: ['#d0d040', '#808020', '#ffff60', '#606010'] },
    ];
    
    brickVariants.forEach((variant, index) => {
        const variantX = index * brickWidth;
        const variantY = 32; // Second row
        
        // Brick gradient
        const gradient = ctx.createLinearGradient(variantX, variantY, variantX, variantY + brickHeight);
        gradient.addColorStop(0, variant.color[0]!);
        gradient.addColorStop(1, variant.color[1]!);
        ctx.fillStyle = gradient;
        ctx.fillRect(variantX, variantY, brickWidth, brickHeight);
        
        // Highlights and shadows
        ctx.fillStyle = variant.color[2]!;
        ctx.fillRect(variantX + 1, variantY + 1, brickWidth - 2, 4);
        ctx.fillStyle = variant.color[3]!;
        ctx.fillRect(variantX, variantY + brickHeight - 2, brickWidth, 2);
        
        // Border
        ctx.strokeStyle = variant.color[3]!;
        ctx.lineWidth = 1;
        ctx.strokeRect(variantX + 0.5, variantY + 0.5, brickWidth - 1, brickHeight - 1);
        
        sprites.set(variant.name, {
            name: variant.name,
            x: variantX, y: variantY, width: brickWidth, height: brickHeight,
            u: variantX / atlasWidth, v: variantY / atlasHeight,
            uWidth: brickWidth / atlasWidth, 
            vHeight: brickHeight / atlasHeight
        });
    });
    
    // Create GPU texture from canvas
    const imageData = ctx.getImageData(0, 0, atlasWidth, atlasHeight);
    
    const texture = device.createTexture({
        size: [atlasWidth, atlasHeight, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    device.queue.writeTexture(
        { texture },
        imageData.data,
        { 
            offset: 0,
            bytesPerRow: atlasWidth * 4,
            rowsPerImage: atlasHeight,
        },
        { width: atlasWidth, height: atlasHeight, depthOrArrayLayers: 1 }
    );
    
    return {
        texture,
        sprites,
        atlasWidth,
        atlasHeight,
    };
}