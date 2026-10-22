<script setup lang="ts">
import { withBase } from "../../lib/urls";
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { PostSummary } from "../../lib/posts";
import PostCover from "./PostCover.vue";

const props = defineProps<{ posts: PostSummary[]; archive?: boolean }>();
const category = ref("");
const tag = ref("");
const month = ref("");
const query = ref("");
const page = ref(1);
const ready = ref(false);
const feed = ref<HTMLElement>();
const pageSize = 8;

type PageItem = number | "...";

const visiblePages = computed<PageItem[]>(() => {
  const total = totalPages.value;
  const current = page.value;

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
});

function onEllipsisClick(idx: number) {
  if (idx < 3) {
    turnPage(Math.max(1, page.value - 5));
  } else {
    turnPage(Math.min(totalPages.value, page.value + 5));
  }
}

const categoryNames = computed(() => {
  const cats = [...new Set(props.posts.map(p => p.category).filter(Boolean))];
  return cats.length ? cats : ["Aulas & Cursos", "Dicas de Estudo", "Matemática & Raciocínio", "Português & Redação", "Ciências da Natureza", "ENEM & Concursos"];
});

const filtered = computed(() => props.posts.filter(p =>
  (!category.value || p.category === category.value) &&
  (!tag.value || p.tags.includes(tag.value)) &&
  (!month.value || p.date.startsWith(month.value)) &&
  (!query.value.trim() || [p.title, p.description, ...p.tags].join(" ").toLowerCase().includes(query.value.trim().toLowerCase()))
));

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const displayed = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize));

function syncUrl() {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries({ category: category.value, tag: tag.value, month: month.value, q: query.value.trim(), page: page.value > 1 ? String(page.value) : "" })) {
    value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
  }
  window.history.replaceState(null, "", url);
}

function readUrl() {
  const params = new URLSearchParams(window.location.search);
  category.value = params.get("category") || "";
  tag.value = params.get("tag") || "";
  month.value = params.get("month") || "";
  query.value = params.get("q") || "";
  const value = Number(params.get("page"));
  page.value = Number.isInteger(value) && value > 0 ? Math.min(value, totalPages.value) : 1;
}

function setCategory(value: string) { category.value = value; tag.value = ""; month.value = ""; page.value = 1; syncUrl(); }
function reset() { category.value = ""; tag.value = ""; month.value = ""; query.value = ""; page.value = 1; syncUrl(); }
function search() { page.value = 1; syncUrl(); }
function turnPage(value: number) {
  if (value < 1 || value > totalPages.value || value === page.value) return;
  page.value = value; syncUrl();
  feed.value?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
}

onMounted(() => { readUrl(); ready.value = true; window.addEventListener("popstate", readUrl); });
onUnmounted(() => window.removeEventListener("popstate", readUrl));
</script>

