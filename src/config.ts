import { withBase } from "./lib/urls";
import siteCfg from "./data/siteConfig.json";
import menuData from "./data/menu.json";

export const siteInfo = {
  title: siteCfg.name || "Kanade Blog",
  description: siteCfg.description || "Um blog moderno, estético e minimalista.",
  keywords: ["Astro", "Kanade", "Blog", "Tecnologia", "Criatividade", "Design", "Produtividade"],
  url: import.meta.env.SITE_URL || siteCfg.url || "http://localhost:4321",
  author: siteCfg.author || "Redação",
};

export const headerConfig = {
  title: siteCfg.name || "Kanade",
  navLinks: (menuData || []).map((item: any) => ({
    name: item.name,
    icon: item.icon || "icon-[material-symbols--article]",
    url: withBase(item.url),
  })),
};

export const welcomeConfig = {
  title: "Bem-vindo ao Blog",
  subTitle: "Histórias, ideias e aprendizados que transformam o dia a dia.",
  bgImage: withBase("/images/hero.webp"),
};

export const personalInfo = {
  name: siteCfg.author || "Redação",
  englishName: "Kanade Editorial",
  avatar: withBase("/images/avatar.svg"),
  role: "Criador de Conteúdo",
  bio: "Compartilhando ideias, tecnologia e inspiração para transformar o seu dia a dia.",
  github: siteCfg.social?.github || "https://github.com",
  socialLinks: [
    { name: "GitHub", icon: "icon-[jam--github]", url: siteCfg.social?.github || "https://github.com" },
    { name: "Instagram", icon: "icon-[lucide--instagram]", url: siteCfg.social?.instagram || "https://instagram.com" },
    { name: "RSS", icon: "icon-[lucide--rss]", url: withBase("/rss.xml") },
    { name: "Mural", icon: "icon-[lucide--mail]", url: withBase("/messages/") },
  ],
};