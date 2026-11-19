# Meu GitHub — Portfólio

Site pessoal para reunir e apresentar os repositórios públicos do GitHub.

## Tecnologias
- HTML5
- CSS3
- JavaScript
- GitHub REST API

## Configuração
O projeto está configurado para buscar os repositórios públicos do usuário `bGarcia80`.

Se quiser utilizar outra conta, abra `script.js` e altere:

```js
const GITHUB_USERNAME = "bGarcia80";
```

## Executar localmente
Basta abrir o arquivo `index.html` no navegador. Para uma experiência mais próxima da publicação, você também pode utilizar a extensão Live Server do Visual Studio Code.

## Publicar com GitHub Pages
1. Crie um repositório chamado `bGarcia80.github.io`.
2. Envie os arquivos `index.html`, `style.css` e `script.js` para a raiz do repositório.
3. Em **Settings → Pages**, confira se a publicação está configurada para a branch `main` e a pasta `/ (root)`, caso essa opção seja solicitada.
4. Acesse `https://bGarcia80.github.io/`.

A API pública do GitHub possui limite de consultas para acessos não autenticados. Para um portfólio pessoal com tráfego moderado, normalmente não é necessário configurar um token.
