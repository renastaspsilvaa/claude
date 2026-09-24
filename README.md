# Rofi Studio — site

Site de uma página da Rofi Studio, feito a partir do Brand Book (setembro 2026).
Tem português e inglês (botão PT/EN no topo), funciona no telemóvel e não usa cookies.

## Ficheiros

| Ficheiro | O que é |
|---|---|
| `index.html` | Todos os textos do site (PT e EN lado a lado) |
| `css/style.css` | Cores, letras, objetos da marca, versão de telemóvel |
| `js/main.js` | Botão de idioma, menu, formulário e **links da loja** |
| `assets/` | Logótipos, favicon e imagem de partilha |

## Pôr os links da loja

Abre `js/main.js` e preenche o bloco `LOJA` no topo:

```js
const LOJA = {
  ugc:    { etsy: "https://www.etsy.com/listing/...", gumroad: "https://....gumroad.com/l/..." },
  insta:  { etsy: "", gumroad: "" },
  framer: { framer: "", gumroad: "" },
};
```

Enquanto um link estiver vazio, o site mostra "Em breve" em vez de um botão partido.

## Publicar (grátis, ~5 minutos)

1. No GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**.
2. Escolhe o ramo e a pasta `/ (root)` → **Save**. Em 1–2 minutos fica online em `https://renastaspsilvaa.github.io/claude/`.
3. Para usar `rofistudios.com`: em **Settings → Pages → Custom domain** escreve `rofistudios.com`; depois, no sítio onde compraste o domínio, cria os registos DNS que o GitHub indicar (4 registos `A` e um `CNAME` para `www`). Ativa **Enforce HTTPS** quando aparecer.

Alternativa: arrastar a pasta para [Netlify Drop](https://app.netlify.com/drop) — também é grátis.
