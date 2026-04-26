const state = {
  prompts: [],
  filtered: [],
  featuredOnly: false,
  query: "",
  workType: "",
  template: "",
  quality: "",
  activeReport: "",
  builderReady: false,
  builderPromptId: null,
  modalPromptMode: "translated",
  activePrompt: null
};

const REPORT_FILTERS = {
  production: {
    label: "生产级样本",
    description: "筛选质量评估为生产级的提示词，适合直接复用或作为高标准模板拆解。",
    href: "./reports/production-grade-prompts.md",
    matches: (prompt) => getAnalysis(prompt)?.qualityLabel === "生产级"
  },
  text: {
    label: "文字排版",
    description: "筛选包含文字、标题、标注、UI 文案或排版可读性要求的提示词。",
    href: "./reports/text-typography-prompts.md",
    matches: (prompt) => {
      const analysis = getAnalysis(prompt);
      const textRequirement = analysis?.textRequirement || "";
      return Boolean(
        analysis?.containsText ||
          (textRequirement && !/无明确|none/i.test(textRequirement))
      );
    }
  },
  reference: {
    label: "参考图",
    description: "筛选需要参考图、局部编辑、角色一致性或图像输入辅助的提示词。",
    href: "./reports/reference-image-prompts.md",
    matches: (prompt) =>
      Boolean(
        prompt.needReferenceImages ||
          prompt.referenceImages?.length ||
          /参考图|局部编辑|一致性|reference image|image input/i.test(getReportSummaryText(prompt))
      )
  },
  ui: {
    label: "UI/产品",
    description: "筛选 UI、产品、电商、SaaS 仪表盘和移动 App 截图相关提示词。",
    href: "./reports/ui-product-prompts.md",
    matches: (prompt) => {
      const analysis = getAnalysis(prompt);
      return Boolean(
        ["UI/界面", "产品/电商"].includes(analysis?.workType) ||
          ["SaaS 仪表盘", "移动 App 截图", "电商直播/UI 样机", "产品英雄图"].includes(analysis?.templateName)
      );
    }
  },
  visual: {
    label: "视觉语言库",
    description: "筛选具备明确风格、构图或光线镜头语言的提示词；词库报告可单独下载。",
    href: "./reports/visual-language-library.md",
    matches: (prompt) => {
      const analysis = getAnalysis(prompt);
      const visualTermCount =
        (analysis?.styleKeywords?.length || 0) +
        (analysis?.compositionPatterns?.length || 0) +
        (analysis?.lightingCamera?.length || 0);
      return visualTermCount >= 3;
    }
  }
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
  builderPanel: document.querySelector("#builder-panel"),
  builderMode: document.querySelector("#builder-mode"),
  builderTemplate: document.querySelector("#builder-template"),
  builderWorkType: document.querySelector("#builder-worktype"),
  builderAspect: document.querySelector("#builder-aspect"),
  builderPurpose: document.querySelector("#builder-purpose"),
  builderSubject: document.querySelector("#builder-subject"),
  builderScene: document.querySelector("#builder-scene"),
  builderComposition: document.querySelector("#builder-composition"),
  builderStyle: document.querySelector("#builder-style"),
  builderLighting: document.querySelector("#builder-lighting"),
  builderText: document.querySelector("#builder-text"),
  builderReference: document.querySelector("#builder-reference"),
  builderConstraints: document.querySelector("#builder-constraints"),
  builderOutput: document.querySelector("#builder-output"),
  builderScore: document.querySelector("#builder-score"),
  builderSourceLabel: document.querySelector("#builder-source-label"),
  copyBuilder: document.querySelector("#copy-builder"),
  filterBuilder: document.querySelector("#filter-builder"),
  resetBuilder: document.querySelector("#reset-builder"),
  reportButtons: document.querySelectorAll(".report-card"),
  clearReportFilter: document.querySelector("#clear-report-filter"),
  reportNote: document.querySelector("#report-note"),
  reportNoteTitle: document.querySelector("#report-note-title"),
  reportNoteDescription: document.querySelector("#report-note-description"),
  reportDownload: document.querySelector("#report-download"),
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
  modalRelated: document.querySelector("#modal-related"),
  modalPrompt: document.querySelector("#modal-prompt"),
  tabTranslated: document.querySelector("#tab-translated"),
  tabOriginal: document.querySelector("#tab-original"),
  closeModal: document.querySelector("#close-modal"),
  copyPrompt: document.querySelector("#copy-prompt"),
  copyTemplate: document.querySelector("#copy-template"),
  copyBreakdown: document.querySelector("#copy-breakdown"),
  useBuilder: document.querySelector("#use-builder")
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

function findPromptById(promptId) {
  return state.prompts.find((item) => String(item.id) === String(promptId));
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

function getReportSummaryText(prompt) {
  const analysis = getAnalysis(prompt);
  return [
    prompt.title,
    prompt.description,
    ...(prompt.categories || []),
    analysis?.workType,
    analysis?.subjectType,
    analysis?.templateName,
    analysis?.textRequirement,
    analysis?.breakdown?.creativeCore,
    analysis?.breakdown?.bestUse
  ]
    .filter(Boolean)
    .join("\n");
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
  showTemporaryLabel(button, "Copied");
}

function showTemporaryLabel(button, label) {
  const original = button.dataset.label || button.textContent || label;
  button.dataset.label = original;
  button.textContent = label;
  window.clearTimeout(button.copyResetTimer);
  button.copyResetTimer = window.setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

function isFeaturedPrompt(prompt) {
  return Boolean(getAnalysis(prompt)?.selected || prompt.featured);
}

function getActiveReport() {
  return state.activeReport ? REPORT_FILTERS[state.activeReport] : null;
}

function updateReportUi() {
  const activeReport = getActiveReport();

  elements.reportButtons.forEach((button) => {
    const reportId = button.dataset.report;
    const report = REPORT_FILTERS[reportId];
    const count = report ? state.prompts.filter(report.matches).length : 0;
    const countLabel = button.querySelector("[data-report-count]");

    button.classList.toggle("active", reportId === state.activeReport);
    button.setAttribute("aria-pressed", reportId === state.activeReport ? "true" : "false");

    if (countLabel) {
      countLabel.textContent = `${count} 条`;
    }
  });

  elements.clearReportFilter.classList.toggle("active", !state.activeReport);

  if (!activeReport) {
    elements.reportNote.classList.add("hidden");
    elements.reportDownload.href = "#";
    return;
  }

  elements.reportNote.classList.remove("hidden");
  elements.reportNoteTitle.textContent = activeReport.label;
  elements.reportNoteDescription.textContent = activeReport.description;
  elements.reportDownload.href = activeReport.href;
}

function setReportFilter(reportId) {
  state.activeReport = state.activeReport === reportId ? "" : reportId;
  updateReportUi();
  applyFilters();
}

function applyFilters() {
  const normalizedQuery = state.query.trim().toLowerCase();
  const queryTokens = normalizedQuery
    .split(/[\s,，;；、]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  state.filtered = state.prompts.filter((prompt) => {
    const analysis = getAnalysis(prompt);
    const activeReport = getActiveReport();

    if (activeReport && !activeReport.matches(prompt)) {
      return false;
    }

    if (state.featuredOnly && !isFeaturedPrompt(prompt)) {
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

    if (!queryTokens.length) {
      return true;
    }

    const searchText = getSearchText(prompt);
    return queryTokens.every((token) => searchText.includes(token));
  });

  renderCards();
}

function countValues(items, getValue) {
  const counts = new Map();

  for (const item of items) {
    const value = getValue(item);

    if (!value) {
      continue;
    }

    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return counts;
}

function addSelectOptions(select, values, counts = new Map()) {
  const current = select.value;
  select.querySelectorAll("option:not(:first-child)").forEach((option) => option.remove());

  for (const category of values) {
    const option = document.createElement("option");
    option.value = category;
    const count = counts.get(category);
    option.textContent = Number.isFinite(count) ? `${category} (${count})` : category;
    select.appendChild(option);
  }

  select.value = values.includes(current) ? current : "";
}

function renderFilterOptions() {
  const analyses = state.prompts.map(getAnalysis).filter(Boolean);
  const workTypeCounts = countValues(analyses, (analysis) => analysis.workType);
  const templateCounts = countValues(analyses, (analysis) =>
    analysis.templateId && analysis.templateName ? `${analysis.templateId} ${analysis.templateName}` : ""
  );
  const qualityCounts = countValues(analyses, (analysis) => analysis.qualityLabel);
  const workTypes = [...new Set(analyses.map((analysis) => analysis.workType))]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "zh-CN"));
  const templates = [...new Set(analyses.map((analysis) => `${analysis.templateId} ${analysis.templateName}`))]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "zh-CN"));
  const qualities = ["生产级", "标准型", "灵感型"].filter((quality) =>
    analyses.some((analysis) => analysis.qualityLabel === quality)
  );

  addSelectOptions(elements.workType, workTypes, workTypeCounts);
  addSelectOptions(elements.template, templates, templateCounts);
  addSelectOptions(elements.quality, qualities, qualityCounts);
  addSelectOptions(elements.builderWorkType, workTypes, workTypeCounts);
  addSelectOptions(elements.builderTemplate, templates, templateCounts);
}

function getBuilderValues() {
  return {
    mode: elements.builderMode.value,
    template: elements.builderTemplate.value,
    workType: elements.builderWorkType.value || "GPT Image 2 image",
    aspect: elements.builderAspect.value,
    purpose: elements.builderPurpose.value.trim() || "[用途/受众]",
    subject: elements.builderSubject.value.trim() || "[主体、数量、身份、动作]",
    scene: elements.builderScene.value.trim() || "[地点、时间、空间结构、背景元素]",
    composition: elements.builderComposition.value.trim() || "[画幅内布局、主体位置、景别、留白、层级]",
    style: elements.builderStyle.value.trim() || "[视觉语言、媒介、材质、色彩系统]",
    lighting: elements.builderLighting.value.trim() || "[光线方向、镜头质感、景深、渲染/摄影细节]",
    text: elements.builderText.value.trim() || "[是否含文字、精确文字、字体、字号、位置、可读性]",
    reference: elements.builderReference.value.trim() || "[参考图、编辑区域、需要保留/改变的内容]",
    constraints:
      elements.builderConstraints.value.trim() ||
      "clean, coherent, polished, readable hierarchy, no random text, no visual clutter"
  };
}

function getSelectedTemplateName(templateValue) {
  return templateValue || "自定义模板";
}

function buildPromptFromBuilder(values) {
  return `Generate a ${values.workType} image for ${values.purpose}. Aspect ratio: ${values.aspect}.

Template and intent:
${getSelectedTemplateName(values.template)}.

Subject:
${values.subject}.

Scene and background:
${values.scene}.

Composition and layout:
${values.composition}.

Visual style, materials, and color:
${values.style}.

Lighting, camera, and rendering:
${values.lighting}.

Text in the image:
${values.text}.

Reference or edit instructions:
${values.reference}.

Constraints:
${values.constraints}.`;
}

function scoreBuilderValues(values) {
  const fields = [
    values.template,
    values.workType !== "GPT Image 2 image" ? values.workType : "",
    values.purpose,
    values.subject,
    values.scene,
    values.composition,
    values.style,
    values.lighting,
    values.text,
    values.reference,
    values.constraints
  ].filter((value) => value && !/^\[.+\]$/.test(value));
  const score = Math.min(100, 28 + fields.length * 8 + (values.template ? 8 : 0));
  const label = score >= 75 ? "生产级" : score >= 50 ? "标准型" : "灵感型";

  return { score, label };
}

function getBuilderPrompt() {
  return state.builderPromptId ? findPromptById(state.builderPromptId) : null;
}

function getBuilderOutputText(values, prompt) {
  if (values.mode === "original" && prompt) {
    return getDisplayPromptText(prompt);
  }

  if (values.mode === "template" && prompt) {
    return getTemplateCopy(prompt);
  }

  return buildPromptFromBuilder(values);
}

function updateBuilderSourceLabel(prompt) {
  elements.builderSourceLabel.textContent = prompt ? prompt.title || `#${prompt.id}` : "自定义";
}

function updateBuilderOutput() {
  if (!elements.builderOutput) {
    return;
  }

  const values = getBuilderValues();
  const prompt = getBuilderPrompt();
  const result = scoreBuilderValues(values);
  elements.builderOutput.textContent = getBuilderOutputText(values, prompt);
  updateBuilderSourceLabel(prompt);

  if (values.mode === "original" && prompt) {
    const analysis = getAnalysis(prompt);
    elements.builderScore.textContent = analysis
      ? `原提示词 ${analysis.qualityLabel} ${analysis.score}/100`
      : "原提示词";
    return;
  }

  if (values.mode === "template" && prompt) {
    elements.builderScore.textContent = "生产模板";
    return;
  }

  elements.builderScore.textContent = `${result.label} ${result.score}/100`;
}

function fillBuilderFromPrompt(promptId) {
  const prompt = findPromptById(promptId);
  const analysis = prompt ? getAnalysis(prompt) : null;

  if (!prompt || !analysis) {
    return;
  }

  state.builderPromptId = String(prompt.id);
  elements.builderMode.value = "original";
  elements.builderTemplate.value = `${analysis.templateId} ${analysis.templateName}`;
  elements.builderWorkType.value = analysis.workType || "";
  elements.builderPurpose.value = analysis.breakdown?.bestUse || prompt.description || "";
  elements.builderSubject.value = analysis.breakdown?.subject || [analysis.subjectType, prompt.title].filter(Boolean).join("：");
  elements.builderScene.value = analysis.breakdown?.scene || prompt.description || analysis.workType || "";
  elements.builderComposition.value = listText(analysis.compositionPatterns);
  elements.builderStyle.value = listText(analysis.styleKeywords);
  elements.builderLighting.value = listText(analysis.lightingCamera);
  elements.builderText.value = analysis.textRequirement || "";
  elements.builderReference.value = prompt.needReferenceImages
    ? "Use the provided reference image(s) to preserve identity, composition, and visual details."
    : "";
  elements.builderConstraints.value = listText(analysis.failureRisks) || elements.builderConstraints.value;
  updateBuilderOutput();
  elements.builderPanel?.setAttribute("open", "");
}

function resetBuilder() {
  state.builderPromptId = null;
  elements.builderMode.value = "structured";
  elements.builderTemplate.value = "";
  elements.builderWorkType.value = "";
  elements.builderAspect.value = "1:1 square";
  elements.builderPurpose.value = "";
  elements.builderSubject.value = "";
  elements.builderScene.value = "";
  elements.builderComposition.value = "";
  elements.builderStyle.value = "";
  elements.builderLighting.value = "";
  elements.builderText.value = "";
  elements.builderReference.value = "";
  elements.builderConstraints.value =
    "clean, coherent, polished, readable hierarchy, no random text, no visual clutter";
  updateBuilderOutput();
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
  const activeReport = getActiveReport();
  elements.resultsCount.textContent = activeReport
    ? `${activeReport.label}：${state.filtered.length} / ${state.prompts.length}`
    : `${state.filtered.length} / ${state.prompts.length}`;
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
          ${isFeaturedPrompt(prompt) ? `<span class="badge card-badge">TOP</span>` : ""}
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
        analysis
          ? `<div class="card-actions">
              <button class="copy-button card-builder" type="button" data-id="${escapeHtml(prompt.id)}">Builder</button>
            </div>`
          : ""
      }
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
    article.querySelector(".card-builder")?.addEventListener("click", (event) => {
      event.stopPropagation();
      fillBuilderFromPrompt(event.currentTarget.dataset.id);
      showTemporaryLabel(event.currentTarget, "Added");
    });
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

function applyMediaAspect(element, width, height) {
  if (!element || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return;
  }

  const ratio = width / height;
  element.style.setProperty("--media-aspect-ratio", `${width} / ${height}`);
  element.classList.toggle("is-portrait", ratio < 0.85);
  element.classList.toggle("is-square", ratio >= 0.85 && ratio <= 1.15);
}

function renderModalMedia(prompt) {
  const images = prompt.media?.length ? prompt.media : prompt.mediaThumbnails || [];

  if (!images.length) {
    elements.modalMedia.innerHTML = `<div class="modal-placeholder">No preview</div>`;
    return;
  }

  elements.modalMedia.innerHTML = `
    <div class="modal-media-shell">
      <div class="modal-media-stage">
        <img src="${escapeHtml(images[0])}" alt="${escapeHtml(prompt.title)}" />
      </div>
    </div>
    ${
      images.length > 1
        ? `<div class="image-strip">${images
            .slice(0, 6)
            .map(
              (image, index) =>
                `<button type="button" data-src="${escapeHtml(image)}" aria-label="Image ${index + 1}" ${
                  index === 0 ? `class="active"` : ""
                }>
                  <img src="${escapeHtml(image)}" alt="" loading="lazy" />
                </button>`
            )
            .join("")}</div>`
        : ""
    }
  `;

  const stage = elements.modalMedia.querySelector(".modal-media-stage");
  const mainImage = elements.modalMedia.querySelector(".modal-media-stage img");
  mainImage.addEventListener("load", () => {
    applyMediaAspect(stage, mainImage.naturalWidth, mainImage.naturalHeight);
  });
  elements.modalMedia.querySelectorAll(".image-strip button").forEach((button) => {
    button.addEventListener("click", () => {
      mainImage.src = button.dataset.src;
      button.parentElement
        .querySelectorAll("button")
        .forEach((item) => item.classList.toggle("active", item === button));
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

function renderModalRelated(prompt) {
  const analysis = getAnalysis(prompt);
  const similarPrompts = (analysis?.similarPromptIds || [])
    .map(findPromptById)
    .filter(Boolean)
    .slice(0, 6);

  if (!similarPrompts.length) {
    elements.modalRelated.innerHTML = "";
    elements.modalRelated.classList.add("hidden");
    return;
  }

  elements.modalRelated.classList.remove("hidden");
  elements.modalRelated.innerHTML = `
    <h3>Similar Prompts</h3>
    <div class="related-list">
      ${similarPrompts
        .map((item) => {
          const itemAnalysis = getAnalysis(item);
          return `
            <button class="related-item" type="button" data-id="${escapeHtml(String(item.id))}">
              <span>${escapeHtml(item.title || "Untitled")}</span>
              <small>${escapeHtml(itemAnalysis?.templateName || "")} · ${escapeHtml(itemAnalysis?.qualityLabel || "")}</small>
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  elements.modalRelated.querySelectorAll(".related-item").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.id));
  });
}

function openModal(promptId) {
  const prompt = state.prompts.find((item) => String(item.id) === String(promptId));

  if (!prompt) {
    return;
  }

  state.activePrompt = prompt;
  state.modalPromptMode = prompt.translatedPrompt ? "translated" : "original";
  renderModalMedia(prompt);
  elements.modalBadge.classList.toggle("hidden", !isFeaturedPrompt(prompt));
  elements.modalBadge.textContent = getAnalysis(prompt)?.selected
    ? `TOP ${getAnalysis(prompt)?.rank || ""}`.trim()
    : "FEATURED";
  elements.modalLanguage.textContent = prompt.language || "unknown";
  elements.modalDate.textContent = formatDate(prompt.sourcePublishedAt);
  elements.modalTitle.textContent = prompt.title || "";
  elements.modalDescription.textContent = prompt.description || "";
  renderModalAnalysis(prompt);
  renderModalRelated(prompt);
  elements.modalYoumind.href = prompt.detailUrl || "#";
  elements.modalSource.href = prompt.sourceLink || "#";
  elements.modalSource.classList.toggle("disabled", !prompt.sourceLink);
  renderPromptTabs();
  if (!elements.modal.open) {
    elements.modal.showModal();
  }
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
    state.activeReport = "";
    elements.search.value = "";
    elements.workType.value = "";
    elements.template.value = "";
    elements.quality.value = "";
    elements.toggleFeatured.classList.remove("active");
    updateReportUi();
    applyFilters();
  });

  elements.reportButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setReportFilter(button.dataset.report);
    });
  });

  elements.clearReportFilter.addEventListener("click", () => {
    state.activeReport = "";
    updateReportUi();
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

  [
    elements.builderMode,
    elements.builderTemplate,
    elements.builderWorkType,
    elements.builderAspect,
    elements.builderPurpose,
    elements.builderSubject,
    elements.builderScene,
    elements.builderComposition,
    elements.builderStyle,
    elements.builderLighting,
    elements.builderText,
    elements.builderReference,
    elements.builderConstraints
  ].forEach((element) => {
    element.addEventListener("input", updateBuilderOutput);
    element.addEventListener("change", updateBuilderOutput);
  });

  elements.copyBuilder.addEventListener("click", async () => {
    await writeClipboardText(elements.builderOutput.textContent || "");
    showCopied(elements.copyBuilder);
  });

  elements.filterBuilder.addEventListener("click", () => {
    const values = getBuilderValues();
    const queryTerms = [
      values.subject,
      values.scene,
      values.composition,
      values.style,
      values.lighting,
      values.text,
      values.reference
    ].filter((value) => value && !/^\[.+\]$/.test(value));
    state.workType = elements.builderWorkType.value;
    state.template = elements.builderTemplate.value;
    state.query = queryTerms.join(" ");
    elements.workType.value = state.workType;
    elements.template.value = state.template;
    elements.search.value = state.query;
    applyFilters();
  });

  elements.resetBuilder.addEventListener("click", resetBuilder);

  elements.useBuilder.addEventListener("click", () => {
    if (state.activePrompt) {
      fillBuilderFromPrompt(state.activePrompt.id);
      closeModal();
    }
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
  elements.featured.textContent = String(
    payload.analysis?.selectedCount ?? prompts.filter((prompt) => isFeaturedPrompt(prompt)).length
  );
  elements.source.textContent = payload.dataSourceLabel || payload.dataSource || "Unknown";
  elements.sync.textContent = formatDate(payload.generatedAt);
  renderFilterOptions();
  updateReportUi();
  resetBuilder();
  renderCards();
}

init().catch((error) => {
  console.error(error);
  elements.resultsCount.textContent = "加载失败";
  elements.empty.classList.remove("hidden");
});
