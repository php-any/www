
import { Project } from '../types';
import { OrigamiRuntime } from './origamiRuntime';

// Flag to toggle between Mock and Real WASM runtime
// In a real scenario, you might check for a query param or config
const USE_WASM = true;

export const executeProject = async (project: Project): Promise<string[]> => {
  const logs: string[] = [];
  const entryFile = Object.values(project.files).find(f => f.isEntry);
  if (!entryFile) return ["Error: No entry point found in project."];
  
  logs.push(`> origami run ${entryFile.name}`);

  if (USE_WASM) {
      try {
          const runtime = OrigamiRuntime.getInstance();
          
          // Ensure WASM is loaded (this is idempotent)
          await runtime.load('/wasm/origami.wasm');
          
          logs.push("Compiling to WASM... [Ok]");
          logs.push("Running...");
          
          // Execute code via WASM
          const output = await runtime.runCode(entryFile.content);
          
          // Split output into lines for the console
          const lines = output.split('\n');
          logs.push(...lines);
          
      } catch (e: any) {
          logs.push(`Runtime Error: ${e.message}`);
          logs.push("Falling back to mock runtime...");
          // Fallback to mock if WASM fails (e.g. file not found in dev)
          return executeMock(project, logs);
      }
  } else {
      return executeMock(project, logs);
  }

  return logs;
};

const executeMock = (project: Project, initialLogs: string[]): string[] => {
  const logs = [...initialLogs];
  const entryFile = Object.values(project.files).find(f => f.isEntry);
  if (!entryFile) return logs;

  const code = entryFile.content;
  
  // Simple heuristic mock output based on keywords in the code
  if (code.includes('http.Server') || code.includes('http::listen')) {
      logs.push("[INFO] Starting server on port 8080...");
      logs.push("[INFO] Request received: /api/v1/status");
      logs.push("[INFO] Request received: /favicon.ico");
      logs.push("Server running. Press Ctrl+C to stop.");
  } else if (code.includes('webview::create')) {
      logs.push("[GUI] Initializing WebView window...");
      logs.push("[GUI] Window 'Origami App' created (800x600)");
      logs.push("[GUI] Navigate: data:text/html,...");
      logs.push("[GUI] Bound function: greet");
      logs.push("[GUI] Waiting for frontend events...");
  } else if (code.includes('websocket::listen')) {
      logs.push("[WS] Listening on :8080");
      logs.push("[WS] New connection from 127.0.0.1:54321");
      logs.push("[WS] Spawning handler goroutine...");
      logs.push("[WS] Connection active.");
  } else if (code.includes('Utils::deploy') || (code.includes('std/os') && code.includes('deploy'))) {
      // CLI Tool Output
      logs.push("=== Origami CLI v1.0 ===");
      logs.push("");
      logs.push("Executing command: deploy");
      logs.push("[*] Starting deployment to: production");
      logs.push("    > Step 1/3: Processing assets...");
      logs.push("    > Step 2/3: Processing assets...");
      logs.push("    > Step 3/3: Processing assets...");
      logs.push("[+] Deployment successful!");
      logs.push("");
      logs.push("Program exited with code 0.");
  } else {
      // Generic fallback execution
      const lines = code.split('\n');
      lines.forEach(line => {
          // Very basic mock interpreter for echo/print
          const echoMatch = line.match(/echo\s+"(.+)"/) || line.match(/echo\s+(.+);/);
          if (echoMatch) {
             let content = echoMatch[1].replace(';', '').trim();
             // Remove quotes if present
             if (content.startsWith('"') && content.endsWith('"')) {
                 content = content.substring(1, content.length - 1);
             }
             logs.push(content);
          }
      });
      
      if (logs.length === 3) { // Only build logs exist
          logs.push("Program exited with code 0.");
      }
  }
  
  return logs;
}
