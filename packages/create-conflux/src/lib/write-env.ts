import { constants } from "node:fs";
import { access, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ENV_EXAMPLE = "FLUXER_BOT_TOKEN=\n";

export async function writeEnvFiles(targetDir: string, token?: string): Promise<void> {
  const examplePath = join(targetDir, ".env.example");
  try {
    await access(examplePath, constants.F_OK);
  } catch {
    await writeFile(examplePath, ENV_EXAMPLE, "utf8");
  }
  if (token) {
    await writeFile(join(targetDir, ".env"), `FLUXER_BOT_TOKEN=${token}\n`, "utf8");
  }
}
