import { constants } from "node:fs";
import { access, rm } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

import * as p from "@clack/prompts";
import pc from "picocolors";
import validatePackageName from "validate-npm-package-name";

import {
  detectPackageManager,
  packageManagerRunCommand,
} from "./detect-package-manager.js";
import {
  assessOverwriteRisk,
  formatConflictSummary,
  manualInstallationHint,
  requiresOverwriteConfirmation,
} from "./overwrite-risk.js";
import { getDefaultTemplateRoot } from "./paths.js";
import { runGitInit } from "./run-git-init.js";
import { runInstall } from "./run-install.js";
import { scaffoldTemplate } from "./scaffold-template.js";
import { writeEnvFiles } from "./write-env.js";

export type CreateConfluxOptions = {
  name?: string;
  cwd?: string;
};

function validatePackageNameValue(value: string): string | undefined {
  const result = validatePackageName(value);
  if (!result.validForNewPackages) {
    return result.errors?.[0] ?? result.warnings?.[0] ?? "Invalid package name";
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function runCreateConflux(options: CreateConfluxOptions = {}): Promise<number> {
  const baseCwd = options.cwd ?? process.cwd();
  const packageManager = detectPackageManager(baseCwd);
  const templateRoot = getDefaultTemplateRoot();

  p.intro(pc.bgCyan(pc.black(" create-conflux ")));

  const directoryDefault = options.name ? `./${options.name}` : undefined;

  const directoryInput = await p.text({
    message: "Project directory",
    placeholder: "my-conflux-bot",
    defaultValue: directoryDefault,
    validate(value) {
      if (!value?.trim()) return "Directory is required";
    },
  });

  if (p.isCancel(directoryInput)) {
    p.cancel("Cancelled");
    return 1;
  }

  const targetDir = resolve(baseCwd, directoryInput.trim());

  const parentDir = dirname(targetDir);
  if (!(await pathExists(parentDir))) {
    p.log.error(`Parent directory does not exist: ${parentDir}`);
    return 1;
  }

  let packageName = basename(targetDir);
  const derivedValidation = validatePackageNameValue(packageName);
  if (derivedValidation) {
    const nameInput = await p.text({
      message: "Package name",
      placeholder: "my-conflux-bot",
      validate(value) {
        if (!value) return "Name is required";
        return validatePackageNameValue(value);
      },
    });
    if (p.isCancel(nameInput)) {
      p.cancel("Cancelled");
      return 1;
    }
    packageName = nameInput.trim();
  }

  const tokenInput = await p.password({
    message: "Fluxer bot token (optional — press Enter to skip)",
    validate() {
      return undefined;
    },
  });

  if (p.isCancel(tokenInput)) {
    p.cancel("Cancelled");
    return 1;
  }

  const botToken = typeof tokenInput === "string" ? tokenInput.trim() : "";

  const overwriteRisk = await assessOverwriteRisk(targetDir, templateRoot, {
    writeEnv: Boolean(botToken),
  });

  if (requiresOverwriteConfirmation(overwriteRisk)) {
    p.note(formatConflictSummary(overwriteRisk, targetDir), "Existing files");
    const proceed = await p.confirm({
      message: "Overwrite and continue scaffolding this directory?",
      initialValue: false,
    });
    if (p.isCancel(proceed)) {
      p.cancel("Cancelled");
      p.log.info(manualInstallationHint());
      return 1;
    }
    if (!proceed) {
      p.cancel("Cancelled — no files were changed.");
      p.log.info(manualInstallationHint());
      return 1;
    }
  }

  const initGit = await p.confirm({
    message: "Initialize a Git repository?",
    initialValue: true,
  });

  if (p.isCancel(initGit)) {
    p.cancel("Cancelled");
    return 1;
  }

  const runDepsInstall = await p.confirm({
    message: `Install dependencies with ${packageManager}?`,
    initialValue: true,
  });

  if (p.isCancel(runDepsInstall)) {
    p.cancel("Cancelled");
    return 1;
  }

  try {
    if (overwriteRisk.targetExists && overwriteRisk.isNonEmpty) {
      await rm(targetDir, { recursive: true, force: true });
    }

    await p.tasks([
      {
        title: "Copy project template",
        async task() {
          await scaffoldTemplate(targetDir, packageName);
        },
      },
      {
        title: "Configure environment",
        async task() {
          await writeEnvFiles(targetDir, botToken || undefined);
        },
      },
      ...(initGit
        ? [
            {
              title: "Initialize Git repository",
              async task() {
                await runGitInit(targetDir);
              },
            },
          ]
        : []),
      ...(runDepsInstall
        ? [
            {
              title: `Install dependencies (${packageManager})`,
              async task() {
                await runInstall(packageManager, targetDir);
              },
            },
          ]
        : []),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    p.log.error(message);
    return 1;
  }

  const relativeTarget =
    targetDir.startsWith(baseCwd + (process.platform === "win32" ? "\\" : "/")) ||
    targetDir === baseCwd
      ? targetDir.slice(baseCwd.length).replace(/^[/\\]/, "") || "."
      : targetDir;

  const nextSteps = [
    `cd ${relativeTarget}`,
    ...(botToken ? [] : ["Set FLUXER_BOT_TOKEN in .env (see .env.example)"]),
    packageManagerRunCommand(packageManager),
  ];

  p.outro(`${pc.green("Project created!")}\n\n${nextSteps.map((step) => `  ${pc.cyan(step)}`).join("\n")}`);
  return 0;
}
