// Transform uniform buffer
struct Transform {
    // 3x3 transformation matrix in column-major order
    // Each column is padded to vec4 for alignment
    matrix_col0: vec3f,
    _pad0: f32,
    matrix_col1: vec3f,
    _pad1: f32,
    matrix_col2: vec3f,
    _pad2: f32,
    // Sprite color tint
    color: vec3f,
    _pad3: f32,
}

// Sprite UV mapping uniform
struct SpriteUV {
    offset: vec2f,    // UV offset in atlas (u, v)
    size: vec2f,      // UV size in atlas (width, height)
}

@group(0) @binding(0) var<uniform> transform: Transform;
@group(0) @binding(1) var<uniform> spriteUV: SpriteUV;
@group(0) @binding(2) var textureSampler: sampler;
@group(0) @binding(3) var textureAtlas: texture_2d<f32>;

// Vertex input structure
struct VertexInput {
    @location(0) position: vec2f,
    @location(1) texCoord: vec2f,
}

// Vertex output structure
struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) texCoord: vec2f,
    @location(1) color: vec3f,
}

// Vertex shader - applies transform matrix and maps texture coordinates to sprite region
@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    
    // Apply 3x3 transformation matrix
    let col0 = transform.matrix_col0;
    let col1 = transform.matrix_col1;
    let col2 = transform.matrix_col2;
    
    // Transform position: matrix * [x, y, 1]
    let world_pos = vec2f(
        col0.x * input.position.x + col1.x * input.position.y + col2.x,
        col0.y * input.position.x + col1.y * input.position.y + col2.y
    );
    
    output.position = vec4f(world_pos, 0.0, 1.0);
    
    // Map texture coordinates to sprite region in atlas
    // input.texCoord goes from (0,0) to (1,1) for the quad
    // We map it to the sprite's UV region in the atlas
    output.texCoord = spriteUV.offset + input.texCoord * spriteUV.size;
    
    output.color = transform.color;
    return output;
}

// Fragment shader - samples from sprite atlas using mapped coordinates
@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
    let textureColor = textureSample(textureAtlas, textureSampler, input.texCoord);
    
    // Apply color tint to sprite
    let tintedColor = textureColor.rgb * input.color;
    
    return vec4f(tintedColor, textureColor.a);
}