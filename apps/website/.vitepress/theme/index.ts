import "./custom.css";

import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import type { App } from "vue";

import PackageManagerSwitcher from "./components/PackageManagerSwitcher.vue";

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    app.component("PackageManagerSwitcher", PackageManagerSwitcher);
  },
};

export default theme;
