import { computed, onMounted, type Ref, ref } from "vue";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const sharedManager = ref<PackageManager | null>(null);

export function usePackageManagerSelection(defaultManager: PackageManager): {
  active: Ref<PackageManager>;
} {
  onMounted(() => {
    if (sharedManager.value === null) {
      sharedManager.value = defaultManager;
    }
  });

  const active = computed({
    get: () => sharedManager.value ?? defaultManager,
    set: (value: PackageManager) => {
      sharedManager.value = value;
    },
  });

  return { active: active as Ref<PackageManager> };
}
