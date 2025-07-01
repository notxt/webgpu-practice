// Vertex shader
@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
    // Create triangle vertices directly in the shader
    let positions = array<vec2f, 3>(
        vec2f( 0.0,  0.5),  // Top vertex
        vec2f(-0.5, -0.5),  // Bottom left
        vec2f( 0.5, -0.5)   // Bottom right
    );
    
    return vec4f(positions[vertexIndex], 0.0, 1.0);
}

// Fragment shader
@fragment
fn fs_main() -> @location(0) vec4f {
    // Return a nice blue color
    return vec4f(0.2, 0.4, 1.0, 1.0);
}