// Lê os projetos da página inicial do portfolio (Framer) e guarda-os em data/projetos.json.
// Corre sozinho todos os dias no GitHub (.github/workflows/portfolio.yml).
// Se não encontrar projetos, não mexe no ficheiro — o site fica com a última lista boa.

import { readFile, writeFile, mkdir } from "node:fs/promises";

const HOME = "https://portfoliorenatasofia.framer.website/";
const DESTINO = new URL("../data/projetos.json", import.meta.url);
const PADRAO_PROJETO = /\/trabalhos\/[^/?#"]+\/?$/;

const decode = s => s
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

const textos = html => decode(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " "))
  .split(/<[^>]+>/).map(t => t.replace(/\s+/g, " ").trim()).filter(Boolean);

const meta = (html, prop) => {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]*content="([^"]*)"`, "i"))
         || html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]*(?:property|name)="${prop}"`, "i"));
  return m ? decode(m[1]).trim() : "";
};

async function pagina(url){
  const r = await fetch(url, { headers: { "user-agent": "RofiStudioSite/1.0 (+https://rofistudios.com)" } });
  if (!r.ok) throw new Error(`${url} respondeu ${r.status}`);
  return r.text();
}

function imagemDoBloco(bloco){
  const srcset = bloco.match(/srcset="([^"]+)"/i);
  if (srcset){
    // escolhe a versão maior do srcset
    const opcoes = decode(srcset[1]).split(",").map(p => p.trim().split(/\s+/));
    const maior = opcoes.sort((a, b) => parseInt(b[1] || "0") - parseInt(a[1] || "0"))[0];
    if (maior?.[0]) return maior[0];
  }
  const src = bloco.match(/<img[^>]+src="([^"]+)"/i);
  return src ? decode(src[1]) : "";
}

async function main(){
  const home = await pagina(HOME);
  const tituloSite = meta(home, "og:title") || (home.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "");

  // 1) links para projetos, pela ordem em que aparecem na página inicial
  const vistos = new Map();
  const re = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of home.matchAll(re)){
    const url = new URL(decode(m[1]), HOME);
    if (url.host !== new URL(HOME).host || !PADRAO_PROJETO.test(url.pathname)) continue;
    const chave = url.pathname.replace(/\/$/, "");
    const bloco = m[2];
    const atual = vistos.get(chave) || { url: url.origin + chave, textos: [], imagem: "" };
    atual.textos.push(...textos(bloco));
    if (!atual.imagem) atual.imagem = imagemDoBloco(bloco);
    vistos.set(chave, atual);
  }

  if (!vistos.size){
    console.warn("⚠ Não encontrei projetos na página inicial. Não mudei nada.");
    return;
  }

  // 2) completa cada projeto com os dados da própria página
  const projetos = [];
  for (const [chave, p] of vistos){
    let titulo = "", imagem = p.imagem, descricao = "";
    try {
      const html = await pagina(p.url);
      titulo = meta(html, "og:title") || (html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "");
      if (!imagem) imagem = meta(html, "og:image");
      descricao = meta(html, "og:description");
    } catch (e){ console.warn(`⚠ ${e.message}`); }

    // o título da página costuma ser "Projeto - Nome do site"; fica só com o projeto
    titulo = decode(titulo).split(/\s[|–—-]\s/)[0].trim();
    if (!titulo || titulo === tituloSite.split(/\s[|–—-]\s/)[0].trim()) titulo = "";

    const ano = p.textos.join(" ").match(/\b20\d{2}(?:\s?[–-]\s?\d{2,4})?\b/)?.[0] ?? "";
    const slug = chave.split("/").pop();
    const nomeDoSlug = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const nome = p.textos.find(t => t.length > 1 && t.length < 60 && !/^\d{4}/.test(t)) || titulo || nomeDoSlug;
    const info = p.textos.find(t => t !== nome && t !== ano && t.length > 1 && t.length < 40 && !/^\d+$/.test(t)) || "";

    projetos.push({ nome, info, ano, url: p.url, imagem, descricao });
  }

  // 3) só grava se a lista mudou (evita publicações inúteis)
  const novo = { fonte: HOME, projetos };
  let antigo = null;
  try { antigo = JSON.parse(await readFile(DESTINO, "utf8")); } catch { /* ainda não existe */ }
  if (antigo && JSON.stringify({ fonte: antigo.fonte, projetos: antigo.projetos }) === JSON.stringify(novo)){
    console.log(`✓ ${projetos.length} projetos — sem alterações.`);
    return;
  }
  await mkdir(new URL("../data/", import.meta.url), { recursive: true });
  await writeFile(DESTINO, JSON.stringify({ ...novo, atualizado: new Date().toISOString() }, null, 2) + "\n");
  console.log(`✓ ${projetos.length} projetos guardados:`);
  projetos.forEach((p, i) => console.log(`  ${i + 1}. ${p.nome} ${p.ano ? `(${p.ano})` : ""} → ${p.url}`));
}

main().catch(e => { console.error("✗", e.message); process.exit(1); });
