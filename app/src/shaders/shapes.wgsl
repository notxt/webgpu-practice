// Transform uniform buffer
struct Transform {
    position: vec2f,
    scale: vec2f,
    color: vec3f,
}

@group(0) @binding(0) var<uniform> transform: Transform;

// Vertex input structure
struct VertexInput {
    @location(0) position: vec2f,
}

// Vertex output structure
struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec3f,
}

// Vertex shader - applies transform to base shape
@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    
    // Apply scale and translation
    let scaled_pos = input.position * transform.scale;
    let world_pos = scaled_pos + transform.position;
    
    output.position = vec4f(world_pos, 0.0, 1.0);
    output.color = transform.color;
    return output;
}

// Fragment shader - uses color from uniform
@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
    return vec4f(input.color, 1.0);
}