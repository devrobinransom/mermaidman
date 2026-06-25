const net = require("net");
const { spawn } = require("child_process");

const args = process.argv.slice(2);

const getArgValue = (flag) => {
  const exactIndex = args.indexOf(flag);
  if (exactIndex !== -1 && args[exactIndex + 1]) {
    return args[exactIndex + 1];
  }
  const prefixed = args.find((arg) => arg.startsWith(`${flag}=`));
  return prefixed ? prefixed.slice(flag.length + 1) : undefined;
};

const basePort = Number(
  process.env.PORT || getArgValue("--port") || getArgValue("-p") || 3000
);
const maxPort = Number(getArgValue("--max") || basePort + 20);
const host = getArgValue("--host") || getArgValue("-H") || "127.0.0.1";

const isPortAvailable = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen({ port, host }, () => {
      server.close(() => resolve(true));
    });
  });

const findOpenPort = async () => {
  for (let port = basePort; port <= maxPort; port += 1) {
    // eslint-disable-next-line no-await-in-loop
    const available = await isPortAvailable(port);
    if (available) return port;
  }
  return null;
};

const resolveNextBin = () => {
  try {
    return require.resolve("next/dist/bin/next", { paths: [process.cwd()] });
  } catch {
    return null;
  }
};

const run = async () => {
  if (!Number.isFinite(basePort) || !Number.isFinite(maxPort)) {
    console.error("Invalid port range. Use --port and optionally --max.");
    process.exit(1);
  }
  if (maxPort < basePort) {
    console.error("Invalid port range. --max must be >= --port.");
    process.exit(1);
  }

  const port = await findOpenPort();
  if (!port) {
    console.error(`No available port found between ${basePort} and ${maxPort}.`);
    process.exit(1);
  }

  if (port !== basePort) {
    console.log(`Port ${basePort} is busy. Using ${port} instead.`);
  }

  const nextBin = resolveNextBin();
  const nextArgs = ["dev", "-p", String(port)];
  if (host) {
    nextArgs.push("-H", host);
  }

  const command = nextBin ? process.execPath : "npx";
  const commandArgs = nextBin ? [nextBin, ...nextArgs] : ["next", ...nextArgs];

  const child = spawn(command, commandArgs, {
    stdio: "inherit",
    env: { ...process.env, PORT: String(port) },
  });

  child.on("close", (code) => process.exit(code ?? 0));
};

run().catch((err) => {
  console.error("Failed to start dev server:", err);
  process.exit(1);
});
