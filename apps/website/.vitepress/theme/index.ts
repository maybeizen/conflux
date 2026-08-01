/* eslint-disable simple-import-sort/imports */
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import type { App } from "vue";

import "./custom.css";

import PackageManagerSwitcher from "./components/PackageManagerSwitcher.vue";
/* eslint-enable simple-import-sort/imports */
const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    app.component("PackageManagerSwitcher", PackageManagerSwitcher);
  },
};

export default theme;