<template>
  <section ref="feed" class="post-feed" :data-ready="ready">
    <div v-if="archive" class="card archive-intro">
      <span class="eyebrow">ARQUIVO DE AULAS</span>
      <h2>Todas as Aulas & Publicações</h2>
      <p>Um total de {{ posts.length }} conteúdos educativos preparados para você.</p>
      <label class="archive-search">
        <span class="icon-[lucide--search]"></span>
        <input v-model="query" @input="search" type="search" aria-label="Filtrar aulas" placeholder="Pesquisar por matéria, aula ou tópico…" />
      </label>
    </div>
    <div v-else class="feed-title">
      <h2><span class="icon-[lucide--graduation-cap]"></span>Últimas Aulas & Dicas<small>AULAS & RESUMOS</small></h2>
      <span class="feed-count">{{ posts.length }} publicações</span>
    </div>

    <div class="feed-tabs card" aria-label="Disciplinas e categorias">
      <button :class="{ selected: !category && !tag && !month }" :aria-pressed="!category && !tag && !month" @click="reset">
        Todas as aulas <span>{{ posts.length }}</span>
      </button>
      <button v-for="name in categoryNames" :key="name" :class="{ selected: category === name }" :aria-pressed="category === name" @click="setCategory(name)">
        {{ name }}
      </button>
    </div>

    <div v-if="tag || month || (category && !categoryNames.includes(category))" class="filter-summary">
      <span>Filtrando por: <strong>{{ tag || month || category }}</strong></span>
      <button @click="reset">Limpar filtro ×</button>
    </div>

    <div class="post-list" aria-live="polite">
      <article v-for="post in displayed" :key="post.id" class="post-card card" :data-category="post.category">
        <a :href="withBase(post.url || `/${post.id}/`)" class="cover-link" :aria-label="`Ler: ${post.title}`" tabindex="-1">
          <PostCover :kind="post.cover" :featured="post.featured" :hero-image="post.heroImage" :title="post.title" />
        </a>
        <div class="post-info">
          <div class="post-kicker">
            <span v-if="post.featured" class="pin"><span class="icon-[lucide--pin]"></span>Destaque</span>
            <a :href="withBase(`/posts/?category=${encodeURIComponent(post.category)}`)">{{ post.category }}</a>
            <span class="meta-divider">/</span>
            <time :datetime="post.date">{{ post.date.replaceAll("-", ".") }}</time>
          </div>
          <h3><a :href="withBase(post.url || `/${post.id}/`)">{{ post.title }}</a></h3>
          <p class="post-description">{{ post.description }}</p>
          <div class="post-bottom">
            <div class="post-tags">
              <a v-for="item in post.tags.slice(0, 3)" :key="item" :href="withBase(`/posts/?tag=${encodeURIComponent(item)}`)"># {{ item }}</a>
            </div>
            <a class="read-post" :href="withBase(post.url || `/${post.id}/`)" :aria-label="`Ler artigo completo: ${post.title}`">
              {{ post.minutes }} min de leitura<span class="icon-[lucide--arrow-up-right]"></span>
            </a>
          </div>
        </div>
      </article>

      <div v-if="!displayed.length" class="empty-state card">
        <span class="icon-[lucide--book-open]"></span>
        <h3>Nenhuma aula encontrada</h3>
        <p>Não encontramos conteúdos correspondentes. Tente buscar por outros termos ou matérias.</p>
        <button class="btn secondary" @click="reset">Ver todas as aulas</button>
      </div>
    </div>

    <nav v-if="totalPages > 1" class="pagination" aria-label="Navegação entre páginas de aulas">
      <div class="pagination-controls">
        <button
          type="button"
          class="page-btn nav-btn prev"
          @click="turnPage(page - 1)"
          :disabled="page === 1"
          aria-label="Página anterior"
          title="Página anterior"
        >
          <span class="icon-[lucide--chevron-left]" aria-hidden="true"></span>
          <span class="nav-label">Anterior</span>
        </button>

        <div class="page-numbers">
          <template v-for="(item, idx) in visiblePages" :key="idx">
            <button
              v-if="item === '...'"
              type="button"
              class="page-btn ellipsis"
              @click="onEllipsisClick(idx)"
              :title="idx < 3 ? 'Voltar 5 páginas' : 'Avançar 5 páginas'"
              :aria-label="idx < 3 ? 'Voltar 5 páginas' : 'Avançar 5 páginas'"
            >
              &hellip;
            </button>
            <button
              v-else
              type="button"
              class="page-btn number"
              :class="{ current: page === item }"
              :aria-current="page === item ? 'page' : undefined"
              :aria-label="`Ir para a página ${item}`"
              @click="turnPage(item)"
            >
              {{ item }}
            </button>
          </template>
        </div>

        <button
          type="button"
          class="page-btn nav-btn next"
          @click="turnPage(page + 1)"
          :disabled="page === totalPages"
          aria-label="Próxima página"
          title="Próxima página"
        >
          <span class="nav-label">Próxima</span>
          <span class="icon-[lucide--chevron-right]" aria-hidden="true"></span>
        </button>
      </div>

      <div class="pagination-meta">
        <span>Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong></span>
        <span class="meta-dot" aria-hidden="true">•</span>
        <span>{{ filtered.length }} aulas</span>
      </div>
    </nav>

    <div class="feed-end"><span></span>O conhecimento transforma o seu futuro.<span></span></div>
  </section>
</template>

