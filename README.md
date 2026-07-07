# Cen Print App

A clean, production-ready Electron desktop application starting template.

## Tech Stack
*   **Electron**: Desktop application framework
*   **React (v18)**: UI Library
*   **Vite**: Build tool and dev server
*   **TypeScript**: Type-safe JavaScript
*   **Tailwind CSS**: Utility-first CSS framework
*   **electron-builder**: Packaging and distribution

## Project Architecture

The project is structured with a strict separation of concerns, adhering to Electron security best practices:

*   **`src/main/`**: The Electron Main Process. Handles native desktop interactions, window management, and lifecycle events. It runs in a full Node.js environment.
*   **`src/preload/`**: The Preload Scripts. Runs before the renderer process starts. Used to safely bridge APIs (`contextBridge`) from the Main Process to the Renderer Process (Context Isolation).
*   **`src/renderer/`**: The Renderer Process. This is your React frontend application, bundled by Vite. It runs in a Chromium sandbox with Node.js integration disabled (`nodeIntegration: false`) for security.

## Folder Structure

```
src/
├── main/                 # Electron main process entry
│   └── index.ts          
├── preload/              # Secure IPC bridge
│   └── index.ts          
└── renderer/             # React App (Frontend)
    ├── index.html        # HTML entry point
    └── src/
        ├── assets/       # Static assets (images, icons)
        ├── components/   # Reusable UI components
        ├── layouts/      # Page layout wrappers
        ├── pages/        # Route components/views
        ├── hooks/        # Custom React hooks
        ├── services/     # API/External service integrations
        ├── store/        # State management logic
        ├── styles/       # Global CSS (Tailwind)
        ├── types/        # TypeScript interfaces/types
        ├── utils/        # Helper functions
        ├── App.tsx       # Root component
        └── main.tsx      # React DOM entry
```

## Security Posture

*   **Node Integration Disabled**: `nodeIntegration: false` ensures malicious scripts in the renderer cannot access the underlying operating system.
*   **Context Isolation**: `contextIsolation: true` is enabled to securely expose only necessary native APIs through the `contextBridge`.
*   **No Remote Module**: The deprecated and unsafe `remote` module is strictly avoided.

## Development Workflow

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    Starts the Vite development server for the renderer, compiles the main/preload scripts, and launches the Electron application with Hot Module Replacement (HMR).
    ```bash
    npm run dev
    ```

3.  **Code Quality**:
    Run ESLint to catch syntax and logic errors, and Prettier to format the codebase.
    ```bash
    npm run lint
    npm run format
    ```

## Build Process

To compile the application for production without packaging it:

```bash
npm run build
```
This command runs `tsc` to type-check, and then `vite build` to bundle the Main, Preload, and Renderer processes into the `dist` and `dist-electron` directories.

## Packaging Process

To package the application into a distributable format (e.g., `.dmg`, `.exe`, `.zip`) for your current OS:

```bash
npm run dist
```
This uses `electron-builder` to package the compiled assets into native installers based on the configuration in `package.json`.

*   **Windows**: Outputs NSIS installer and portable executable.
*   **macOS**: Outputs DMG and ZIP archive.
