# Rofi Studio — site

Site da Rofi Studio, feito a partir do Brand Book (setembro 2026).
Tem português e inglês (botão PT/EN no topo), funciona no telemóvel e não usa cookies.

## Ficheiros

| Ficheiro | O que é |
|---|---|
| `index.html` | Início: apresentação, estúdio, atalhos, cursos e Kalmia |
| `servicos.html` | Serviços e processo de trabalho |
| `loja.html` | Loja de templates |
| `contacto.html` | Formulário, email e Instagram |
| `css/style.css` | Cores, letras, objetos da marca, versão de telemóvel |
| `js/main.js` | Botão de idioma, menu, formulário e **links da loja** |
| `assets/` | Logótipos, favicon e imagem de partilha |

O botão **Portfolio** no menu abre diretamente `https://portfoliorenatasofia.framer.website` numa nova janela.
Se o endereço mudar, procura-o nos 4 ficheiros `.html` e troca-o.

Os textos em PT e EN estão lado a lado em cada página.

## Projetos (automático)

A lista de **Trabalho** no Início copia os projetos da página inicial do portfolio no Framer, pela mesma ordem.
Uma tarefa do GitHub (`.github/workflows/portfolio.yml`) corre todos os dias às 06:00, guarda a lista em `data/projetos.json` e republica o site se algo mudou.

- Para atualizar logo: GitHub → **Actions** → **Sincronizar projetos do portfolio** → **Run workflow**.
- Se a leitura falhar, o site mantém a última lista boa (ou os 5 projetos escritos no HTML).

## Pôr as fotos

As fotos aparecem sozinhas quando existirem com estes nomes (JPG, na vertical 4:5 para projetos, 5:4 para a loja):

| Pasta | Ficheiros |
|---|---|
| `assets/trabalhos/` | `aej.jpg`, `archa.jpg`, `quebramar.jpg`, `rofi.jpg`, `comissao.jpg` |
| `assets/loja/` | `ugc.jpg`, `insta.jpg`, `framer.jpg` |

Enquanto uma foto não existir, o site mostra uma composição gráfica da marca no lugar dela.

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
