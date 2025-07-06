// Input handling for game controls
// Functional approach for keyboard input state

export type InputState = {
    keys: Set<string>;
    mouseX: number;
    mouseY: number;
};

// Create initial input state
export function createInputState(): InputState {
    return {
        keys: new Set(),
        mouseX: 0,
        mouseY: 0,
    };
}

// Setup input event listeners
export function setupInput(canvas: HTMLCanvasElement, state: InputState): () => void {
    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
        state.keys.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        state.keys.delete(e.code);
    };

    // Mouse handler
    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        // Convert to normalized device coordinates (-1 to 1)
        state.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        state.mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    // Return cleanup function
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        canvas.removeEventListener('mousemove', handleMouseMove);
    };
}

// Query functions
export function isKeyPressed(state: InputState, keyCode: string): boolean {
    return state.keys.has(keyCode);
}

export function getMousePosition(state: InputState): [number, number] {
    return [state.mouseX, state.mouseY];
}