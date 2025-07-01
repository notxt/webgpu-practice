# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a WebGPU practice repository for learning and experimenting with WebGPU technology. The project is set up with TypeScript using the strictest configuration and a minimal Node.js server.

## Project Structure

```
webgpu-practice/
├── app/              # Frontend application files
│   ├── src/         # TypeScript source files (main.ts)
│   ├── dist/        # Compiled JavaScript files (ignored in git)
│   ├── index.html   # Main HTML file
│   └── style.css    # Styles
├── bin/             # Executable development scripts
│   ├── build        # Compile TypeScript once
│   ├── watch        # Compile TypeScript in watch mode
│   ├── serve        # Start HTTP server
│   ├── open-browser # Open browser with Playwright
│   └── dev          # All-in-one development environment
├── log/             # Server logs (ignored in git)
├── tsconfig.json    # TypeScript configuration (extends @tsconfig/strictest)
└── package.json     # Dependencies: TypeScript, @webgpu/types, Playwright
```

## Getting Started

The project is already set up and ready for WebGPU development. To start:

1. **Install dependencies**: `npm install`
2. **Start development**: `./bin/dev`
3. **Open in Chrome**: Browser will open automatically with WebGPU demo

Current implementation: Basic WebGPU initialization that clears the canvas to a blue color.

## WebGPU Key Concepts to Implement

When developing WebGPU examples in this repository, focus on:
- Device and adapter initialization
- Render pipeline setup
- Shader creation (WGSL)
- Buffer management
- Render pass configuration

## Technical Setup

- **TypeScript**: Strictest configuration using `@tsconfig/strictest`
- **Types**: Official `@webgpu/types` for WebGPU API definitions
- **Development**: Live reload with TypeScript watch mode
- **Server**: Node.js ES modules with logging to `log/` directory
- **Browser**: Automated opening with Playwright
- **Standards**: Web-only approach, minimal dependencies
- **Code Style**: Prefer functional programming over object-oriented programming

## Development Commands

The project uses executable scripts in the `bin/` directory:

```bash
./bin/build      # Compile TypeScript once
./bin/watch      # Compile TypeScript in watch mode
./bin/serve      # Start HTTP server
./bin/open-browser  # Open browser with Playwright
./bin/dev        # All-in-one: watch, serve, and open browser
```

For daily development, use:
```bash
./bin/dev        # Starts everything with server logging
```

## Resources

- WebGPU Specification: https://www.w3.org/TR/webgpu/
- WebGPU Samples: https://webgpu.github.io/webgpu-samples/
- WGSL Specification: https://www.w3.org/TR/WGSL/