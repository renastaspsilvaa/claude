/* =========================================================
   Rofi Studio — comportamento do site (v2)
   ========================================================= */

/* ---------------------------------------------------------
   LINKS DA LOJA  ← é só isto que precisas de editar
   Cola aqui o link de cada produto quando a listagem estiver
   publicada. Enquanto estiver vazio (""), o site mostra
   "Em breve" em vez de um botão que não leva a lado nenhum.
   --------------------------------------------------------- */
const LOJA = {
  ugc:    { etsy: "", gumroad: "" },
  insta:  { etsy: "", gumroad: "" },
  framer: { framer: "", gumroad: "" },
};

const EMAIL = "geral.renatasofia@gmail.com";

/* --------------------------------------------------------- */

const TITULOS = {
  inicio:   { pt: "Rofi Studio · Design, marca e web", en: "Rofi Studio · Design, branding and web" },
  servicos: { pt: "Serviços · Rofi Studio",            en: "Services · Rofi Studio" },
  loja:     { pt: "Loja · Rofi Studio",                en: "Shop · Rofi Studio" },
  contacto: { pt: "Contacto · Rofi Studio",            en: "Contact · Rofi Studio" },
};
const NOMES_LOJA = { etsy: "Etsy", gumroad: "Gumroad", framer: "Framer Marketplace" };

const html = document.documentElement;
const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rato = window.matchMedia("(pointer: fine)").matches;

const guarda = {
  ler(k){ try { return localStorage.getItem(k); } catch { return null; } },
  escrever(k, v){ try { localStorage.setItem(k, v); } catch { /* sem problema */ } },
};

/* ---------- idioma ---------- */
function linguaInicial(){
  const pedida = new URLSearchParams(location.search).get("lang");
  if (pedida === "pt" || pedida === "en") return pedida;
  const guardada = guarda.ler("rofi-lingua");
  if (guardada === "pt" || guardada === "en") return guardada;
  return (navigator.language || "pt").toLowerCase().startsWith("pt") ? "pt" : "en";
}

function aplicaLingua(l){
  html.lang = l;
  document.getElementById("lingua")?.setAttribute("aria-label", l === "pt" ? "Switch to English" : "Mudar para português");
  const t = TITULOS[html.dataset.pagina];
  if (t) document.title = t[l];
  document.querySelectorAll("a[data-assunto-en]").forEach(a => {
    if (!a.dataset.assuntoPt) a.dataset.assuntoPt = new URL(a.href).searchParams.get("subject") || "";
    const assunto = l === "pt" ? a.dataset.assuntoPt : a.dataset.assuntoEn;
    a.href = `mailto:${EMAIL}?subject=${encodeURIComponent(assunto)}`;
  });
  desenhaLoja(l);
  separaPalavras();
}

/* ---------- loja ---------- */
function desenhaLoja(l){
  document.querySelectorAll("[data-links]").forEach(caixa => {
    const links = LOJA[caixa.dataset.links] || {};
    const ativos = Object.entries(links).filter(([, url]) => url && url.trim());
    caixa.innerHTML = "";
    if (!ativos.length){
      const s = document.createElement("span");
      s.className = "embreve";
      s.textContent = l === "pt" ? "Em breve" : "Coming soon";
      caixa.append(s);
      return;
    }
    ativos.forEach(([loja, url], i) => {
      const a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener";
      if (i > 0) a.className = "sec-link";
      a.textContent = (l === "pt" ? "Comprar na " : "Buy on ") + NOMES_LOJA[loja] + " ↗";
      caixa.append(a);
    });
  });
}

/* ---------- cabeçalho: cor da secção por baixo ---------- */
function cabecalho(){
  const topo = document.getElementById("topo");
  if (!topo) return;
  let pedido = false;
  const atualiza = () => {
    pedido = false;
    const y = topo.offsetHeight / 2;
    const pontos = document.elementsFromPoint(Math.min(24, innerWidth - 1), y);
    const alvo = pontos.find(el => !topo.contains(el) && el.closest("[data-tema]"));
    const tema = alvo?.closest("[data-tema]")?.dataset.tema;
    if (tema && !document.body.classList.contains("menu-aberto")) topo.dataset.tema = tema;
    topo.classList.toggle("rolou", scrollY > 40);
  };
  const pede = () => { if (!pedido){ pedido = true; requestAnimationFrame(atualiza); } };
  atualiza();
  addEventListener("scroll", pede, { passive: true });
  addEventListener("resize", pede);
}

