<script setup lang="ts">
import { withBase } from "../../lib/urls";
import { ref, onMounted, onUnmounted } from "vue";
import { headerConfig } from "../../config";
import { initTheme, toggleTheme } from "../../scripts/theme";

const props = defineProps<{ pathname: string }>();
const isDark = ref(false);
const isAtTop = ref(true);
const menuOpen = ref(false);

const active = (url: string) => url === withBase("/") ? props.pathname === withBase("/") : props.pathname.startsWith(url);
const handleScroll = () => { isAtTop.value = window.scrollY < 48; };
const toggle = () => { isDark.value = toggleTheme() === "dark"; };
const openSearch = () => { menuOpen.value = false; window.dispatchEvent(new Event("kanade:search")); };
const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") menuOpen.value = false; };

onMounted(() => {
  isDark.value = initTheme() === "dark";
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("keydown", handleKey);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("keydown", handleKey);
});
</script>

<template>
  <header class="nav-header" :class="{ scrolled: !isAtTop, 'menu-open': menuOpen }">
    <div class="nav-inner shell">
      <a :href="withBase('/')" class="brand" aria-label="Página Inicial">
        <span class="brand-flower">✿</span>{{ headerConfig.title }}<span class="brand-dot">.</span>
      </a>
      <nav aria-label="Navegação Principal" :class="{ expanded: menuOpen }" id="main-navigation">
        <a v-for="item in headerConfig.navLinks" :key="item.url" :href="item.url" :aria-current="active(item.url) ? 'page' : undefined" :class="{ active: active(item.url) }">
          <span :class="item.icon" aria-hidden="true"></span><span>{{ item.name }}</span>
        </a>
      </nav>
      <div class="nav-actions">
        <button @click="openSearch" aria-label="Buscar artigos" title="Buscar artigos (Ctrl / ⌘ K)"><span class="icon-[lucide--search]"></span></button>
        <button @click="toggle" :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'" :title="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"><span :class="isDark ? 'icon-[lucide--moon]' : 'icon-[lucide--sun]'"></span></button>
        <button class="menu-toggle" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-controls="main-navigation" :aria-label="menuOpen ? 'Fechar menu' : 'Abrir menu'"><span :class="menuOpen ? 'icon-[lucide--x]' : 'icon-[lucide--menu]'"></span></button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav-header { position: fixed; inset: 0 0 auto; height: 70px; z-index: 40; color: #fff; transition: background .25s, color .25s, box-shadow .25s; }
.nav-inner { display: flex; align-items: center; justify-content: space-between; height: 100%; width: 100%; }
.brand { display: flex; align-items: center; gap: 8px; font: 600 27px "Oxanium-Medium", sans-serif; letter-spacing: -.8px; }
.brand-flower { font-size: 29px; font-family: sans-serif; font-weight: 400; }
.brand-dot { color: #ffb4ca; margin-left: -7px; }
nav { display: flex; gap: 15px; padding-left: 0; }
nav a { display: flex; align-items: center; position: relative; gap: 7px; padding: 22px 13px; font-size: 15px; opacity: .85; }
nav a:hover, nav a.active { opacity: 1; }
nav a.active::after { content: ""; position: absolute; bottom: 13px; height: 3px; width: 19px; border-radius: 2px; background: currentColor; left: calc(50% - 9px); }
.nav-actions { display: flex; gap: 10px; }
.nav-actions button { width: 35px; height: 35px; display: grid; place-items: center; border: 0; border-radius: 50%; background: transparent; color: inherit; font-size: 19px; }
.nav-actions button:hover { background: #ffffff25; transform: rotate(-8deg); }
.nav-header.scrolled, .nav-header.menu-open { background: color-mix(in srgb, var(--card) 92%, transparent); color: var(--text); backdrop-filter: blur(18px); box-shadow: 0 3px 18px #4b314511; }
.scrolled nav a.active, .scrolled .brand-flower { color: var(--accent); }
.nav-actions .menu-toggle { display: none; }
@media (max-width: 820px) {
  .nav-actions .menu-toggle { display: grid; }
  nav { display: none; position: absolute; top: 70px; left: 0; width: 100%; background: var(--card); color: var(--text); flex-direction: column; padding: 18px 24px; box-shadow: 0 10px 25px #00000015; border-bottom: 1px solid var(--line); }
  nav.expanded { display: flex; }
  nav a { padding: 12px 0; border-bottom: 1px dashed var(--line); }
  nav a.active::after { display: none; }
}
</style>