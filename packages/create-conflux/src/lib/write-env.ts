import { constants } from "node:fs";
import { access, chmod, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ENV_EXAMPLE = "FLUXER_BOT_TOKEN=\n";

function quoteEnvValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export async function writeEnvFiles(targetDir: string, token?: string): Promise<void> {
  const examplePath = join(targetDir, ".env.example");
  try {
    await access(examplePath, constants.F_OK);
  } catch {
    await writeFile(examplePath, ENV_EXAMPLE, "utf8");
  }
  if (!token) {
    return;
  }
  if (/[\r\n\0]/.test(token)) {
    throw new Error("Bot token contains invalid characters");
  }
  const envPath = join(targetDir, ".env");
  await writeFile(envPath, `FLUXER_BOT_TOKEN=${quoteEnvValue(token)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await chmod(envPath, 0o600);
}