/* ---------- menu ---------- */
function menu(){
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  if (!burger || !menu) return;
  const fecha = () => { document.body.classList.remove("menu-aberto"); burger.setAttribute("aria-expanded", "false"); };
  burger.addEventListener("click", () => {
    const aberto = document.body.classList.toggle("menu-aberto");
    burger.setAttribute("aria-expanded", String(aberto));
  });
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", fecha));
  addEventListener("keydown", e => { if (e.key === "Escape") fecha(); });
}

/* ---------- aparecer ao fazer scroll ---------- */
function revelar(){
  const els = document.querySelectorAll(".rv, .rv-mask");
  if (calmo || !("IntersectionObserver" in window)){ els.forEach(e => e.classList.add("visto")); return; }
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(en => { if (en.isIntersecting){ en.target.classList.add("visto"); obs.unobserve(en.target); } });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  els.forEach(e => obs.observe(e));
}

/* ---------- aparo que reage ao rato ---------- */
function inclina(){
  if (calmo) return;
  const alvos = document.querySelectorAll("[data-tilt]");
  if (!alvos.length) return;
  addEventListener("pointermove", e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    alvos.forEach(a => { a.style.setProperty("--ry", `${x * 28}deg`); a.style.setProperty("--rx", `${-y * 22}deg`); });
  }, { passive: true });
}

/* ---------- efeitos ligados ao scroll ---------- */
let palavras = [];
function separaPalavras(){
  document.querySelectorAll("[data-palavras] [data-l]").forEach(bloco => {
    if (bloco.dataset.separado) return;
    bloco.dataset.separado = "1";
    const nos = [];
    const anda = no => no.childNodes.forEach(f => f.nodeType === 3 ? nos.push(f) : anda(f));
    anda(bloco);
    nos.forEach(t => {
      const frag = document.createDocumentFragment();
      t.textContent.split(/(\s+)/).forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)){ frag.append(p); return; }
        const s = document.createElement("span"); s.className = "p"; s.textContent = p; frag.append(s);
      });
      t.replaceWith(frag);
    });
  });
  palavras = [...document.querySelectorAll(`[data-palavras] [data-l="${html.lang}"] .p`)];
}

