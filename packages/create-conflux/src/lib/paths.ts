import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function getDefaultTemplateRoot(): string {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(moduleDir, "../templates/default"),
    join(moduleDir, "../../templates/default"),
  ];

  // #region agent log
  fetch("http://127.0.0.1:7766/ingest/00f283e3-cd39-4b1f-ad98-5ce12176e711", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e03785" },
    body: JSON.stringify({
      sessionId: "e03785",
      runId: "post-fix",
      hypothesisId: "H1",
      location: "paths.ts:getDefaultTemplateRoot",
      message: "template path candidates",
      data: { moduleDir, candidates, exists: candidates.map((c) => existsSync(c)) },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      // #region agent log
      fetch("http://127.0.0.1:7766/ingest/00f283e3-cd39-4b1f-ad98-5ce12176e711", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e03785" },
        body: JSON.stringify({
          sessionId: "e03785",
          runId: "post-fix",
          hypothesisId: "H1",
          location: "paths.ts:getDefaultTemplateRoot",
          message: "template root selected",
          data: { selected: candidate },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return candidate;
    }
  }

  throw new Error(
    `Conflux template directory not found. Looked for:\n${candidates.map((c) => `  - ${c}`).join("\n")}`,
  );
}
