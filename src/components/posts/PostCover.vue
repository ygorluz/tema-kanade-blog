<script setup lang="ts">
const props = defineProps<{ kind?: string; featured?: boolean; heroImage?: string; title?: string }>();

const labels: Record<string, { icon: string; title: string; sub: string }> = {
  astro: { icon: "icon-[simple-icons--astro]", title: "Astro", sub: "DESENVOLVIMENTO WEB MODERNO" },
  vue: { icon: "icon-[simple-icons--vuedotjs]", title: "Vue.js", sub: "REATIVIDADE E LEVEZA" },
  css: { icon: "icon-[lucide--palette]", title: "Design", sub: "DETALHES QUE ENCANTAM" },
  notes: { icon: "icon-[lucide--coffee]", title: "Reflexões", sub: "IDEIAS E HISTÓRIAS" },
  life: { icon: "icon-[lucide--sprout]", title: "Hábitos", sub: "ROTINA E BEM-ESTAR" },
  typescript: { icon: "icon-[simple-icons--typescript]", title: "TypeScript", sub: "CÓDIGO SEGURO E ESCALÁVEL" },
  git: { icon: "icon-[simple-icons--git]", title: "Fluxo", sub: "PEQUENOS PASSOS CONSTANTES" },
  design: { icon: "icon-[lucide--sparkles]", title: "Criatividade", sub: "TRANSFORMANDO IDEIAS EM REALIDADE" },
};

const safeKind = props.kind && labels[props.kind] ? props.kind : "notes";
</script>

<template>
  <div v-if="heroImage" class="post-cover has-image" :class="{ featured }" aria-hidden="true">
    <img :src="heroImage" :alt="title || ''" class="cover-photo" loading="lazy" />
  </div>
  <div v-else class="post-cover" :class="[safeKind, { featured }]" aria-hidden="true">
    <div class="cover-grid"></div>
    <span class="cover-orbit"></span>
    <span class="cover-dot"></span>
    <span class="cover-corner">KANADE / BLOG</span>
    <span class="cover-icon" :class="labels[safeKind]?.icon"></span>
    <strong>{{ featured ? "Destaque" : labels[safeKind]?.title }}</strong>
    <small>{{ featured ? "HISTÓRIAS EM DESTAQUE" : labels[safeKind]?.sub }}</small>
    <span class="cover-star">✧</span>
  </div>
</template>

<style scoped>
.post-cover { min-height: 180px; height: 100%; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #79539c; background: #eee6f7; padding: 28px 12px; isolation: isolate; }
.post-cover.has-image { padding: 0; background: transparent; }
.cover-photo { width: 100%; height: 100%; object-fit: cover; display: block; }
.cover-grid { position: absolute; inset: 0; background-image: linear-gradient(#ffffff42 1px, transparent 1px), linear-gradient(90deg, #ffffff42 1px, transparent 1px); background-size: 23px 23px; z-index: -1; mask-image: linear-gradient(30deg, black, transparent 80%); }
.cover-orbit { position: absolute; height: 190px; width: 190px; border: 1px solid #ffffff70; border-radius: 50%; right: -75px; top: -80px; box-shadow: 0 0 0 20px #ffffff15, 0 0 0 40px #ffffff15; z-index: -1; }
.cover-dot { position: absolute; bottom: -35px; left: -40px; border-radius: 50%; width: 120px; height: 120px; background: #ffffff25; }
.cover-corner { position: absolute; top: 13px; left: 15px; font: 7px "Oxanium-Medium", sans-serif; letter-spacing: .14em; opacity: .6; }
.cover-icon { display: block; font-size: 43px; margin: 4px 0 7px; opacity: .86; }
strong { font: 600 24px "Oxanium-Medium", sans-serif; letter-spacing: -.6px; white-space: nowrap; }
small { font: 6px "Oxanium-Medium", sans-serif; letter-spacing: .12em; margin-top: 9px; opacity: .75; white-space: nowrap; }
.cover-star { position: absolute; font-size: 30px; bottom: 16px; right: 18px; opacity: .5; }
.css { background: #fbe4e5; color: #b76f85; }
.vue, .life { background: #e2efe7; color: #588f7a; }
.notes { background: #f1e5d9; color: #a88969; }
.typescript { background: #dfebf7; color: #648db2; }
.git { background: #fae7df; color: #bc7e68; }
.design { background: #e5e6fa; color: #8283b5; }
.featured { background: #e9e1f4; }
.dark .post-cover { filter: brightness(.85) saturate(.9); }
</style>