// 3x3 Matrix operations for 2D transforms
// Using column-major order for WebGPU compatibility

export type Mat3 = Float32Array;

// Create identity matrix
export function mat3Create(): Mat3 {
    const m = new Float32Array(12); // 3x3 matrix + padding for alignment
    // Identity matrix in column-major order
    m[0] = 1; m[1] = 0; m[2] = 0; // Column 0
    m[4] = 0; m[5] = 1; m[6] = 0; // Column 1 (skip padding)
    m[8] = 0; m[9] = 0; m[10] = 1; // Column 2 (skip padding)
    return m;
}

// Create translation matrix
export function mat3FromTranslation(x: number, y: number): Mat3 {
    const m = mat3Create();
    m[8] = x;  // Translation X in column 2
    m[9] = y;  // Translation Y in column 2
    return m;
}

// Create scale matrix
export function mat3FromScale(x: number, y: number): Mat3 {
    const m = mat3Create();
    m[0] = x;  // Scale X
    m[5] = y;  // Scale Y
    return m;
}

// Create rotation matrix (angle in radians)
export function mat3FromRotation(angle: number): Mat3 {
    const m = mat3Create();
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    
    m[0] = c;  m[1] = s;   // Column 0
    m[4] = -s; m[5] = c;   // Column 1
    return m;
}

// Multiply two matrices: result = a * b
export function mat3Multiply(a: Mat3, b: Mat3): Mat3 {
    const m = mat3Create();
    
    // Column 0
    m[0] = a[0]! * b[0]! + a[4]! * b[1]! + a[8]! * b[2]!;
    m[1] = a[1]! * b[0]! + a[5]! * b[1]! + a[9]! * b[2]!;
    m[2] = a[2]! * b[0]! + a[6]! * b[1]! + a[10]! * b[2]!;
    
    // Column 1 (index 4-7 with padding)
    m[4] = a[0]! * b[4]! + a[4]! * b[5]! + a[8]! * b[6]!;
    m[5] = a[1]! * b[4]! + a[5]! * b[5]! + a[9]! * b[6]!;
    m[6] = a[2]! * b[4]! + a[6]! * b[5]! + a[10]! * b[6]!;
    
    // Column 2 (index 8-11 with padding)
    m[8] = a[0]! * b[8]! + a[4]! * b[9]! + a[8]! * b[10]!;
    m[9] = a[1]! * b[8]! + a[5]! * b[9]! + a[9]! * b[10]!;
    m[10] = a[2]! * b[8]! + a[6]! * b[9]! + a[10]! * b[10]!;
    
    return m;
}

// Create transform matrix from position, rotation, and scale
export function mat3FromTransform(
    x: number, 
    y: number, 
    rotation: number, 
    scaleX: number, 
    scaleY: number
): Mat3 {
    // Order: Scale -> Rotate -> Translate (SRT)
    const scale = mat3FromScale(scaleX, scaleY);
    const rotate = mat3FromRotation(rotation);
    const translate = mat3FromTranslation(x, y);
    
    // Combine: T * R * S
    const rotScale = mat3Multiply(rotate, scale);
    return mat3Multiply(translate, rotScale);
}

// Transform a 2D point by matrix
export function mat3TransformPoint(
    m: Mat3, 
    x: number, 
    y: number
): [number, number] {
    const outX = m[0]! * x + m[4]! * y + m[8]!;
    const outY = m[1]! * x + m[5]! * y + m[9]!;
    return [outX, outY];
}