import * as p from "@clack/prompts";
import pc from "picocolors";
import validatePackageName from "validate-npm-package-name";

export type CreateConfluxOptions = {
  name?: string;
  cwd?: string;
};

export async function runCreateConflux(options: CreateConfluxOptions = {}): Promise<number> {
  p.intro(pc.bgCyan(pc.black(" create-conflux ")));

  const name =
    options.name ??
    (await p.text({
      message: "Project name",
      placeholder: "my-conflux-bot",
      validate(value) {
        if (!value) return "Name is required";
        const result = validatePackageName(value);
        if (!result.validForNewPackages) {
          return result.errors?.[0] ?? result.warnings?.[0] ?? "Invalid package name";
        }
      },
    }));

  if (p.isCancel(name)) {
    p.cancel("Cancelled");
    return 1;
  }

  p.log.info(
    `Scaffold stub — would create ${pc.cyan(String(name))} in ${options.cwd ?? process.cwd()}`,
  );
  p.outro(pc.green("Done"));
  return 0;
}
