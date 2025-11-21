
// Helper class to load and run Origami WASM
export class OrigamiRuntime {
    private static instance: OrigamiRuntime;
    private wasmModule: WebAssembly.WebAssemblyInstantiatedSource | null = null;
    private go: any; // Go WASM runtime instance

    private constructor() {
        // Initialize Go WASM runtime
        if (!(window as any).Go) {
             throw new Error("Go WASM runtime not loaded. Please include wasm_exec.js");
        }
        this.go = new (window as any).Go();
    }

    public static getInstance(): OrigamiRuntime {
        if (!OrigamiRuntime.instance) {
            OrigamiRuntime.instance = new OrigamiRuntime();
        }
        return OrigamiRuntime.instance;
    }

    public async load(wasmUrl: string) {
        if (this.wasmModule) return;

        try {
            const response = await fetch(wasmUrl);
            const buffer = await response.arrayBuffer();
            const result = await WebAssembly.instantiate(buffer, this.go.importObject);
            this.wasmModule = result;
            
            // Run the WASM instance
            // Note: In a real Go WASM app, 'go.run' might block until the program exits.
            // For an interpreter, we usually expect it to register callbacks on 'window'
            // and then stay alive, or run once. 
            // Assuming Origami exposes a global function or waits for input.
            this.go.run(this.wasmModule.instance);
            
        } catch (e) {
            console.error("Failed to load Origami WASM:", e);
            throw e;
        }
    }

    public async runCode(code: string): Promise<string> {
        // This assumes the WASM exposes a function `origamiRun(code)` on window
        // after being initialized.
        if ((window as any).origamiRun) {
            try {
                const output = await (window as any).origamiRun(code);
                return output;
            } catch (e: any) {
                return `Error: ${e.message}`;
            }
        }
        
        // Fallback if WASM isn't fully integrated yet
        console.warn("WASM function 'origamiRun' not found. Is WASM loaded?");
        return "WASM runtime not ready.";
    }
}

