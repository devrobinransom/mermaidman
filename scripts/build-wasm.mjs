import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const engineDir = join(repoRoot, 'apps', 'web', 'src', 'rust-engine');
const pkgDir = join(engineDir, 'pkg');
const publicDir = join(repoRoot, 'apps', 'web', 'public', 'wasm');
const wasmPack = process.platform === 'win32' ? 'wasm-pack.cmd' : 'wasm-pack';

const result = spawnSync(wasmPack, ['build', '--target', 'web'], {
    cwd: engineDir,
    stdio: 'inherit',
});

if (result.error) {
    console.error(`Failed to launch ${wasmPack}:`, result.error.message);
    process.exit(1);
}

if (result.status !== 0) {
    process.exit(result.status ?? 1);
}

mkdirSync(publicDir, { recursive: true });

for (const name of [
    'mermaidman_engine.js',
    'mermaidman_engine_bg.wasm',
    'mermaidman_engine.d.ts',
]) {
    copyFileSync(join(pkgDir, name), join(publicDir, name));
}

console.log(`Synced Mermaidman WASM assets to ${publicDir}`);
