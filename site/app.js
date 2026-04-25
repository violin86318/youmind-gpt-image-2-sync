const state = {
  prompts: [],
  filtered: [],
  featuredOnly: false,
  query: "",
  category: "",
  modalPromptMode: "translated",
  activePrompt: null
};

const elements = {
  total: document.querySelector("#stat-total"),
  featured: document.querySelector("#stat-featured"),
  sync: document.querySelector("#stat-sync"),
  source: document.querySelector("#stat-source"),
  search: document.querySelector("#search-input"),
  category: document.querySelector("#category-select"),
  clear: document.querySelector("#clear-search"),
  toggleFeatured: document.querySelector("#toggle-featured"),
  resultsCount: document.querySelector("#results-count"),
  cards: document.querySelector("#cards"),
  empty: document.querySelector("#empty-state"),
  modal: document.querySelector("#detail-modal"),
  modalMedia: document.querySelector("#modal-media"),
  modalBadge: document.querySelector("#modal-badge"),
  modalLanguage: document.querySelector("#modal-language"),
  modalDate: document.querySelector("#modal-date"),
  modalTitle: document.querySelector("#modal-title"),
  modalDescription: document.querySelector("#modal-description"),
  modalYoumind: document.querySelector("#modal-youmind"),
  modalSource: document.querySelector("#modal-source"),
  modalPrompt: document.querySelector("#modal-prompt"),
  tabTranslated: document.querySelector("#tab-translated"),
  tabOriginal: document.querySelector("#tab-original"),
  closeModal: document.querySelector("#close-modal"),
  copyPrompt: document.querySelector("#copy-prompt")
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(isoString) {
  if (!isoString) {
    return "Unknown";
  }

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return isoString;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function getDisplayPromptText(prompt) {
  return prompt.translatedPrompt || prompt.prompt || "";
}

function getActivePromptText() {
  if (!state.activePrompt) {
    return "";
  }

  return state.modalPromptMode === "translated"
    ? state.activePrompt.translatedPrompt || state.activePrompt.prompt || ""
    : state.activePrompt.prompt || state.activePrompt.translatedPrompt || "";
}

function getSearchText(prompt) {
  return [
    prompt.id,
    prompt.title,
    prompt.description,
    prompt.authorName,
    prompt.sourcePlatform,
    ...(prompt.categories || []),
    prompt.prompt,
    prompt.translatedPrompt
  ]
    .join("\n")
    .toLowerCase();
}

function getPreviewImage(prompt) {
  return prompt.thumbnailUrl || prompt.mediaThumbnails?.[0] || prompt.media?.[0] || "";
}

async function writeClipboardText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the textarea fallback.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function showCopied(button) {
  const original = button.dataset.label || button.textContent || "Copy";
  button.dataset.label = original;
  button.textContent = "Copied";
  window.clearTimeout(button.copyResetTimer);
  button.copyResetTimer = window.setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

function applyFilters() {
  const normalizedQuery = state.query.trim().toLowerCase();

  state.filtered = state.prompts.filter((prompt) => {
    if (state.featuredOnly && !prompt.featured) {
      return false;
    }

    if (state.category && !(prompt.categories || []).includes(state.category)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return getSearchText(prompt).includes(normalizedQuery);
  });

  renderCards();
}

function renderCategoryOptions() {
  const categories = [...new Set(state.prompts.flatMap((prompt) => prompt.categories || []))]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "zh-CN"));

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.category.appendChild(option);
  }
}

function renderCards() {
  elements.resultsCount.textContent = `${state.filtered.length} / ${state.prompts.length}`;
  elements.cards.innerHTML = "";

  if (state.filtered.length === 0) {
    elements.empty.classList.remove("hidden");
    return;
  }

  elements.empty.classList.add("hidden");

  const fragment = document.createDocumentFragment();

  for (const prompt of state.filtered) {
    const image = getPreviewImage(prompt);
    const promptText = getDisplayPromptText(prompt);
    const article = document.createElement("article");
    article.className = "prompt-card";
    article.innerHTML = `
      <button class="card-button" type="button" data-id="${escapeHtml(prompt.id)}">
        <div class="thumb">
          ${
            image
              ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(prompt.title)}" loading="lazy" />`
              : `<div class="placeholder"></div>`
          }
          ${prompt.featured ? `<span class="badge card-badge">FEATURED</span>` : ""}
        </div>
        <div class="card-body">
          <p class="card-meta">${escapeHtml(prompt.authorName || "Unknown")} · ${escapeHtml(
            formatDate(prompt.sourcePublishedAt)
          )}</p>
          <h2>${escapeHtml(prompt.title)}</h2>
          <p>${escapeHtml(prompt.description || "")}</p>
        </div>
      </button>
      ${
        promptText
          ? `<div class="card-prompt">
              <pre>${escapeHtml(promptText)}</pre>
              <button class="copy-button card-copy" type="button" data-id="${escapeHtml(prompt.id)}">Copy</button>
            </div>`
          : ""
      }
    `;

    article.querySelector(".card-button").addEventListener("click", () => openModal(prompt.id));
    article.querySelector(".card-copy")?.addEventListener("click", async (event) => {
      event.stopPropagation();
      await writeClipboardText(promptText);
      showCopied(event.currentTarget);
    });

    fragment.appendChild(article);
  }

  elements.cards.appendChild(fragment);
}

function renderModalMedia(prompt) {
  const images = prompt.media?.length ? prompt.media : prompt.mediaThumbnails || [];

  if (!images.length) {
    elements.modalMedia.innerHTML = `<div class="modal-placeholder"></div>`;
    return;
  }

  elements.modalMedia.innerHTML = `
    <img src="${escapeHtml(images[0])}" alt="${escapeHtml(prompt.title)}" />
    ${
      images.length > 1
        ? `<div class="image-strip">${images
            .slice(0, 6)
            .map(
              (image, index) =>
                `<button type="button" data-src="${escapeHtml(image)}" aria-label="Image ${index + 1}">
                  <img src="${escapeHtml(image)}" alt="" loading="lazy" />
                </button>`
            )
            .join("")}</div>`
        : ""
    }
  `;

  const mainImage = elements.modalMedia.querySelector(":scope > img");
  elements.modalMedia.querySelectorAll(".image-strip button").forEach((button) => {
    button.addEventListener("click", () => {
      mainImage.src = button.dataset.src;
    });
  });
}

function renderPromptTabs() {
  elements.modalPrompt.textContent = getActivePromptText();
  elements.tabTranslated.classList.toggle("active", state.modalPromptMode === "translated");
  elements.tabOriginal.classList.toggle("active", state.modalPromptMode === "original");
}

function openModal(promptId) {
  const prompt = state.prompts.find((item) => String(item.id) === String(promptId));

  if (!prompt) {
    return;
  }

  state.activePrompt = prompt;
  state.modalPromptMode = prompt.translatedPrompt ? "translated" : "original";
  renderModalMedia(prompt);
  elements.modalBadge.classList.toggle("hidden", !prompt.featured);
  elements.modalLanguage.textContent = prompt.language || "unknown";
  elements.modalDate.textContent = formatDate(prompt.sourcePublishedAt);
  elements.modalTitle.textContent = prompt.title || "";
  elements.modalDescription.textContent = prompt.description || "";
  elements.modalYoumind.href = prompt.detailUrl || "#";
  elements.modalSource.href = prompt.sourceLink || "#";
  elements.modalSource.classList.toggle("disabled", !prompt.sourceLink);
  renderPromptTabs();
  elements.modal.showModal();
}

function closeModal() {
  elements.modal.close();
}

function bindEvents() {
  elements.search.addEventListener("input", (event) => {
    state.query = event.target.value;
    applyFilters();
  });

  elements.category.addEventListener("change", (event) => {
    state.category = event.target.value;
    applyFilters();
  });

  elements.toggleFeatured.addEventListener("click", () => {
    state.featuredOnly = !state.featuredOnly;
    elements.toggleFeatured.classList.toggle("active", state.featuredOnly);
    applyFilters();
  });

  elements.clear.addEventListener("click", () => {
    state.query = "";
    state.category = "";
    state.featuredOnly = false;
    elements.search.value = "";
    elements.category.value = "";
    elements.toggleFeatured.classList.remove("active");
    applyFilters();
  });

  elements.closeModal.addEventListener("click", closeModal);
  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      closeModal();
    }
  });

  elements.tabTranslated.addEventListener("click", () => {
    state.modalPromptMode = "translated";
    renderPromptTabs();
  });

  elements.tabOriginal.addEventListener("click", () => {
    state.modalPromptMode = "original";
    renderPromptTabs();
  });

  elements.copyPrompt.addEventListener("click", async () => {
    await writeClipboardText(getActivePromptText());
    showCopied(elements.copyPrompt);
  });
}

async function init() {
  bindEvents();

  const response = await fetch("./data/prompts.json");

  if (!response.ok) {
    throw new Error(`Failed to load site data: ${response.status}`);
  }

  const payload = await response.json();
  const prompts = payload.prompts.slice().sort((left, right) => {
    const leftTime = Date.parse(left.sourcePublishedAt || "");
    const rightTime = Date.parse(right.sourcePublishedAt || "");
    return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
  });

  state.prompts = prompts;
  state.filtered = prompts;
  elements.total.textContent = String(payload.total ?? prompts.length);
  elements.featured.textContent = String(prompts.filter((prompt) => prompt.featured).length);
  elements.source.textContent = payload.dataSourceLabel || payload.dataSource || "Unknown";
  elements.sync.textContent = formatDate(payload.generatedAt);
  renderCategoryOptions();
  renderCards();
}

init().catch((error) => {
  console.error(error);
  elements.resultsCount.textContent = "加载失败";
  elements.empty.classList.remove("hidden");
});
