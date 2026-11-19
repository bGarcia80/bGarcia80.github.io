const GITHUB_USERNAME = "bGarcia80";
const API_BASE = "https://api.github.com";

// Repositórios completamente ocultos do portfólio (não aparecem em nenhuma aba)
const HIDDEN_REPOS = [
  `${GITHUB_USERNAME.toLowerCase()}.github.io`
];

// Repositórios que aparecem na aba geral, mas são ignorados no filtro/redirecionamento de GitHub Pages
const EXCLUDED_PAGES_REPOS = [
  "binario_tech"
];

const repoGrid = document.getElementById("repo-grid");
const statusMessage = document.getElementById("repo-status");
const searchInput = document.getElementById("search-input");
const languageFilter = document.getElementById("language-filter");
const sortFilter = document.getElementById("sort-filter");
const emptyState = document.getElementById("empty-state");
const tabButtons = document.querySelectorAll(".repo-tab");
const sectionEyebrow = document.getElementById("section-eyebrow");
const sectionTitle = document.getElementById("section-title");
const sectionSubtitle = document.getElementById("section-subtitle");

let repositories = [];
let activeTab = "all"; // "all" | "pages"

const languageColors = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#663399",
  Python: "#3572A5",
  PHP: "#4F5D95",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Shell: "#89e051"
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function isHiddenRepo(repo) {
  return HIDDEN_REPOS.includes((repo.name || "").toLowerCase());
}

function isExcludedFromPages(repo) {
  return EXCLUDED_PAGES_REPOS.includes((repo.name || "").toLowerCase());
}

// Verifica se o repositório usa HTML ou possui GitHub Pages ativado (ignorando exceções)
function hasHtmlOrPages(repo) {
  if (isHiddenRepo(repo) || isExcludedFromPages(repo)) return false;

  const isHtml = (repo.language || "").toLowerCase() === "html";
  const hasPages = Boolean(repo.has_pages);
  const hasPagesHomepage = Boolean(
    repo.homepage && repo.homepage.toLowerCase().includes("github.io")
  );
  return hasPages || isHtml || hasPagesHomepage;
}

// Monta a URL de redirecionamento do GitHub Pages somente para repositórios válidos
function getGitHubPagesUrl(repo) {
  if (!hasHtmlOrPages(repo)) return null;

  if (repo.homepage && /^https?:\/\//i.test(repo.homepage.trim())) {
    return repo.homepage.trim();
  }
  return `https://${GITHUB_USERNAME}.github.io/${encodeURIComponent(repo.name)}/`;
}

function getPagesRepos() {
  return repositories.filter(hasHtmlOrPages);
}

function updateStats(profile, repos) {
  const pagesRepos = repos.filter(hasHtmlOrPages);
  document.getElementById("repo-count").textContent = repos.length;
  document.getElementById("pages-count").textContent = pagesRepos.length;
  document.getElementById("star-count").textContent = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  document.getElementById("profile-followers").textContent = profile.followers ?? 0;

  document.getElementById("tab-count-all").textContent = repos.length;
  document.getElementById("tab-count-pages").textContent = pagesRepos.length;
}

function populateLanguages(repos) {
  const previousValue = languageFilter.value;
  const languages = [...new Set(repos.map(repo => repo.language).filter(Boolean))].sort();

  languageFilter.innerHTML = '<option value="">Todas as linguagens</option>';
  languages.forEach(language => {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = language;
    languageFilter.appendChild(option);
  });

  if (languages.includes(previousValue)) {
    languageFilter.value = previousValue;
  } else {
    languageFilter.value = "";
  }
}

function setActiveTab(tab) {
  activeTab = tab;

  tabButtons.forEach(button => {
    const isSelected = button.dataset.tab === tab;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
  });

  if (tab === "pages") {
    sectionEyebrow.textContent = "APLICAÇÕES WEB & SITES";
    sectionTitle.innerHTML = 'GitHub Pages &amp; HTML<span class="heading-period">.</span>';
    sectionSubtitle.textContent = "Clique em qualquer projeto para abrir diretamente a página hospedada no GitHub Pages em uma nova aba.";
    populateLanguages(getPagesRepos());
  } else {
    sectionEyebrow.textContent = "MEU TRABALHO";
    sectionTitle.innerHTML = 'Repositórios<span class="heading-period">.</span>';
    sectionSubtitle.textContent = "Uma seleção dinâmica dos meus projetos públicos no GitHub.";
    populateLanguages(repositories);
  }

  renderRepositories();
}

