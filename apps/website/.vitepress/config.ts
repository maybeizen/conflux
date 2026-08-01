import type { DefaultTheme } from "vitepress";
import { defineConfig } from "vitepress";

import apiSidebarGrouped from "./data/api-sidebar-grouped.json";

type SidebarEntry = { title: string; href: string };
type ApiSidebarGrouped = {
  groups: { id: string; title: string; items: SidebarEntry[] }[];
};

const apiGroups = (apiSidebarGrouped as ApiSidebarGrouped).groups;

function apiSidebarItems(): DefaultTheme.SidebarItem[] {
  return apiGroups
    .filter((group) => group.items.length > 0)
    .map((group) => ({
      text: group.title,
      collapsed: group.id !== "overview",
      items: group.items.map((item) => ({
        text: item.title,
        link: item.href,
      })),
    }));
}

const docsSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "Getting started",
    collapsed: false,
    items: [
      { text: "Overview", link: "/guides/" },
      { text: "Getting started", link: "/guides/getting-started" },
      {
        text: "Manual installation",
        link: "/guides/manual-installation",
      },
    ],
  },
  {
    text: "Concepts",
    collapsed: false,
    items: [
      { text: "Configuration", link: "/guides/configuration" },
      { text: "Commands", link: "/guides/commands" },
      { text: "Events", link: "/guides/events" },
      { text: "Middleware", link: "/guides/middleware" },
    ],
  },
  {
    text: "Contributing",
    collapsed: false,
    items: [
      {
        text: "Repository structure",
        link: "/contributing/repository-structure",
      },
      { text: "Credits", link: "/contributing/credits" },
    ],
  },
  ...apiSidebarItems(),
];

const algoliaAppId = process.env.PUBLIC_ALGOLIA_APP_ID;
const algoliaSearchKey = process.env.PUBLIC_ALGOLIA_SEARCH_KEY;
const algoliaIndexName = process.env.PUBLIC_ALGOLIA_INDEX_NAME;

const search =
  algoliaAppId && algoliaSearchKey && algoliaIndexName
    ? {
        provider: "algolia" as const,
        options: {
          appId: algoliaAppId,
          apiKey: algoliaSearchKey,
          indexName: algoliaIndexName,
        },
      }
    : { provider: "local" as const };

const GITHUB_URL = "https://github.com/maybeizen/confluxjs";
const FLUXER_SERVER_URL = "https://fluxer.app/invite/REPLACE_ME";

const githubRepoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "conflux";
const vitepressBase = process.env.VITEPRESS_BASE?.trim();
const base = vitepressBase
  ? vitepressBase.endsWith("/")
    ? vitepressBase
    : `${vitepressBase}/`
  : process.env.GITHUB_ACTIONS === "true"
    ? `/${githubRepoName}/`
    : "/";

export default defineConfig({
  base,
  title: "Conflux.js",
  description: "Meta-framework for Fluxer bots — guides and API reference.",
  appearance: "dark",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: `${base}favicon.svg` }]],
  markdown: {
    theme: "github-dark",
  },
  themeConfig: {
    logo: "/vector.svg",
    siteTitle: "Conflux.js",
    nav: [
      { text: "Docs", link: "/guides/getting-started" },
      { text: "Community", link: FLUXER_SERVER_URL, target: "_blank" },
    ],
    socialLinks: [{ icon: "github", link: GITHUB_URL }],
    sidebar: {
      "/guides/": docsSidebar,
      "/contributing/": docsSidebar,
      "/api/": docsSidebar,
    },
    footer: {
      message:
        '<a href="https://fluxer.js.org/" target="_blank" rel="noreferrer">Fluxer.js</a> · ' +
        '<a href="https://fluxer.app/" target="_blank" rel="noreferrer">Fluxer.app</a> · ' +
        '<a href="https://docs.fluxer.app/" target="_blank" rel="noreferrer">Fluxer docs</a> · ' +
        `<a href="${FLUXER_SERVER_URL}" target="_blank" rel="noreferrer">Fluxer server</a>`,
      copyright: "Conflux.js contributors",
    },
    search,
  },
});