<style scoped>
.post-feed { scroll-margin-top: 92px; max-width: 100%; overflow-x: clip; }
.feed-title { display: flex; justify-content: space-between; align-items: center; margin: 0 1px 16px; height: 26px; }
.feed-title h2 { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 600; margin: 0; }
.feed-title h2 > span { color: var(--accent); }
.feed-title small { font: 9px "Oxanium-Medium", sans-serif; letter-spacing: .12em; margin-left: 5px; color: var(--muted); }
.feed-count { font-size: 11px; color: var(--muted); }
.feed-tabs { display: flex; gap: 6px; align-items: center; padding: 9px 10px; margin-bottom: 18px; border-radius: 13px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.feed-tabs::-webkit-scrollbar { display: none; }
.feed-tabs button { padding: 7px 13px; color: var(--muted); font-size: 12px; background: transparent; border: 0; border-radius: 8px; white-space: nowrap; }
.feed-tabs button.selected { color: #fff; background: var(--accent); }
.feed-tabs button:not(.selected):hover { color: var(--accent); background: var(--accent-soft); }
.feed-tabs button > span { display: inline-block; margin-left: 5px; font: 10px "Oxanium-Medium"; padding: 0 4px; border-radius: 3px; background: #ffffff25; }
.filter-summary { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: var(--accent-soft); border-radius: 10px; font-size: 12px; margin-bottom: 15px; color: var(--accent); }
.filter-summary button { background: none; border: none; color: inherit; font-weight: 600; cursor: pointer; }
.post-list { display: flex; flex-direction: column; gap: 18px; }
.post-card { display: grid; grid-template-columns: 34% minmax(0, 1fr); overflow: hidden; min-height: 205px; transition: transform .25s, box-shadow .25s; }
.post-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px #98566a10; }
.cover-link { display: block; overflow: hidden; margin: 9px 0 9px 9px; border-radius: 11px; }
.cover-link :deep(.post-cover) { transition: transform .5s; }
.post-card:hover .cover-link :deep(.post-cover) { transform: scale(1.035); }
.post-info { padding: 19px 20px 17px; display: flex; flex-direction: column; min-width: 0; }
.post-kicker { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; font-size: 10px; color: var(--muted); }
.post-kicker a { color: var(--accent); }
.pin { display: inline-flex; align-items: center; gap: 3px; background: var(--accent-soft); color: var(--accent); padding: 2px 7px; border-radius: 4px; font-size: 9px; font-weight: 600; }
.meta-divider { opacity: .4; }
.post-card h3 { margin: 8px 0 6px; font-size: 17px; font-weight: 600; line-height: 1.5; }
.post-card h3 a:hover { color: var(--accent); }
.post-description { color: var(--muted); font-size: 12px; line-height: 1.7; margin: 0 0 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.post-bottom { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 11px; }
.post-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.post-tags a { color: var(--muted); font-size: 10px; }
.post-tags a:hover { color: var(--accent); }
.read-post { display: inline-flex; align-items: center; gap: 4px; color: var(--accent); font-size: 11px; white-space: nowrap; margin-left: auto; }
.read-post:hover { text-decoration: underline; }
.empty-state { text-align: center; padding: 45px 20px; color: var(--muted); }
.empty-state span { font-size: 38px; color: var(--accent); }
.empty-state h3 { margin: 12px 0 5px; color: var(--text); font-size: 16px; }
.empty-state p { font-size: 12px; margin-bottom: 18px; }

.pagination { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; margin-top: 36px; max-width: 100%; }
.pagination-controls { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 6px; max-width: 100%; }
.page-numbers { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 5px; }
.page-btn { min-width: 36px; height: 36px; padding: 0 8px; border: 1px solid var(--line); background: var(--card); border-radius: 9px; color: var(--text); font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: all .2s cubic-bezier(0.4, 0, 0.2, 1); user-select: none; }
.page-btn:hover:not(:disabled):not(.current):not(.ellipsis) { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); transform: translateY(-1px); }
.page-btn.current { background: var(--accent); color: #fff; border-color: var(--accent); font-weight: 700; box-shadow: 0 2px 10px #98566a33; }
.page-btn:disabled { opacity: .35; cursor: not-allowed; transform: none; }
.page-btn.ellipsis { min-width: 28px; padding: 0; background: transparent; border-color: transparent; color: var(--muted); font-size: 14px; letter-spacing: 2px; }
.page-btn.ellipsis:hover { background: var(--card); border-color: var(--line); color: var(--accent); }
.nav-btn { padding: 0 12px; font-weight: 600; }
.pagination-meta { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); font-size: 12px; background: var(--card); border: 1px solid var(--line); padding: 4px 14px; border-radius: 20px; }
.pagination-meta strong { color: var(--text); font-weight: 600; }
.meta-dot { opacity: .4; }

.feed-end { display: flex; align-items: center; gap: 15px; justify-content: center; margin: 40px 0 10px; color: var(--muted); font-size: 11px; }
.feed-end span { height: 1px; width: 45px; background: var(--line); }
.archive-intro { padding: 24px; margin-bottom: 22px; }
.archive-intro .eyebrow { font-size: 10px; letter-spacing: .15em; color: var(--accent); }
.archive-intro h2 { font-size: 22px; margin: 6px 0 8px; }
.archive-intro p { color: var(--muted); font-size: 12px; margin: 0 0 15px; }
.archive-search { display: flex; align-items: center; gap: 10px; border: 1px solid var(--line); background: var(--bg); border-radius: 10px; padding: 10px 14px; color: var(--accent); }
.archive-search input { border: 0; background: transparent; width: 100%; color: var(--text); outline: none; }

@media(max-width:680px) {
  .post-card { grid-template-columns: 1fr; }
  .cover-link { margin: 9px 9px 0; max-height: 160px; }
  .pagination { margin-top: 24px; gap: 10px; }
  .pagination-controls { gap: 4px; }
  .page-numbers { gap: 3px; }
  .page-btn { min-width: 32px; height: 34px; padding: 0 6px; font-size: 12px; border-radius: 7px; }
  .page-btn.ellipsis { min-width: 20px; letter-spacing: 1px; }
  .nav-btn { padding: 0 8px; }
  .nav-label { display: none; }
  .pagination-meta { font-size: 11px; padding: 3px 10px; }
}
</style>