function renderRepositories() {
  const search = searchInput.value.trim().toLowerCase();
  const selectedLanguage = languageFilter.value;
  const sortBy = sortFilter.value;

  const baseList = activeTab === "pages" ? getPagesRepos() : repositories;

  let filtered = baseList.filter(repo => {
    const matchesSearch =
      repo.name.toLowerCase().includes(search) ||
      (repo.description || "").toLowerCase().includes(search);
    const matchesLanguage = !selectedLanguage || repo.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  if (sortBy === "stars") filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
  else if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  else filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  repoGrid.innerHTML = filtered.map(repo => {
    const language = repo.language || "Não especificada";
    const color = languageColors[language] || "#9b91ff";
    const isPagesProject = hasHtmlOrPages(repo);
    const pagesUrl = getGitHubPagesUrl(repo);
    const displayPagesUrl = pagesUrl ? pagesUrl.replace(/^https?:\/\//i, "") : "";
    const primaryUrl = activeTab === "pages" && pagesUrl ? pagesUrl : repo.html_url;

    const badgeLabel = repo.has_pages ? "GITHUB PAGES" : "HTML";

    return `
      <article class="repo-card ${activeTab === "pages" ? "is-pages-card" : ""}" data-primary-url="${escapeHTML(primaryUrl)}">
        <div class="repo-top">
          <span class="repo-icon">${activeTab === "pages" ? "🌐" : "⌘"}</span>
          <div class="repo-badges">
            ${isPagesProject ? `<span class="pages-badge">${badgeLabel}</span>` : ""}
            <span class="repo-visibility">PÚBLICO</span>
          </div>
        </div>

        <h3 class="repo-name">${escapeHTML(repo.name)}</h3>
        <p class="repo-description">${escapeHTML(repo.description || "Este repositório ainda não possui uma descrição.")}</p>

        ${isPagesProject && pagesUrl && activeTab === "pages" ? `
          <a class="pages-url-preview" href="${escapeHTML(pagesUrl)}" target="_blank" rel="noopener noreferrer" title="Abrir ${escapeHTML(pagesUrl)}">
            <span>↗</span>
            <span>${escapeHTML(displayPagesUrl)}</span>
          </a>
        ` : ""}

        <div class="repo-meta">
          <span class="repo-language"><i class="language-dot" style="--language-color:${color}"></i>${escapeHTML(language)}</span>
          <span class="stars">☆ ${repo.stargazers_count}</span>
          <span class="repo-updated">${formatDate(repo.updated_at)}</span>
        </div>

        <div class="repo-card-actions">
          ${activeTab === "pages" && pagesUrl ? `
            <a class="card-link card-link-pages" href="${escapeHTML(pagesUrl)}" target="_blank" rel="noopener noreferrer">Abrir GitHub Pages ↗</a>
            <a class="card-link" href="${escapeHTML(repo.html_url)}" target="_blank" rel="noopener noreferrer">Código ↗</a>
          ` : `
            <a class="card-link" href="${escapeHTML(repo.html_url)}" target="_blank" rel="noopener noreferrer">Repositório ↗</a>
            ${isPagesProject && pagesUrl ? `<a class="card-link card-link-pages" href="${escapeHTML(pagesUrl)}" target="_blank" rel="noopener noreferrer">GitHub Pages ↗</a>` : ""}
          `}
        </div>
      </article>`;
  }).join("");

  emptyState.hidden = filtered.length !== 0;

  if (!repositories.length) {
    statusMessage.textContent = "";
    return;
  }

  const label = activeTab === "pages"
    ? (filtered.length === 1 ? "site encontrado" : "sites encontrados")
    : (filtered.length === 1 ? "repositório encontrado" : "repositórios encontrados");

  statusMessage.textContent = `${filtered.length} ${label}`;
}

// Abre a URL principal em uma nova aba ao clicar no card (sem interferir nos botões internos)
repoGrid.addEventListener("click", event => {
  if (event.target.closest("a")) return;
  const card = event.target.closest(".repo-card");
  if (card && card.dataset.primaryUrl) {
    window.open(card.dataset.primaryUrl, "_blank", "noopener,noreferrer");
  }
});

// Alterna entre as abas "Repositórios" e "GitHub Pages & HTML"
tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);
  });
});

// Atalhos do menu superior e do hero que já abrem a aba correspondente
document.querySelectorAll("[data-nav-tab]").forEach(link => {
  link.addEventListener("click", () => {
    setActiveTab(link.dataset.navTab);
  });
});

async function loadGitHubData() {
  statusMessage.textContent = "Carregando seus repositórios...";
  try {
    const headers = { "Accept": "application/vnd.github+json" };
    const profileResponse = await fetch(`${API_BASE}/users/${GITHUB_USERNAME}`, { headers });

    if (!profileResponse.ok) {
      if (profileResponse.status === 404) {
        throw new Error("Não foi possível encontrar o perfil informado no GitHub.");
      }
      throw new Error("Não foi possível carregar os dados do perfil.");
    }

    const profile = await profileResponse.json();
    repositories = [];
    let page = 1;
    while (true) {
      const reposResponse = await fetch(
        `${API_BASE}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&page=${page}`,
        { headers }
      );
      if (!reposResponse.ok) {
        if (reposResponse.status === 403) {
          throw new Error("O limite temporário de consultas à API do GitHub foi atingido. Tente novamente em alguns minutos.");
        }
        throw new Error("Não foi possível carregar os repositórios do GitHub.");
      }
      const pageRepos = await reposResponse.json();
      const visibleRepos = pageRepos.filter(repo => !isHiddenRepo(repo));
      repositories.push(...visibleRepos);
      if (pageRepos.length < 100) break;
      page += 1;
    }

    updateStats(profile, repositories);
    setActiveTab(activeTab);
  } catch (error) {
    statusMessage.textContent = error.message;
    repoGrid.innerHTML = "";
  }
}

searchInput.addEventListener("input", renderRepositories);
languageFilter.addEventListener("change", renderRepositories);
sortFilter.addEventListener("change", renderRepositories);

document.addEventListener("keydown", event => {
  if (event.key === "/" && document.activeElement !== searchInput) {
    event.preventDefault();
    searchInput.focus();
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
loadGitHubData();