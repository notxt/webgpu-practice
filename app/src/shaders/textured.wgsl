// Transform uniform buffer
struct Transform {
    position: vec2f,
    scale: vec2f,
    color: vec3f,
}

@group(0) @binding(0) var<uniform> transform: Transform;
@group(0) @binding(1) var textureSampler: sampler;
@group(0) @binding(2) var textureData: texture_2d<f32>;

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

// Vertex shader - applies transform and passes texture coordinates
@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    
    // Apply scale and translation
    let scaled_pos = input.position * transform.scale;
    let world_pos = scaled_pos + transform.position;
    
    output.position = vec4f(world_pos, 0.0, 1.0);
    output.texCoord = input.texCoord;
    output.color = transform.color;
    return output;
}

// Fragment shader - samples texture and applies color tint
@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
    let textureColor = textureSample(textureData, textureSampler, input.texCoord);
    
    // Apply color tint to texture
    let tintedColor = textureColor.rgb * input.color;
    
    return vec4f(tintedColor, textureColor.a);
}