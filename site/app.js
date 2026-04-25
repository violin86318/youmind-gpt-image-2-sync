const state = {
  prompts: [],
  filtered: [],
  featuredOnly: false,
  query: "",
  workType: "",
  template: "",
  quality: "",
  modalPromptMode: "translated",
  activePrompt: null
};

const elements = {
  total: document.querySelector("#stat-total"),
  featured: document.querySelector("#stat-featured"),
  sync: document.querySelector("#stat-sync"),
  source: document.querySelector("#stat-source"),
  search: document.querySelector("#search-input"),
  workType: document.querySelector("#worktype-select"),
  template: document.querySelector("#template-select"),
  quality: document.querySelector("#quality-select"),
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
  modalAnalysis: document.querySelector("#modal-analysis"),
  modalPrompt: document.querySelector("#modal-prompt"),
  tabTranslated: document.querySelector("#tab-translated"),
  tabOriginal: document.querySelector("#tab-original"),
  closeModal: document.querySelector("#close-modal"),
  copyPrompt: document.querySelector("#copy-prompt"),
  copyTemplate: document.querySelector("#copy-template"),
  copyBreakdown: document.querySelector("#copy-breakdown")
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

function getAnalysis(prompt) {
  return prompt.analysis || null;
}

function listText(items) {
  return (items || []).filter(Boolean).join(", ");
}

function getTemplateCopy(prompt) {
  const analysis = getAnalysis(prompt);
  return analysis?.copyTemplate || getDisplayPromptText(prompt);
}

function getBreakdownCopy(prompt) {
  const analysis = getAnalysis(prompt);

  if (!analysis?.breakdown) {
    return [
      `标题：${prompt.title || ""}`,
      `描述：${prompt.description || ""}`,
      `提示词：${getDisplayPromptText(prompt)}`
    ].join("\n");
  }

  const breakdown = analysis.breakdown;
  return [
    `标题：${prompt.title || ""}`,
    `模板：${analysis.templateId} ${analysis.templateName}`,
    `质量：${analysis.qualityLabel} / ${analysis.score}`,
    `创意内核：${breakdown.creativeCore || ""}`,
    `主体：${breakdown.subject || ""}`,
    `场景/类型：${breakdown.scene || ""}`,
    `构图：${listText(breakdown.composition) || "未明确"}`,
    `风格：${listText(breakdown.style) || "未明确"}`,
    `光线镜头：${listText(breakdown.lightingCamera) || "未明确"}`,
    `文字要求：${breakdown.text || "无明确文字要求"}`,
    `风险/约束：${listText(breakdown.constraints) || "无"}`,
    `适合用途：${breakdown.bestUse || ""}`
  ].join("\n");
}

function getSearchText(prompt) {
  return [
    prompt.id,
    prompt.title,
    prompt.description,
    prompt.authorName,
    prompt.sourcePlatform,
    ...(prompt.categories || []),
    prompt.analysis?.workType,
    prompt.analysis?.subjectType,
    prompt.analysis?.templateName,
    prompt.analysis?.qualityLabel,
    ...(prompt.analysis?.compositionPatterns || []),
    ...(prompt.analysis?.styleKeywords || []),
    ...(prompt.analysis?.lightingCamera || []),
    ...(prompt.analysis?.modules || []),
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
    const analysis = getAnalysis(prompt);

    if (state.featuredOnly && !analysis?.selected) {
      return false;
    }

    if (state.workType && analysis?.workType !== state.workType) {
      return false;
    }

    if (state.template && `${analysis?.templateId} ${analysis?.templateName}` !== state.template) {
      return false;
    }

    if (state.quality && analysis?.qualityLabel !== state.quality) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return getSearchText(prompt).includes(normalizedQuery);
  });

  renderCards();
}

function addSelectOptions(select, values) {
  const current = select.value;
  select.querySelectorAll("option:not(:first-child)").forEach((option) => option.remove());

  for (const category of values) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  }

  select.value = values.includes(current) ? current : "";
}

function renderFilterOptions() {
  const analyses = state.prompts.map(getAnalysis).filter(Boolean);
  const workTypes = [...new Set(analyses.map((analysis) => analysis.workType))]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "zh-CN"));
  const templates = [...new Set(analyses.map((analysis) => `${analysis.templateId} ${analysis.templateName}`))]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "zh-CN"));
  const qualities = ["生产级", "标准型", "灵感型"].filter((quality) =>
    analyses.some((analysis) => analysis.qualityLabel === quality)
  );

  addSelectOptions(elements.workType, workTypes);
  addSelectOptions(elements.template, templates);
  addSelectOptions(elements.quality, qualities);
}

function renderChips(items, className = "") {
  return (items || [])
    .filter(Boolean)
    .slice(0, 6)
    .map((item) => `<span class="chip ${className}">${escapeHtml(item)}</span>`)
    .join("");
}

