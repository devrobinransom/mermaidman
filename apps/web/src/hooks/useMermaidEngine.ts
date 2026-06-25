import { useEffect, useState } from 'react';

export function useMermaidEngine() {
  const [isReady, setIsReady] = useState(false);
  const [engineFunctions, setEngineFunctions] = useState<any>(null);

  useEffect(() => {
    async function initWasm() {
      try {
        // Load the JS wrapper from the public directory at runtime
        // This bypasses Turbopack/Webpack resolution entirely
        // @ts-ignore
        const wasmModule = await import(/* webpackIgnore: true */ '/wasm/mermaidman_engine.js');
        const init = wasmModule.default;

        // Initialize with the binary path (new-style init object avoids deprecation warnings)
        await init({ module_or_path: '/wasm/mermaidman_engine_bg.wasm' });

        setEngineFunctions({
          parse_mermaidman: wasmModule.parse_mermaidman,
          update_mermaidman_node: wasmModule.update_mermaidman_node,
        });

        console.log("Rust Engine Loaded via Full Asset Pattern");
        setIsReady(true);
      } catch (err) {
        console.error("Failed to load Rust Engine from public/wasm:", err);
      }
    }

    initWasm();
  }, []);

  return {
    isReady,
    parse_mermaidman: engineFunctions?.parse_mermaidman,
    update_mermaidman_node: engineFunctions?.update_mermaidman_node
  };
}