function scrollFx(){
  const pistas = [...document.querySelectorAll("[data-faixa]")];
  const hero = document.querySelector("[data-hero]");
  const heroNib = document.querySelector(".hero-nib");
  let vel = 0, ultimo = scrollY, desloc = 0;

  const frame = () => {
    const y = scrollY;
    vel += ((y - ultimo) - vel) * .12;
    ultimo = y;

    // faixas: andam sozinhas e aceleram com o scroll
    if (pistas.length && !calmo){
      desloc -= .6 + Math.min(Math.abs(vel), 60) * .35;
      pistas.forEach((p, i) => {
        const metade = p.scrollWidth / 2;
        const x = ((desloc * (i % 2 ? -1 : 1)) % metade + metade) % metade;
        p.style.transform = `translate3d(${-x}px,0,0)`;
      });
    }

    // manifesto: as palavras acendem à medida que se lê
    if (palavras.length){
      const alvo = innerHeight * (calmo ? 1 : .72);
      palavras.forEach(w => w.classList.toggle("on", w.getBoundingClientRect().top < alvo));
    }

    // hero: o aparo sobe e roda ao descer
    if (hero && heroNib && !calmo){
      const p = Math.min(Math.max(y / hero.offsetHeight, 0), 1);
      heroNib.style.transform = `translate3d(0,${-p * 30}vh,0) rotate(${p * 40}deg) scale(${1 - p * .15})`;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* ---------- cursor e pré-visualização dos projetos ---------- */
function cursor(){
  const c = document.getElementById("cursor");
  const prev = document.getElementById("preview");
  if (!rato || calmo || !c) return;
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, px = mx, py = my;
  addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; c.classList.add("ativo"); }, { passive: true });
  document.addEventListener("pointerleave", () => c.classList.remove("ativo"));

  document.querySelectorAll("a, button, summary, label").forEach(el => {
    el.addEventListener("pointerenter", () => c.classList.add("link"));
    el.addEventListener("pointerleave", () => c.classList.remove("link"));
  });

  const cores = 5;
  document.querySelectorAll(".proj").forEach(p => {
    p.addEventListener("pointerenter", () => {
      c.classList.add("grande");
      if (!prev) return;
      const sf = Number(p.dataset.sf || 0) % cores;
      prev.innerHTML = `<div class="sem-foto sf-${sf}"><span class="sf-r">Rofi Studio</span><span class="sf-t"></span><span class="logo sym"></span></div>`;
      prev.querySelector(".sf-t").textContent = p.dataset.nome || "";
      const img = new Image();
      img.alt = "";
      img.onload = () => prev.append(img);
      img.src = p.dataset.img;
      prev.classList.add("on");
    });
    p.addEventListener("pointerleave", () => { c.classList.remove("grande"); prev?.classList.remove("on"); });
  });

  const anda = () => {
    cx += (mx - cx) * .22; cy += (my - cy) * .22;
    px += (mx - px) * .1;  py += (my - py) * .1;
    c.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    if (prev){
      const w = prev.offsetWidth, h = prev.offsetHeight;
      prev.style.transform = `translate3d(${Math.min(px + 30, innerWidth - w - 16)}px,${Math.min(Math.max(py - h / 2, 16), innerHeight - h - 16)}px,0)`;
    }
    requestAnimationFrame(anda);
  };
  requestAnimationFrame(anda);
}

/* ---------- formulário: abre o email já escrito ---------- */
function formulario(){
  const form = document.getElementById("form");
  const nota = document.getElementById("form-nota");
  if (!form) return;
  const TIPOS = {
    pt: { marca: "Marca", web: "Site", imagem: "Foto e vídeo", outro: "Outra coisa" },
    en: { marca: "Brand", web: "Website", imagem: "Photo & video", outro: "Something else" },
  };
  form.addEventListener("submit", e => {
    e.preventDefault();
    const l = html.lang === "en" ? "en" : "pt";
    const d = new FormData(form);
    let ok = true;
    ["nome", "email", "mensagem"].forEach(c => {
      const el = form.elements[c];
      const valido = el.value.trim() && (c !== "email" || el.checkValidity());
      el.classList.toggle("erro", !valido);
      if (!valido) ok = false;
    });
    if (!ok){
      nota.classList.remove("ok");
      nota.textContent = l === "pt" ? "Falta preencher algum campo (ou o email não está completo)." : "Some field is missing (or the email isn't complete).";
      form.querySelector(".erro")?.focus();
      return;
    }
    const tipo = TIPOS[l][d.get("tipo")] || "";
    const assunto = l === "pt" ? `Novo projeto (${tipo}) — ${d.get("nome")}` : `New project (${tipo}) — ${d.get("nome")}`;
    const corpo = `${l === "pt" ? "Olá Renata" : "Hi Renata"},\n\n${d.get("mensagem")}\n\n—\n${d.get("nome")}\n${d.get("email")}`;
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    nota.classList.add("ok");
    nota.textContent = l === "pt"
      ? `Abri o teu email com a mensagem pronta. Se não abriu, escreve diretamente para ${EMAIL}.`
      : `Your email app should now be open with the message ready. If not, write to ${EMAIL}.`;
  });
  form.addEventListener("input", e => e.target.classList?.remove("erro"));
}

/* ---------- arranque ----------
   Cada parte arranca à parte: se uma falhar num browser mais antigo,
   as outras continuam. Os efeitos de entrada (que escondem o conteúdo
   até aparecer) só se ligam no fim, quando tudo correu bem — assim o
   texto nunca fica invisível. */
const tenta = f => { try { f(); } catch (e) { console.warn("Rofi:", e); } };

tenta(() => aplicaLingua(linguaInicial()));
tenta(() => document.getElementById("lingua")?.addEventListener("click", () => {
  const nova = html.lang === "pt" ? "en" : "pt";
  guarda.escrever("rofi-lingua", nova);
  aplicaLingua(nova);
}));
tenta(() => { const ano = document.getElementById("ano"); if (ano) ano.textContent = new Date().getFullYear(); });
[cabecalho, menu, inclina, scrollFx, cursor, formulario].forEach(tenta);

if (!calmo && "IntersectionObserver" in window){
  html.classList.add("js");
  tenta(revelar);
  setTimeout(() => document.body.classList.add("pronto"), 80);
}
