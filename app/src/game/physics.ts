// Physics types and functions for 2D game objects

// 2D Vector type
export type Vec2 = {
    x: number;
    y: number;
};

// Physics body with position and velocity
export type PhysicsBody = {
    position: Vec2;
    velocity: Vec2;
    radius?: number;  // For circular collision detection
};

// Rectangle for AABB collision detection
export type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
};

// Create a new 2D vector
export function vec2(x: number, y: number): Vec2 {
    return { x, y };
}

// Add two vectors
export function vec2Add(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y };
}

// Scale a vector
export function vec2Scale(v: Vec2, scale: number): Vec2 {
    return { x: v.x * scale, y: v.y * scale };
}

// Get vector length
export function vec2Length(v: Vec2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

// Normalize a vector
export function vec2Normalize(v: Vec2): Vec2 {
    const len = vec2Length(v);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
}

// Update physics body position based on velocity and delta time
export function updatePhysicsBody(body: PhysicsBody, deltaTime: number): void {
    body.position.x += body.velocity.x * deltaTime;
    body.position.y += body.velocity.y * deltaTime;
}

// Check collision between circle and rectangle (for ball vs paddle/brick)
export function circleRectCollision(
    circlePos: Vec2,
    circleRadius: number,
    rect: Rectangle
): boolean {
    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(circlePos.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circlePos.y, rect.y + rect.height));
    
    // Calculate distance between circle center and closest point
    const distX = circlePos.x - closestX;
    const distY = circlePos.y - closestY;
    const distSquared = distX * distX + distY * distY;
    
    // Check if distance is less than circle radius
    return distSquared < circleRadius * circleRadius;
}

// Calculate bounce direction for ball hitting a rectangle
export function calculateBounceDirection(
    ballPos: Vec2,
    ballVel: Vec2,
    rect: Rectangle
): Vec2 {
    // Determine which side of the rectangle was hit
    const ballCenterX = ballPos.x;
    const ballCenterY = ballPos.y;
    const rectCenterX = rect.x + rect.width / 2;
    const rectCenterY = rect.y + rect.height / 2;
    
    // Calculate relative position
    const relX = ballCenterX - rectCenterX;
    const relY = ballCenterY - rectCenterY;
    
    // Normalize to get collision normal
    const absRelX = Math.abs(relX);
    const absRelY = Math.abs(relY);
    
    // Determine if collision was horizontal or vertical
    if (absRelX / rect.width > absRelY / rect.height) {
        // Horizontal collision (left/right side)
        return { x: -ballVel.x, y: ballVel.y };
    } else {
        // Vertical collision (top/bottom side)
        return { x: ballVel.x, y: -ballVel.y };
    }
}

// Reflect velocity vector off a normal (for more accurate bouncing)
export function reflectVelocity(velocity: Vec2, normal: Vec2): Vec2 {
    // v' = v - 2 * (v · n) * n
    const dot = velocity.x * normal.x + velocity.y * normal.y;
    return {
        x: velocity.x - 2 * dot * normal.x,
        y: velocity.y - 2 * dot * normal.y
    };
}

// Check if ball is out of bounds (game over condition)
export function isBallOutOfBounds(ballY: number, bottomBoundary: number): boolean {
    return ballY < bottomBoundary;
}

// Clamp a value between min and max
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

// Apply friction to velocity
export function applyFriction(velocity: Vec2, friction: number, deltaTime: number): Vec2 {
    const frictionFactor = Math.pow(friction, deltaTime * 60); // Normalized to 60fps
    return vec2Scale(velocity, frictionFactor);
}

// Calculate paddle hit position (-1 to 1, where 0 is center)
export function getPaddleHitPosition(ballX: number, paddleX: number, paddleWidth: number): number {
    const paddleCenter = paddleX;
    const relativeX = ballX - paddleCenter;
    return clamp(relativeX / (paddleWidth / 2), -1, 1);
}

// Calculate ball velocity after paddle hit (adds spin based on hit position)
export function calculatePaddleBounce(
    ballVel: Vec2,
    hitPosition: number,  // -1 to 1
    speedMultiplier: number = 1.0
): Vec2 {
    // Base angle is 45 degrees, adjusted by hit position
    const maxAngle = Math.PI / 3; // 60 degrees max
    const angle = hitPosition * maxAngle;
    
    // Calculate new velocity maintaining speed
    const speed = vec2Length(ballVel) * speedMultiplier;
    return {
        x: Math.sin(angle) * speed,
        y: Math.abs(Math.cos(angle)) * speed // Always bounce up
    };
}