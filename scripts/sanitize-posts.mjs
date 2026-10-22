import fs from "node:fs";
import path from "node:path";

const candidateDirs = ["src/content/blog", "src/content/posts"];

for (const relDir of candidateDirs) {
  const fullDir = path.resolve(process.cwd(), relDir);
  if (!fs.existsSync(fullDir)) continue;

  const entries = fs.readdirSync(fullDir).filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));
  let sanitizedCount = 0;

  for (const file of entries) {
    const filePath = path.join(fullDir, file);
    const content = fs.readFileSync(filePath, "utf-8");

    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---([\s\S]*)$/);
    if (!match) continue;

    let fm = match[1];
    const body = match[2];
    const originalFm = fm;

    // 1. Sanitizar descriptions multilinha entre aspas duplas (problema frequente do GitCMS)
    fm = fm.replace(/description:\s*"([\s\S]*?)"(?=\r?\n[a-zA-Z0-9_-]+:|\r?\n---|\s*$)/g, (full, desc) => {
      const cleanDesc = desc
        .replace(/[\r\n]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/"/g, '\\"');
      return `description: "${cleanDesc}"`;
    });

    // 2. Sanitizar titles multilinha entre aspas
    fm = fm.replace(/title:\s*"([\s\S]*?)"(?=\r?\n[a-zA-Z0-9_-]+:|\r?\n---|\s*$)/g, (full, tit) => {
      const cleanTit = tit
        .replace(/[\r\n]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/"/g, '\\"');
      return `title: "${cleanTit}"`;
    });

    // 3. Normalizar tags vazias para tags: []
    fm = fm.replace(/^tags:\s*$/gm, "tags: []");
    fm = fm.replace(/^tags:\s*(?=\r?\n---|\s*$)/gm, "tags: []");

    // 4. Normalizar campos vazios com quebra imediata
    fm = fm.replace(/^heroImage:\s*$/gm, 'heroImage: ""');
    fm = fm.replace(/^coverImage:\s*$/gm, 'coverImage: ""');
    fm = fm.replace(/^category:\s*$/gm, 'category: "Geral"');
    fm = fm.replace(/^author:\s*$/gm, 'author: "Equipe Sabixão"');

    if (fm !== originalFm) {
      fs.writeFileSync(filePath, `---\n${fm.trim()}\n---${body}`, "utf-8");
      sanitizedCount++;
    }
  }

  if (sanitizedCount > 0) {
    console.log(`[sanitize-posts] Sanitizados ${sanitizedCount} artigo(s) em ${relDir} com sucesso.`);
  }
}
