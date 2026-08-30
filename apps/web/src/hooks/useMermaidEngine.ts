import { useEffect, useState } from 'react';

export type MermaidParsedNode = {
  id: string;
  label?: string;
  x?: number;
  y?: number;
  uid?: string;
  shape?: string;
  meta?: Record<string, unknown>;
};

export type MermaidParsedEdge = {
  source: string;
  target: string;
  label?: string;
  eid?: string;
  line?: string;
  head_end?: string;
  head_start?: string;
  length?: number;
  meta?: Record<string, unknown>;
};

export type MermaidParseResult = {
  clean_code?: string;
  nodes: MermaidParsedNode[];
  edges: MermaidParsedEdge[];
};

type ParseMermaidman = (input: string) => MermaidParseResult;
type UpdateMermaidmanNode = (input: string, nodeId: string, x: number, y: number) => string;

type MermaidWasmModule = {
  default: (input?: { module_or_path?: string }) => Promise<unknown>;
  parse_mermaidman: ParseMermaidman;
  update_mermaidman_node: UpdateMermaidmanNode;
};

type EngineFunctions = {
  parse_mermaidman: ParseMermaidman;
  update_mermaidman_node: UpdateMermaidmanNode;
};

const parserNotReady: ParseMermaidman = () => {
  throw new Error('Mermaidman WASM parser is not ready');
};

const updaterNotReady: UpdateMermaidmanNode = () => {
  throw new Error('Mermaidman WASM updater is not ready');
};

export function useMermaidEngine() {
  const [isReady, setIsReady] = useState(false);
  const [engineFunctions, setEngineFunctions] = useState<EngineFunctions | null>(null);

  useEffect(() => {
    async function initWasm() {
      try {
        // Keep the import path dynamic so TypeScript/Next do not try to bundle
        // the wasm-pack wrapper. The file is served from public/wasm at runtime.
        const wasmAssetUrl = '/wasm/mermaidman_engine.js';
        const wasmModule = (await import(
          /* webpackIgnore: true */ wasmAssetUrl
        )) as MermaidWasmModule;
        const init = wasmModule.default;

        await init({ module_or_path: '/wasm/mermaidman_engine_bg.wasm' });

        setEngineFunctions({
          parse_mermaidman: wasmModule.parse_mermaidman,
          update_mermaidman_node: wasmModule.update_mermaidman_node,
        });

        console.log('Rust Engine Loaded via Full Asset Pattern');
        setIsReady(true);
      } catch (err) {
        console.error('Failed to load Rust Engine from public/wasm:', err);
      }
    }

    void initWasm();
  }, []);

  return {
    isReady,
    parse_mermaidman: engineFunctions?.parse_mermaidman ?? parserNotReady,
    update_mermaidman_node: engineFunctions?.update_mermaidman_node ?? updaterNotReady,
  };
}