function renderAnalysisSummary(prompt) {
  const analysis = getAnalysis(prompt);

  if (!analysis) {
    return "";
  }

  return `
    <div class="analysis-summary">
      <div class="score-block">
        <strong>${escapeHtml(String(analysis.score || 0))}</strong>
        <span>${escapeHtml(analysis.qualityLabel || "")}</span>
      </div>
      <div class="analysis-lines">
        <p>${escapeHtml(analysis.templateId)} · ${escapeHtml(analysis.templateName)}</p>
        <div class="chip-row">
          ${analysis.selected ? `<span class="chip accent">Top ${escapeHtml(String(analysis.rank))}</span>` : ""}
          <span class="chip">${escapeHtml(analysis.workType || "")}</span>
          ${renderChips(analysis.compositionPatterns)}
          ${renderChips(analysis.styleKeywords)}
        </div>
      </div>
    </div>
  `;
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
    const analysis = getAnalysis(prompt);
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
          ${renderAnalysisSummary(prompt)}
        </div>
      </button>
      ${
        promptText
          ? `<div class="card-prompt">
              <pre>${escapeHtml(promptText)}</pre>
              <div class="card-copy-row">
                <button class="copy-button card-copy" type="button" data-id="${escapeHtml(prompt.id)}">Prompt</button>
                ${
                  analysis?.copyTemplate
                    ? `<button class="copy-button card-template-copy" type="button" data-id="${escapeHtml(prompt.id)}">Template</button>`
                    : ""
                }
              </div>
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
    article.querySelector(".card-template-copy")?.addEventListener("click", async (event) => {
      event.stopPropagation();
      await writeClipboardText(getTemplateCopy(prompt));
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

function renderModalAnalysis(prompt) {
  const analysis = getAnalysis(prompt);

  if (!analysis) {
    elements.modalAnalysis.innerHTML = "";
    elements.modalAnalysis.classList.add("hidden");
    return;
  }

  const breakdown = analysis.breakdown || {};
  elements.modalAnalysis.classList.remove("hidden");
  elements.modalAnalysis.innerHTML = `
    <div class="analysis-head">
      <div class="score-block large">
        <strong>${escapeHtml(String(analysis.score || 0))}</strong>
        <span>${escapeHtml(analysis.qualityLabel || "")}</span>
      </div>
      <div>
        <p>${escapeHtml(analysis.templateId)} · ${escapeHtml(analysis.templateName)}</p>
        <div class="chip-row">
          ${analysis.selected ? `<span class="chip accent">Top ${escapeHtml(String(analysis.rank))}</span>` : ""}
          <span class="chip">${escapeHtml(analysis.workType || "")}</span>
          <span class="chip">${escapeHtml(analysis.subjectType || "")}</span>
          ${renderChips(analysis.modules, "soft")}
        </div>
      </div>
    </div>
    <dl class="breakdown-grid">
      <div><dt>创意内核</dt><dd>${escapeHtml(breakdown.creativeCore || "")}</dd></div>
      <div><dt>构图</dt><dd>${escapeHtml(listText(analysis.compositionPatterns) || "未明确")}</dd></div>
      <div><dt>风格</dt><dd>${escapeHtml(listText(analysis.styleKeywords) || "未明确")}</dd></div>
      <div><dt>光线镜头</dt><dd>${escapeHtml(listText(analysis.lightingCamera) || "未明确")}</dd></div>
      <div><dt>文字要求</dt><dd>${escapeHtml(analysis.textRequirement || "无明确文字要求")}</dd></div>
      <div><dt>失败风险</dt><dd>${escapeHtml(listText(analysis.failureRisks) || "无")}</dd></div>
      <div><dt>适合用途</dt><dd>${escapeHtml(breakdown.bestUse || "")}</dd></div>
      <div><dt>入选理由</dt><dd>${escapeHtml(breakdown.whySelected || "非 Top 100 样本，但已完成结构分析。")}</dd></div>
    </dl>
  `;
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
  renderModalAnalysis(prompt);
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

  elements.workType.addEventListener("change", (event) => {
    state.workType = event.target.value;
    applyFilters();
  });

  elements.template.addEventListener("change", (event) => {
    state.template = event.target.value;
    applyFilters();
  });

  elements.quality.addEventListener("change", (event) => {
    state.quality = event.target.value;
    applyFilters();
  });

  elements.toggleFeatured.addEventListener("click", () => {
    state.featuredOnly = !state.featuredOnly;
    elements.toggleFeatured.classList.toggle("active", state.featuredOnly);
    applyFilters();
  });

  elements.clear.addEventListener("click", () => {
    state.query = "";
    state.workType = "";
    state.template = "";
    state.quality = "";
    state.featuredOnly = false;
    elements.search.value = "";
    elements.workType.value = "";
    elements.template.value = "";
    elements.quality.value = "";
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

  elements.copyTemplate.addEventListener("click", async () => {
    await writeClipboardText(getTemplateCopy(state.activePrompt));
    showCopied(elements.copyTemplate);
  });

  elements.copyBreakdown.addEventListener("click", async () => {
    await writeClipboardText(getBreakdownCopy(state.activePrompt));
    showCopied(elements.copyBreakdown);
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
  elements.featured.textContent = String(payload.analysis?.selectedCount ?? prompts.filter((prompt) => prompt.featured).length);
  elements.source.textContent = payload.dataSourceLabel || payload.dataSource || "Unknown";
  elements.sync.textContent = formatDate(payload.generatedAt);
  renderFilterOptions();
  renderCards();
}

init().catch((error) => {
  console.error(error);
  elements.resultsCount.textContent = "加载失败";
  elements.empty.classList.remove("hidden");
});
