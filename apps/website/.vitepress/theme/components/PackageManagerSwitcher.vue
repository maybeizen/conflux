<script setup lang="ts">
import { withBase } from "vitepress/client";
import { computed } from "vue";

import { type PackageManager, usePackageManagerSelection } from "../usePackageManager";

type Manager = PackageManager;

const props = withDefaults(
  defineProps<{
    npm: string;
    pnpm: string;
    yarn: string;
    bun: string;
    defaultManager?: Manager;
  }>(),
  { defaultManager: "pnpm" },
);

function formatCommand(command: string): string {
  return command.replace(/\\n/g, "\n");
}

const managers = computed(() => [
  {
    id: "npm" as const,
    label: "npm",
    command: formatCommand(props.npm),
    icon: withBase("/icons/npm.svg"),
  },
  {
    id: "pnpm" as const,
    label: "pnpm",
    command: formatCommand(props.pnpm),
    icon: withBase("/icons/pnpm.svg"),
  },
  {
    id: "yarn" as const,
    label: "yarn",
    command: formatCommand(props.yarn),
    icon: withBase("/icons/yarn.svg"),
  },
  {
    id: "bun" as const,
    label: "bun",
    command: formatCommand(props.bun),
    icon: withBase("/icons/bun.svg"),
  },
]);

const rootId = computed(() => {
  const key = managers.value.map((m) => `${m.id}:${m.command}`).join("|");
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return `pm-${Math.abs(hash).toString(16).slice(0, 10)}`;
});

const { active } = usePackageManagerSelection(props.defaultManager);

function selectManager(id: Manager) {
  active.value = id;
}
</script>

<template>
  <div class="pm-switcher" :data-pm-root="rootId">
    <div class="pm-tabs" role="tablist" aria-label="Package manager">
      <button
        v-for="manager in managers"
        :key="manager.id"
        type="button"
        role="tab"
        class="pm-tab"
        :class="{ 'pm-tab-active': active === manager.id }"
        :data-pm="manager.id"
        :aria-selected="active === manager.id"
        @click="selectManager(manager.id)"
      >
        <span class="pm-tab-icon" aria-hidden="true">
          <img :src="manager.icon" alt="" />
        </span>
        <span class="pm-tab-label">{{ manager.label }}</span>
      </button>
    </div>
    <pre
      v-for="manager in managers"
      v-show="active === manager.id"
      :key="`${manager.id}-panel`"
      class="pm-panel"
      role="tabpanel"
    ><code>{{ manager.command }}</code></pre>
  </div>
</template>
