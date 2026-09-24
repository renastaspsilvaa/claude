/* =========================================================
   Rofi Studio — comportamento do site
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
html.classList.add("js");

/* ---------- guardar preferências sem partir se o browser bloquear ---------- */
const guarda = {
  ler(k){ try { return localStorage.getItem(k); } catch { return null; } },
  escrever(k, v){ try { localStorage.setItem(k, v); } catch { /* sem problema */ } },
};

/* ---------- idioma ---------- */
function linguaInicial(){
  const guardada = guarda.ler("rofi-lingua");
  if (guardada === "pt" || guardada === "en") return guardada;
  const pedida = new URLSearchParams(location.search).get("lang");
  if (pedida === "pt" || pedida === "en") return pedida;
  return (navigator.language || "pt").toLowerCase().startsWith("pt") ? "pt" : "en";
}

function aplicaLingua(l){
  html.lang = l;
  const botao = document.getElementById("lingua");
  if (botao) botao.setAttribute("aria-label", l === "pt" ? "Switch to English" : "Mudar para português");
  document.getElementById("menu")?.setAttribute("aria-label", l === "pt" ? "Principal" : "Main");
  const titulos = TITULOS[html.dataset.pagina];
  if (titulos) document.title = titulos[l];
  // assuntos dos emails dos cursos e da Kalmia
  document.querySelectorAll("a[data-assunto-en]").forEach(a => {
    if (!a.dataset.assuntoPt) a.dataset.assuntoPt = new URL(a.href).searchParams.get("subject") || "";
    const assunto = l === "pt" ? a.dataset.assuntoPt : a.dataset.assuntoEn;
    a.href = `mailto:${EMAIL}?subject=${encodeURIComponent(assunto)}`;
  });
  desenhaLoja(l);
}

/* ---------- loja ---------- */
function desenhaLoja(l){
  document.querySelectorAll("[data-links]").forEach(caixa => {
    const links = LOJA[caixa.dataset.links] || {};
    const ativos = Object.entries(links).filter(([, url]) => url && url.trim());
    caixa.replaceChildren();
    if (!ativos.length){
      const s = document.createElement("span");
      s.className = "embreve";
      s.textContent = l === "pt" ? "Em breve" : "Coming soon";
      caixa.append(s);
      return;
    }
    ativos.forEach(([loja, url], i) => {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      if (i > 0) a.className = "sec-link";
      a.textContent = (l === "pt" ? "Comprar na " : "Buy on ") + NOMES_LOJA[loja];
      caixa.append(a);
    });
  });
}

/* ---------- cabeçalho: fica sólido depois do topo ---------- */
function cabecalho(){
  const topo = document.getElementById("topo");
  const hero = document.getElementById("inicio");
  if (!topo || !hero) return;
  const atualiza = () => {
    const limite = hero.offsetHeight - topo.offsetHeight - 10;
    topo.classList.toggle("solido", window.scrollY > limite);
  };
  atualiza();
  window.addEventListener("scroll", atualiza, { passive: true });
  window.addEventListener("resize", atualiza);
}

/* ---------- menu do telemóvel ---------- */
function menuMovel(){
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  if (!burger || !menu) return;
  const fecha = () => { document.body.classList.remove("menu-aberto"); burger.setAttribute("aria-expanded", "false"); };
  burger.addEventListener("click", () => {
    const aberto = document.body.classList.toggle("menu-aberto");
    burger.setAttribute("aria-expanded", String(aberto));
  });
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", fecha));
  document.addEventListener("keydown", e => { if (e.key === "Escape") fecha(); });
}

/* ---------- aparecer ao fazer scroll ---------- */
function revelar(){
  const els = document.querySelectorAll(".revela");
  if (!("IntersectionObserver" in window)){ els.forEach(e => e.classList.add("visto")); return; }
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
      if (en.isIntersecting){ en.target.classList.add("visto"); obs.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach((e, i) => {
    e.style.transitionDelay = `${(i % 4) * 70}ms`;
    obs.observe(e);
  });
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
    const campos = ["nome", "email", "mensagem"];
    let ok = true;
    campos.forEach(c => {
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
    const corpo = l === "pt"
      ? `Olá Renata,\n\n${d.get("mensagem")}\n\n—\n${d.get("nome")}\n${d.get("email")}`
      : `Hi Renata,\n\n${d.get("mensagem")}\n\n—\n${d.get("nome")}\n${d.get("email")}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    nota.classList.add("ok");
    nota.textContent = l === "pt"
      ? `Abri o teu email com a mensagem pronta. Se não abriu, escreve diretamente para ${EMAIL}.`
      : `Your email app should now be open with the message ready. If not, write to ${EMAIL}.`;
  });
  form.addEventListener("input", e => e.target.classList?.remove("erro"));
}

/* ---------- arranque ---------- */
aplicaLingua(linguaInicial());

document.getElementById("lingua")?.addEventListener("click", () => {
  const nova = html.lang === "pt" ? "en" : "pt";
  guarda.escrever("rofi-lingua", nova);
  aplicaLingua(nova);
});

const ano = document.getElementById("ano");
if (ano) ano.textContent = new Date().getFullYear();
cabecalho();
menuMovel();
revelar();
formulario();
