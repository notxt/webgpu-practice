# WebGPU Learning Plan: Building Breakout

A step-by-step journey through WebGPU fundamentals by creating a classic Breakout game.

## 🎯 Final Goal
Create a fully functional Breakout game featuring:
- Paddle controlled by mouse/keyboard
- Ball physics with realistic bouncing
- Destructible brick grid with different colors/types
- Score system and game states
- Visual effects (particles, shaders)
- Sound integration

## 📚 Learning Path

### Phase 1: Rendering Fundamentals
**Goal**: Master basic WebGPU rendering concepts

#### Step 1: Triangle Rendering
- **Concepts**: Vertices, buffers, render pipelines, shaders
- **Implementation**: Render a single colored triangle
- **Files**: Create `triangle.ts` module
- **WebGPU Skills**: Vertex buffers, basic WGSL shaders, render passes

#### Step 2: Rectangle/Quad Rendering  
- **Concepts**: Index buffers, primitive topology
- **Implementation**: Render rectangle using 4 vertices + indices
- **WebGPU Skills**: Index buffers, different primitive types

#### Step 3: Multiple Shapes
- **Concepts**: Multiple draw calls, uniforms
- **Implementation**: Render paddle, ball, and single brick
- **WebGPU Skills**: Uniform buffers, multiple objects

### Phase 2: Textures and Sprites
**Goal**: Add visual richness with textures

#### Step 4: Textured Paddle
- **Concepts**: Texture loading, texture coordinates, samplers
- **Implementation**: Apply texture to paddle rectangle
- **WebGPU Skills**: Texture creation, binding groups, samplers

#### Step 5: Sprite System
- **Concepts**: Texture atlases, UV mapping
- **Implementation**: Create reusable sprite rendering system
- **WebGPU Skills**: Advanced texture techniques

### Phase 3: Transform and Movement
**Goal**: Bring objects to life with movement

#### Step 6: Transform Matrices
- **Concepts**: Translation, rotation, scaling matrices
- **Implementation**: Move paddle with smooth interpolation
- **WebGPU Skills**: Matrix uniforms, coordinate systems

#### Step 7: Ball Physics
- **Concepts**: Time-based animation, velocity, collision detection
- **Implementation**: Ball bounces off walls and paddle
- **WebGPU Skills**: Dynamic uniform updates, frame timing

### Phase 4: Game Logic
**Goal**: Create actual gameplay

#### Step 8: Brick Grid
- **Concepts**: Instanced rendering, efficient batch drawing
- **Implementation**: Render grid of destructible bricks
- **WebGPU Skills**: Instancing, storage buffers

#### Step 9: Collision System
- **Concepts**: AABB collision, game state management
- **Implementation**: Ball destroys bricks, bounces correctly
- **WebGPU Skills**: CPU-GPU data synchronization

#### Step 10: Game States
- **Concepts**: State machines, UI rendering
- **Implementation**: Menu, playing, game over, score display
- **WebGPU Skills**: Multiple render passes, text rendering

### Phase 5: Polish and Effects
**Goal**: Add visual flair and juice

#### Step 11: Particle Systems
- **Concepts**: GPU particles, compute shaders
- **Implementation**: Particle effects when bricks are destroyed
- **WebGPU Skills**: Compute pipelines, storage textures

#### Step 12: Post-Processing
- **Concepts**: Render to texture, screen-space effects
- **Implementation**: Screen shake, color effects, bloom
- **WebGPU Skills**: Framebuffers, multi-pass rendering

#### Step 13: Advanced Shaders
- **Concepts**: Custom fragment shaders, animated materials
- **Implementation**: Animated brick textures, paddle glow
- **WebGPU Skills**: Advanced WGSL, shader techniques

## 🗂️ Project Structure

```
app/src/
├── main.ts              # Entry point and game loop
├── webgpu/              # Core WebGPU utilities
│   ├── device.ts        # WebGPU device setup
│   ├── pipeline.ts      # Render pipeline helpers
│   ├── buffer.ts        # Buffer management
│   ├── texture.ts       # Texture utilities
│   └── shader.ts        # Shader compilation
├── game/                # Game-specific modules
│   ├── entities/        # Game objects (Paddle, Ball, Brick)
│   ├── systems/         # Game systems (Physics, Collision, Render)
│   ├── states/          # Game states (Menu, Playing, GameOver)
│   └── utils/           # Math, input, helpers
├── shaders/             # WGSL shader files
│   ├── basic.wgsl       # Simple vertex/fragment shaders
│   ├── textured.wgsl    # Texture rendering shaders
│   ├── particles.wgsl   # Particle system shaders
│   └── post.wgsl        # Post-processing shaders
└── assets/              # Game assets
    ├── textures/        # Sprite textures
    └── sounds/          # Audio files
```

## 🎮 Game Features by Phase

| Phase | Features | WebGPU Concepts |
|-------|----------|-----------------|
| 1 | Static shapes | Buffers, pipelines, basic shaders |
| 2 | Textured objects | Textures, samplers, binding groups |
| 3 | Moving paddle & ball | Transforms, uniforms, animation |
| 4 | Brick destruction, scoring | Instancing, state management |
| 5 | Particles, effects | Compute shaders, post-processing |

## 📝 Learning Outcomes

By the end of this project, you'll have hands-on experience with:

### Core WebGPU
- Device and adapter setup
- Buffer creation and management
- Render pipeline configuration
- Shader compilation and binding
- Texture loading and sampling
- Uniform and storage buffers

### Advanced Features  
- Instanced rendering
- Compute shaders
- Multi-pass rendering
- Post-processing effects
- GPU-driven particles

### Game Development
- Game loop architecture
- Entity-component patterns
- Physics simulation
- Collision detection
- State management
- Performance optimization

## 🚀 Getting Started

1. Start with **Step 1: Triangle Rendering**
2. Create each step in a separate git branch for easy comparison
3. Focus on understanding concepts before moving to next step
4. Experiment and modify each implementation
5. Build incrementally - each step adds to the previous

Ready to begin? Let's start with rendering our first triangle! 🎮