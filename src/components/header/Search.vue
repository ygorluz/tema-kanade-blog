<script setup lang="ts">
import { withBase } from "../../lib/urls";
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import type { PostSummary } from "../../lib/posts";

const props = defineProps<{ posts: PostSummary[] }>();
const dialog = ref<HTMLDialogElement>();
const input = ref<HTMLInputElement>();
const query = ref("");

const results = computed(() => {
  const terms = query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return props.posts.slice(0, 4);
  return props.posts.filter(p => terms.every(term => [p.title, p.description, p.category, ...p.tags].join(" ").toLocaleLowerCase().includes(term)));
});

let opener: HTMLElement | null = null;
const open = async () => {
  if (dialog.value?.open) return;
  opener = document.activeElement as HTMLElement | null;
  query.value = "";
  dialog.value?.showModal();
  document.body.style.overflow = "hidden";
  await nextTick();
  input.value?.focus();
};
const close = () => { dialog.value?.close(); };
const afterClose = () => { document.body.style.overflow = ""; opener?.focus(); };
const keydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && dialog.value?.open) { e.preventDefault(); close(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
};

onMounted(() => {
  window.addEventListener("kanade:search", open);
  window.addEventListener("keydown", keydown, true);
});
onUnmounted(() => {
  window.removeEventListener("kanade:search", open);
  window.removeEventListener("keydown", keydown, true);
  document.body.style.overflow = "";
});
</script>

<template>
  <dialog ref="dialog" class="search-dialog" aria-labelledby="search-title" @close="afterClose" @click="e => { if(e.target === dialog) close(); }">
    <div class="search-body">
      <div class="search-heading">
        <h2 id="search-title">Buscar no Sabixão</h2>
        <button aria-label="Fechar busca" @click="close"><span class="icon-[lucide--x]"></span></button>
      </div>
      <div class="search-field">
        <span class="icon-[lucide--search]"></span>
        <input ref="input" v-model="query" type="search" placeholder="Buscar por aulas, resumos, disciplinas ou tópicos…" aria-label="Termo de busca" />
        <kbd>ESC</kbd>
      </div>
      <p class="search-meta" aria-live="polite">
        {{ query.trim() ? `Encontrada(s) ${results.length} aula(s)` : "Aulas & Conteúdos Recentes" }}
      </p>
      <div class="search-results">
        <a v-for="post in results" :key="post.id" :href="withBase(post.url || `/${post.id}/`)" class="search-result" @click="close">
          <span class="result-icon icon-[lucide--file-text]"></span>
          <div>
            <strong>{{ post.title }}</strong>
            <p>{{ post.category }} · {{ post.date }}</p>
          </div>
          <span class="icon-[lucide--arrow-up-right]"></span>
        </a>
        <div v-if="!results.length" class="empty-state">
          <span class="icon-[lucide--search-x]"></span>
          <h3>Nenhuma aula encontrada</h3>
          <p>Tente buscar por termos como "matemática", "redação", "dicas de estudo" ou "vestibular".</p>
        </div>
      </div>
      <div class="search-footer">
        Busca instantânea <span>Ctrl / ⌘ K abrir · ESC fechar</span>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.search-dialog { position: fixed; margin: 14vh auto auto; padding: 0; width: min(620px, calc(100% - 28px)); max-height: 76vh; border: 1px solid var(--line); border-radius: 20px; background: var(--card); color: var(--text); box-shadow: 0 20px 100px #35233133; overflow: auto; }
.search-dialog::backdrop { background: #1c172a65; backdrop-filter: blur(6px); }
.search-body { padding: 24px; }
.search-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.search-heading h2 { font-size: 17px; margin: 0; }
.search-heading button { display: grid; place-items: center; background: var(--accent-soft); border: 0; width: 30px; height: 30px; border-radius: 8px; color: var(--accent); }
.search-field { display: flex; align-items: center; gap: 10px; border: 1px solid var(--line); background: var(--bg); border-radius: 10px; padding: 12px; color: var(--accent); }
.search-field input { border: 0; background: transparent; width: 100%; color: var(--text); outline: none; font-size: 14px; }
.search-field kbd { font-size: 10px; font-family: sans-serif; background: var(--card); border: 1px solid var(--line); padding: 3px 6px; border-radius: 5px; color: var(--muted); }
.search-meta { font-size: 11px; color: var(--muted); margin: 14px 0 8px; }
.search-results { display: flex; flex-direction: column; gap: 8px; max-height: 340px; overflow-y: auto; }
.search-result { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; transition: background .15s; }
.search-result:hover { background: var(--accent-soft); }
.result-icon { font-size: 20px; color: var(--accent); flex-shrink: 0; }
.search-result div { flex: 1; min-width: 0; }
.search-result strong { display: block; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.search-result p { margin: 2px 0 0; font-size: 10px; color: var(--muted); }
.search-result span:last-child { color: var(--muted); font-size: 14px; }
.empty-state { text-align: center; padding: 35px 20px; color: var(--muted); }
.empty-state span { font-size: 32px; color: var(--accent); }
.empty-state h3 { font-size: 14px; margin: 10px 0 4px; color: var(--text); }
.empty-state p { font-size: 11px; margin: 0; }
.search-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--line); margin-top: 16px; padding-top: 12px; font-size: 10px; color: var(--muted); }
</style>
