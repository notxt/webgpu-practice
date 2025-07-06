// Game state management for breakout game

import { Vec2, PhysicsBody, Rectangle } from './physics.js';

// Brick state
export type Brick = {
    id: number;
    position: Vec2;
    width: number;
    height: number;
    color: string;  // Sprite name like 'brick_blue'
    health: number;
    isDestroyed: boolean;
};

// Game state
export type GameState = {
    // Ball state
    ball: PhysicsBody & {
        radius: number;
    };
    
    // Paddle state
    paddle: {
        position: Vec2;
        width: number;
        height: number;
        velocity: number;
    };
    
    // Bricks
    bricks: Brick[];
    
    // Game status
    score: number;
    lives: number;
    isGameOver: boolean;
    isPaused: boolean;
};

// Create initial game state
export function createGameState(): GameState {
    return {
        ball: {
            position: { x: 0, y: -0.3 },
            velocity: { x: 0.3, y: 0.4 },
            radius: 0.03
        },
        paddle: {
            position: { x: 0, y: -0.6 },
            width: 0.3,
            height: 0.1,
            velocity: 0
        },
        bricks: createBrickLayout(),
        score: 0,
        lives: 3,
        isGameOver: false,
        isPaused: false
    };
}

// Create brick layout
function createBrickLayout(): Brick[] {
    const bricks: Brick[] = [];
    const rows = 5;
    const cols = 8;
    const brickWidth = 0.15;
    const brickHeight = 0.08;
    const spacing = 0.02;
    const startX = -0.7;
    const startY = 0.6;
    
    const colors = ['brick_yellow', 'brick_yellow', 'brick_green', 'brick_green', 'brick_blue'];
    const healths = [1, 1, 1, 1, 2]; // Blue bricks take 2 hits
    
    let id = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = startX + col * (brickWidth + spacing);
            const y = startY - row * (brickHeight + spacing);
            
            bricks.push({
                id: id++,
                position: { x, y },
                width: brickWidth,
                height: brickHeight,
                color: colors[row]!,
                health: healths[row]!,
                isDestroyed: false
            });
        }
    }
    
    return bricks;
}

// Get rectangle bounds for paddle
export function getPaddleRect(paddle: GameState['paddle']): Rectangle {
    return {
        x: paddle.position.x - paddle.width / 2,
        y: paddle.position.y - paddle.height / 2,
        width: paddle.width,
        height: paddle.height
    };
}

// Get rectangle bounds for brick
export function getBrickRect(brick: Brick): Rectangle {
    return {
        x: brick.position.x - brick.width / 2,
        y: brick.position.y - brick.height / 2,
        width: brick.width,
        height: brick.height
    };
}

// Damage a brick
export function damageBrick(brick: Brick): void {
    brick.health--;
    if (brick.health <= 0) {
        brick.isDestroyed = true;
    }
    // Change color for damaged blue bricks
    if (brick.health === 1 && brick.color === 'brick_blue') {
        brick.color = 'brick_green';
    }
}

// Reset ball to starting position
export function resetBall(state: GameState): void {
    state.ball.position = { x: 0, y: -0.3 };
    state.ball.velocity = { 
        x: (Math.random() - 0.5) * 0.6, // Random horizontal direction
        y: 0.4 
    };
}

// Check if all bricks are destroyed (victory condition)
export function areAllBricksDestroyed(state: GameState): boolean {
    return state.bricks.every(brick => brick.isDestroyed);
}

// Update score
export function addScore(state: GameState, points: number): void {
    state.score += points;
}