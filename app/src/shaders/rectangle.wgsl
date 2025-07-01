// Vertex input structure
struct VertexInput {
    @location(0) position: vec2f,
    @location(1) color: vec3f,
}

// Vertex output structure (passed to fragment shader)
struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec3f,
}

// Vertex shader - processes each vertex
@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.position = vec4f(input.position, 0.0, 1.0);
    output.color = input.color;
    return output;
}

// Fragment shader - colors each pixel
@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
    return vec4f(input.color, 1.0);
}