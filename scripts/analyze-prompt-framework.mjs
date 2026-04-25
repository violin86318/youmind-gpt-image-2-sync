import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "site/data/prompts.json");
const OUT_DIR = path.join(ROOT, "analysis");

const OFFICIAL_SOURCES = [
  {
    title: "OpenAI Image generation guide",
    url: "https://developers.openai.com/api/docs/guides/image-generation"
  },
  {
    title: "OpenAI Images and vision guide",
    url: "https://developers.openai.com/api/docs/guides/images-vision"
  },
  {
    title: "Creating images in ChatGPT",
    url: "https://help.openai.com/en/articles/8932459-image-generation"
  },
  {
    title: "Introducing image generation in the API",
    url: "https://openai.com/index/image-generation-api/"
  },
  {
    title: "ChatGPT Images 2.0 system card",
    url: "https://deploymentsafety.openai.com/chatgpt-images-2-0/chatgpt-images-2-0.pdf"
  }
];

const WORK_TYPE_TERMS = {
  "海报/封面": ["poster", "cover", "key visual", "campaign", "billboard", "album", "movie poster", "海报", "封面"],
  "UI/界面": ["ui", "interface", "dashboard", "app screen", "screenshot", "website", "landing page", "web app", "界面"],
  "产品/电商": ["product", "packaging", "e-commerce", "mockup", "product shot", "advertisement", "商品", "包装"],
  "人物/角色": ["character", "portrait", "full-body", "girl", "boy", "man", "woman", "person", "cosplay", "角色"],
  "信息图/图解": ["infographic", "diagram", "flowchart", "annotation", "callout", "exploded view", "图解"],
  "摄影/真实场景": ["photo", "photograph", "photorealistic", "realistic", "camera", "lens", "film photography", "摄影"],
  "插画/漫画": ["illustration", "anime", "manga", "cartoon", "watercolor", "children's book", "comic", "插画"],
  "字体/Logo": ["typography", "logo", "lettering", "font", "calligraphy", "icon", "text treatment", "字体"],
  "空间/场景": ["scene", "city", "room", "interior", "street", "landscape", "environment", "architecture", "空间"],
  "图标/贴纸": ["icon", "sticker", "emoji", "badge", "mascot"]
};

const SUBJECT_TERMS = {
  人物: ["character", "portrait", "person", "girl", "boy", "man", "woman", "people", "cosplay"],
  产品: ["product", "device", "packaging", "bottle", "phone", "headset", "shoe", "car"],
  界面: ["ui", "interface", "dashboard", "app", "website", "screen"],
  空间: ["room", "city", "street", "interior", "landscape", "architecture", "store"],
  文字符号: ["typography", "logo", "lettering", "font", "calligraphy", "icon"],
  信息结构: ["diagram", "infographic", "flowchart", "map", "timeline", "labels"],
  食物: ["food", "meal", "restaurant", "recipe", "drink", "dessert"],
  服饰: ["fashion", "outfit", "dress", "uniform", "streetwear", "costume"]
};

const COMPOSITION_TERMS = [
  "centered",
  "symmetrical",
  "close-up",
  "wide shot",
  "full-body",
  "top-down",
  "isometric",
  "grid",
  "2x2",
  "poster layout",
  "hero shot",
  "exploded view",
  "cutaway",
  "split screen",
  "front-facing",
  "rule of thirds",
  "annotations",
  "callout",
  "layered",
  "vertical",
  "horizontal"
];

const STYLE_TERMS = [
  "realistic",
  "photorealistic",
  "cinematic",
  "editorial",
  "anime",
  "manga",
  "3d",
  "minimalist",
  "vintage",
  "retro",
  "sci-fi",
  "fantasy",
  "watercolor",
  "oil painting",
  "pixel art",
  "isometric",
  "documentary",
  "luxury",
  "premium",
  "hand-drawn",
  "ink wash",
  "studio",
  "ligne claire"
];

const LIGHTING_TERMS = [
  "studio lighting",
  "natural light",
  "soft light",
  "dramatic lighting",
  "rim light",
  "backlight",
  "neon",
  "golden hour",
  "overcast",
  "volumetric",
  "high contrast",
  "low contrast",
  "shallow depth",
  "depth of field",
  "film grain",
  "lens",
  "camera"
];

const MODULE_TERMS = [
  "subject",
  "style",
  "layout",
  "composition",
  "background",
  "lighting",
  "camera",
  "color",
  "palette",
  "typography",
  "text",
  "details",
  "mood",
  "materials",
  "negative",
  "include",
  "avoid",
  "exactly",
  "legible"
];

const TEMPLATE_DEFINITIONS = [
  {
    id: "T01",
    name: "电影感人物肖像",
    match: ["portrait", "character portrait", "headshot", "face close-up", "close-up portrait"],
    use: "人物头像、社媒头像、角色主视觉、个人品牌照",
    structure: "身份 + 表情姿态 + 服饰细节 + 场景氛围 + 镜头光线 + 质感",
    variables: ["人物身份", "情绪", "服装", "背景", "镜头", "光线"],
    skeleton:
      "Create a cinematic portrait of [人物身份], [表情/姿态], wearing [服装与材质]. Place them in [背景/时代/空间]. Use [镜头/景别], [光线], [色调]. Emphasize [面部细节/质感/情绪]. Avoid distorted facial features and random text."
  },
  {
    id: "T02",
    name: "全身角色设定",
    match: ["full-body", "character", "outfit", "front-facing", "character sheet"],
    use: "游戏角色、IP 形象、Cosplay、职业角色设定",
    structure: "角色身份 + 全身姿态 + 服装道具 + 比例 + 背景简化 + 可复用设定",
    variables: ["角色职业", "姿态", "服饰", "道具", "比例", "背景"],
    skeleton:
      "Create a full-body character design of [角色职业/身份], standing [姿态]. Include [服装层次], [关键道具], [发型/表情]. Use [风格] with clean proportions and readable silhouette. Plain or lightly textured background, no extra text."
  },
  {
    id: "T03",
    name: "动作漫画/动漫场景",
    match: ["anime action", "manga action", "battle", "attack", "sword", "motion lines", "dynamic pose"],
    use: "动漫分镜、战斗场景、运动瞬间、夸张叙事图",
    structure: "冲突动作 + 速度线/动态构图 + 角色位置 + 镜头角度 + 氛围特效",
    variables: ["动作", "角色数量", "冲突关系", "镜头角度", "特效", "画风"],
    skeleton:
      "Create a dynamic [anime/manga] action scene showing [角色/主体] performing [动作]. Use [镜头角度], strong diagonal composition, motion lines, dramatic lighting, and [特效]. Keep anatomy coherent and the main action instantly readable."
  },
  {
    id: "T04",
    name: "编辑感海报主视觉",
    match: ["poster", "editorial", "campaign", "key visual", "headline"],
    use: "活动海报、品牌主视觉、展览宣传、社媒封面",
    structure: "主题 + 主视觉 + 标题区 + 信息层级 + 版式 + 色彩系统",
    variables: ["主题", "主视觉", "标题", "副文案", "版式", "色彩"],
    skeleton:
      "Design an editorial poster for [主题/活动]. Main visual: [主体]. Layout: [标题位置], [副文案区域], [信息层级]. Style: [视觉风格], [色彩系统], [材质]. Text must be legible and limited to the exact words: [文字]."
  },
  {
    id: "T05",
    name: "电影/专辑封面",
    match: ["movie poster", "album", "cover", "title", "cinematic"],
    use: "电影海报、音乐封面、书籍封面、播客封面",
    structure: "类型感 + 主角/符号 + 标题字 + 副标题 + 氛围 + 留白",
    variables: ["作品类型", "标题", "主角或符号", "氛围", "字体", "留白"],
    skeleton:
      "Create a [电影/专辑/书籍] cover titled [标题]. Feature [主角/核心符号] in [氛围场景]. Use [类型风格], strong title typography, clear hierarchy, and [色彩]. No extra words beyond [允许文字]."
  },
  {
    id: "T06",
    name: "产品英雄图",
    match: ["product shot", "product", "hero shot", "studio lighting", "premium"],
    use: "产品首图、广告图、电商详情页首屏",
    structure: "产品 + 角度 + 材质 + 背景 + 灯光 + 卖点氛围",
    variables: ["产品", "角度", "材质", "背景", "灯光", "品牌调性"],
    skeleton:
      "Create a premium product hero shot of [产品], shown from [角度]. Emphasize [材质/工艺/细节]. Background: [背景]. Lighting: [灯光]. Mood: [品牌调性]. Clean composition, sharp focus, no unwanted labels."
  },
  {
    id: "T07",
    name: "爆炸视图/结构图解",
    match: ["exploded view", "cutaway", "diagram", "callout", "component"],
    use: "硬件拆解、产品卖点、技术说明、科普图",
    structure: "对象 + 分层结构 + 标注数量 + 左右说明 + 技术质感",
    variables: ["对象", "组件层数", "标注数量", "文案", "风格", "背景"],
    skeleton:
      "Create an exploded-view technical diagram poster of [对象]. Show [组件层数] separated layers with [标注数量] clean callout labels. Use [风格], precise spacing, readable labels, and a clear centerline. Keep every label short and legible."
  },
  {
    id: "T08",
    name: "电商直播/UI 样机",
    match: ["e-commerce", "livestream", "ui", "mockup", "app screen"],
    use: "直播带货界面、社交电商、移动端商品页",
    structure: "设备框 + 页面模块 + 商品信息 + 交互按钮 + 真实运营密度",
    variables: ["设备", "页面类型", "商品", "模块", "按钮", "品牌风格"],
    skeleton:
      "Create a realistic [设备] UI mockup for [页面类型]. Include [商品/内容], [顶部导航], [主视觉], [信息卡片], [CTA buttons], and [互动元素]. Keep layout dense but organized, with legible UI text and coherent spacing."
  },
  {
    id: "T09",
    name: "SaaS 仪表盘",
    match: ["dashboard", "saas", "analytics", "interface", "data"],
    use: "B2B 产品概念图、后台系统、数据看板",
    structure: "业务场景 + 导航 + 数据卡片 + 图表 + 状态 + 视觉系统",
    variables: ["业务", "导航", "指标", "图表", "状态", "色彩"],
    skeleton:
      "Design a SaaS dashboard interface for [业务场景]. Include [左侧导航], [顶部筛选], [关键指标卡], [图表], [表格/任务列表]. Use [视觉系统], compact spacing, legible labels, and realistic data density."
  },
  {
    id: "T10",
    name: "移动 App 截图",
    match: ["mobile app", "app screen", "iphone", "screenshot", "interface"],
    use: "App Store 截图、产品概念、移动工具界面",
    structure: "手机设备 + 页面目标 + 组件状态 + 内容层级 + 手势/反馈",
    variables: ["App 类型", "页面", "组件", "内容", "状态", "设备"],
    skeleton:
      "Create a polished mobile app screenshot for [App 类型], showing [页面]. Include [组件], [内容列表/卡片], [状态/反馈], and [CTA]. Use [设计语言]. Keep text short, aligned, and readable."
  },
  {
    id: "T11",
    name: "百科信息图卡",
    match: ["infographic", "encyclopedia", "annotations", "labels", "diagram"],
    use: "知识卡片、科普图、社媒长图、教学材料",
    structure: "中心对象 + 分区模块 + 标注 + 数据/事实 + 图标系统",
    variables: ["主题", "中心对象", "模块", "标注", "数据", "图标风格"],
    skeleton:
      "Create an encyclopedia-style infographic about [主题]. Center: [对象]. Surround it with [模块数量] labeled sections, concise facts, small icons, and clean dividers. Use [风格]. All labels must be readable and minimal."
  },
  {
    id: "T12",
    name: "流程图/步骤图",
    match: ["flowchart", "process", "step", "timeline", "diagram"],
    use: "教程流程、方法论、商业流程、食谱步骤",
    structure: "步骤数量 + 节点 + 箭头 + 分支 + 输出结果",
    variables: ["流程主题", "步骤", "节点", "箭头", "分支", "色彩"],
    skeleton:
      "Create a clean flowchart explaining [流程主题]. Use [步骤数量] numbered steps with arrows, concise labels, and [图标/插图]. Layout: [横向/纵向/环形]. Keep text short and hierarchy obvious."
  },
  {
    id: "T13",
    name: "地图/空间导览",
    match: ["map", "city", "top-down", "route", "food map"],
    use: "城市美食地图、活动导览、园区地图、旅行视觉",
    structure: "俯视地图 + 地标 + 路线 + 图标 + 标注 + 地域风格",
    variables: ["城市/空间", "地标", "路线", "图标", "标注", "风格"],
    skeleton:
      "Create a [手绘/信息图] map of [城市/空间]. Include [地标数量] landmarks, [路线/区域], small illustrated icons, and readable labels. Use [地域风格/色彩], top-down composition, and clear visual hierarchy."
  },
  {
    id: "T14",
    name: "杂志编辑版式",
    match: ["magazine", "editorial", "spread", "layout", "cover story"],
    use: "杂志封面、专题页、品牌刊物、人物专访视觉",
    structure: "封面人物/对象 + 栏目文字 + 网格 + 摄影/插画 + 出版质感",
    variables: ["刊物主题", "主图", "标题", "栏目", "网格", "质感"],
    skeleton:
      "Design a magazine-style editorial layout for [刊物主题]. Main image: [主图]. Use [网格系统], [标题], [栏目文字], and [出版风格]. Keep typography refined, aligned, and limited to exact text."
  },
  {
    id: "T15",
    name: "Logo/字体实验",
    match: ["logo", "typography", "lettering", "font", "calligraphy"],
    use: "品牌字标、标题字、活动视觉、字体风格探索",
    structure: "文字 + 字形特征 + 材质/文化风格 + 背景 + 禁止额外文字",
    variables: ["文字", "字形", "材质", "文化风格", "背景", "用途"],
    skeleton:
      "Create a typography/logo treatment for the exact text [文字]. Style the letters with [字形特征], [材质/文化风格], and [色彩]. Plain background. The only readable text should be [文字]."
  },
  {
    id: "T16",
    name: "图标/贴纸套组",
    match: ["icon set", "icons", "sticker", "emoji", "badge", "mascot"],
    use: "图标包、贴纸、表情、产品功能图标",
    structure: "数量 + 网格 + 统一风格 + 单个对象 + 背景/描边",
    variables: ["数量", "主题", "对象列表", "网格", "风格", "背景"],
    skeleton:
      "Create a cohesive set of [数量] [icons/stickers] about [主题], arranged in a clean [网格]. Each item shows [对象列表]. Use consistent [风格], stroke, lighting, and background. No extra text."
  },
  {
    id: "T17",
    name: "2x2 对比/系列图",
    match: ["2x2", "grid", "comparison", "four panels", "variants"],
    use: "风格对比、产品系列、前后对照、角色变体",
    structure: "四宫格 + 每格变量 + 统一构图 + 可比性 + 标签",
    variables: ["对比维度", "四个变体", "统一元素", "标签", "风格"],
    skeleton:
      "Create a 2x2 comparison grid showing [对比维度]. Each panel features [四个变体]. Keep [统一元素] consistent across panels. Add short readable labels if needed. Use [风格] and balanced spacing."
  },
  {
    id: "T18",
    name: "等距 3D 空间",
    match: ["isometric", "3d", "miniature", "room", "city"],
    use: "空间概念、建筑场景、游戏场景、产品场景盒子",
    structure: "空间盒子 + 主体 + 分区 + 材质 + 俯视角 + 小细节",
    variables: ["空间", "主体", "分区", "材质", "细节", "色彩"],
    skeleton:
      "Create an isometric 3D miniature scene of [空间]. Include [主体], [分区], [道具细节], and [材质]. Use a clean top-down isometric angle, soft shadows, and [色彩]. Keep the scene readable at thumbnail size."
  },
  {
    id: "T19",
    name: "复古真实摄影",
    match: ["vintage", "film photography", "documentary", "photograph", "grain"],
    use: "怀旧照片、纪实场景、人物生活方式、品牌氛围图",
    structure: "真实事件 + 年代/地点 + 胶片质感 + 光线 + 不完美细节",
    variables: ["事件", "年代", "地点", "人物", "光线", "胶片质感"],
    skeleton:
      "Create a realistic vintage film photograph of [事件/主体] in [年代/地点]. Use [人物/环境细节], natural imperfections, [光线], subtle film grain, and [色调]. Avoid overly polished CGI appearance."
  },
  {
    id: "T20",
    name: "文化节日/地域视觉",
    match: ["festival", "traditional", "cultural", "oriental", "japanese", "chinese", "heritage"],
    use: "节日海报、城市印象、传统文化视觉、地域品牌",
    structure: "文化主题 + 符号 + 地域场景 + 现代版式 + 色彩与纹样",
    variables: ["文化主题", "符号", "场景", "版式", "纹样", "色彩"],
    skeleton:
      "Create a contemporary visual poster for [文化主题]. Combine [传统符号], [地域场景], [现代版式], [纹样], and [色彩]. Keep the design respectful, clear, and visually coherent."
  }
];

const TEMPLATE_WORK_TYPES = {
  T01: "人物/角色",
  T02: "人物/角色",
  T03: "插画/漫画",
  T04: "海报/封面",
  T05: "海报/封面",
  T06: "产品/电商",
  T07: "信息图/图解",
  T08: "UI/界面",
  T09: "UI/界面",
  T10: "UI/界面",
  T11: "信息图/图解",
  T12: "信息图/图解",
  T13: "信息图/图解",
  T14: "海报/封面",
  T15: "字体/Logo",
  T16: "图标/贴纸",
  T17: "综合视觉",
  T18: "空间/场景",
  T19: "摄影/真实场景",
  T20: "海报/封面"
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function loadData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function promptText(prompt) {
  return [
    prompt.title,
    prompt.description,
    prompt.prompt,
    prompt.translatedPrompt,
    (prompt.categories || []).join(" ")
  ]
    .filter(Boolean)
    .join("\n");
}

function countMatches(text, terms) {
  const lower = normalizeText(text);
  return terms.filter((term) => lower.includes(normalizeText(term))).length;
}

function listMatches(text, terms, limit = 8) {
  const lower = normalizeText(text);
  return terms
    .filter((term) => lower.includes(normalizeText(term)))
    .slice(0, limit);
}

function topCategory(text, groups, fallback) {
  const ranked = Object.entries(groups)
    .map(([name, terms]) => ({ name, count: countMatches(text, terms) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return ranked[0]?.count > 0 ? ranked[0].name : fallback;
}

function hasTextRequirement(text) {
  const terms = [
    "text",
    "typography",
    "logo",
    "title",
    "headline",
    "subtitle",
    "label",
    "callout",
    "caption",
    "readable",
    "legible",
    "exact"
  ];
  return countMatches(text, terms) > 0;
}

function summarizeTextRequirement(text) {
  const lower = normalizeText(text);
  const notes = [];

  if (lower.includes("exact")) notes.push("要求精确文字");
  if (lower.includes("legible") || lower.includes("readable")) notes.push("要求可读");
  if (lower.includes("no text") || lower.includes("without text")) notes.push("禁止额外文字");
  if (lower.includes("label") || lower.includes("callout")) notes.push("包含标注/说明");
  if (lower.includes("typography") || lower.includes("logo")) notes.push("文字是主视觉");

  return notes.length > 0 ? notes.join("；") : "包含文字或排版元素";
}

function scorePrompt(prompt, analysis) {
  const source = prompt.prompt || "";
  const text = promptText(prompt);
  const length = source.length;
  const lengthScore =
    length >= 800 && length <= 2800
      ? 26
      : length >= 450 && length < 800
        ? 18
        : length > 2800 && length <= 3800
          ? 18
          : length > 3800
            ? 10
            : 6;
  const moduleScore = Math.min(36, countMatches(text, MODULE_TERMS) * 3);
  const compositionScore = Math.min(14, analysis.compositionPatterns.length * 3);
  const styleScore = Math.min(12, analysis.styleKeywords.length * 2);
  const directiveScore = Math.min(
    12,
    countMatches(text, ["include", "exactly", "must", "avoid", "no ", "without", "legible"]) * 2
  );
  const structureScore =
    source.trim().startsWith("{") || source.includes("\n") || source.includes(":") ? 10 : 2;

  return Math.round(lengthScore + moduleScore + compositionScore + styleScore + directiveScore + structureScore);
}

function templateForPrompt(text) {
  const ranked = TEMPLATE_DEFINITIONS.map((template) => ({
    template,
    count: countMatches(text, template.match)
  })).sort((a, b) => b.count - a.count || a.template.id.localeCompare(b.template.id));

  return ranked[0].count > 0 ? ranked[0].template : TEMPLATE_DEFINITIONS[0];
}

function analyzePrompt(prompt) {
  const text = promptText(prompt);
  const template = templateForPrompt(text);
  const workType = TEMPLATE_WORK_TYPES[template.id] || topCategory(text, WORK_TYPE_TERMS, "综合视觉");
  const subjectType = topCategory(text, SUBJECT_TERMS, "综合主体");
  const compositionPatterns = listMatches(text, COMPOSITION_TERMS, 7);
  const styleKeywords = listMatches(text, STYLE_TERMS, 7);
  const lightingCamera = listMatches(text, LIGHTING_TERMS, 6);
  const containsText = hasTextRequirement(text);
  const failureRisks = [];

  if (containsText) failureRisks.push("文字可读性/准确拼写");
  if (["UI/界面", "信息图/图解"].includes(workType)) failureRisks.push("结构化布局精度");
  if (workType === "人物/角色") failureRisks.push("手部/比例/面部一致性");
  if (compositionPatterns.some((item) => ["grid", "2x2", "exploded view", "callout"].includes(item))) {
    failureRisks.push("元素位置与数量控制");
  }
  if (styleKeywords.includes("photorealistic") || styleKeywords.includes("realistic")) {
    failureRisks.push("过度真实导致细节瑕疵显眼");
  }

  const analysis = {
    workType,
    subjectType,
    compositionPatterns,
    styleKeywords,
    lightingCamera,
    containsText,
    textRequirement: containsText ? summarizeTextRequirement(text) : "无明确文字要求",
    templateId: template.id,
    templateName: template.name,
    failureRisks: [...new Set(failureRisks)]
  };

  return {
    ...analysis,
    score: scorePrompt(prompt, analysis)
  };
}

function selectHighValuePrompts(prompts) {
  const analyzed = prompts.map((prompt) => ({
    id: String(prompt.id),
    title: prompt.title || "",
    description: prompt.description || "",
    detailUrl: prompt.detailUrl || "",
    sourceLink: prompt.sourceLink || "",
    promptLength: (prompt.prompt || "").length,
    promptExcerpt: (prompt.prompt || "").replace(/\s+/g, " ").slice(0, 360),
    ...analyzePrompt(prompt)
  }));

  const byId = new Map(analyzed.map((entry) => [entry.id, entry]));
  const selected = [];
  const selectedIds = new Set();

  for (const template of TEMPLATE_DEFINITIONS) {
    const candidates = analyzed
      .filter((entry) => entry.templateId === template.id)
      .sort((a, b) => b.score - a.score || b.promptLength - a.promptLength)
      .slice(0, 5);

    for (const candidate of candidates) {
      if (!selectedIds.has(candidate.id)) {
        selected.push(candidate);
        selectedIds.add(candidate.id);
      }
    }
  }

  const fallback = analyzed
    .filter((entry) => !selectedIds.has(entry.id))
    .sort((a, b) => b.score - a.score || b.promptLength - a.promptLength);

  for (const entry of fallback) {
    if (selected.length >= 100) break;
    selected.push(entry);
    selectedIds.add(entry.id);
  }

  return selected
    .slice(0, 100)
    .sort((a, b) => b.score - a.score || a.templateId.localeCompare(b.templateId))
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
      whySelected: [
        `得分 ${entry.score}`,
        entry.compositionPatterns.length ? `构图: ${entry.compositionPatterns.join(", ")}` : "",
        entry.styleKeywords.length ? `风格: ${entry.styleKeywords.join(", ")}` : "",
        entry.containsText ? entry.textRequirement : ""
      ]
        .filter(Boolean)
        .join("；")
    }))
    .map((entry) => byId.get(entry.id) ? entry : entry);
}

function escapeCsv(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function writeCsv(filePath, rows) {
  const headers = [
    "rank",
    "id",
    "title",
    "score",
    "workType",
    "subjectType",
    "templateId",
    "templateName",
    "compositionPatterns",
    "styleKeywords",
    "lightingCamera",
    "containsText",
    "textRequirement",
    "failureRisks",
    "detailUrl",
    "whySelected"
  ];
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = Array.isArray(row[header]) ? row[header].join("; ") : row[header];
          return escapeCsv(value);
        })
        .join(",")
    )
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
}

function summarizeDataset(prompts) {
  const promptLengths = prompts.map((prompt) => (prompt.prompt || "").length).sort((a, b) => a - b);
  const quantile = (q) => promptLengths[Math.floor((promptLengths.length - 1) * q)] || 0;
  const workCounts = {};
  const templateCounts = {};
  const styleCounts = {};
  const compositionCounts = {};

  for (const prompt of prompts) {
    const analysis = analyzePrompt(prompt);
    workCounts[analysis.workType] = (workCounts[analysis.workType] || 0) + 1;
    templateCounts[analysis.templateName] = (templateCounts[analysis.templateName] || 0) + 1;
    for (const style of analysis.styleKeywords) {
      styleCounts[style] = (styleCounts[style] || 0) + 1;
    }
    for (const pattern of analysis.compositionPatterns) {
      compositionCounts[pattern] = (compositionCounts[pattern] || 0) + 1;
    }
  }

  const top = (object, limit = 12) =>
    Object.entries(object)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, limit);

  return {
    count: prompts.length,
    lengthStats: {
      min: promptLengths[0],
      p25: quantile(0.25),
      median: quantile(0.5),
      p75: quantile(0.75),
      p90: quantile(0.9),
      max: promptLengths[promptLengths.length - 1]
    },
    workCounts: top(workCounts, 12),
    templateCounts: top(templateCounts, 20),
    styleCounts: top(styleCounts, 16),
    compositionCounts: top(compositionCounts, 16)
  };
}

function tableRows(rows) {
  return rows.map(([name, count]) => `| ${name} | ${count} |`).join("\n");
}

function writeResearchNotes(data, summary, selected) {
  const selectedTemplateCounts = Object.entries(
    selected.reduce((acc, row) => {
      acc[row.templateName] = (acc[row.templateName] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const content = `# GPT Image 2 提示词调研与样本分析

生成时间：${new Date().toISOString()}

## 调研结论

1. GPT Image 2 的强项是多模态理解、指令跟随、真实世界知识、细节编辑和文本渲染；这意味着提示词应该写成“视觉规格书”，而不是只堆风格词。
2. 官方文档提醒了几个稳定风险：复杂提示可能增加延迟；文本位置和清晰度仍可能失败；连续角色、品牌元素的一致性需要额外控制；结构化布局的精确摆放仍需明确约束。
3. 对创作工作流更有效的做法是先用低质量/小尺寸快速迭代，定稿时再提高质量和尺寸；如果需要编辑参考图，输入图像会增加成本。
4. 本项目 2168 条样本的主流写法不是短 prompt，而是包含主体、构图、风格、光线、文字、布局、负面约束的长规格。
5. 高价值样本通常具备三个特征：任务类型清晰、版式/构图可执行、失败风险被提前约束。

## 官方资料来源

${OFFICIAL_SOURCES.map((source) => `- [${source.title}](${source.url})`).join("\n")}

## 数据概览

- 数据来源：${data.dataSourceLabel || data.dataSource || "unknown"}
- 样本总数：${summary.count}
- 提示词长度：min ${summary.lengthStats.min} / p25 ${summary.lengthStats.p25} / median ${summary.lengthStats.median} / p75 ${summary.lengthStats.p75} / p90 ${summary.lengthStats.p90} / max ${summary.lengthStats.max}

## 作品类型分布

| 类型 | 数量 |
| --- | ---: |
${tableRows(summary.workCounts)}

## 高频风格词

| 风格 | 数量 |
| --- | ---: |
${tableRows(summary.styleCounts)}

## 高频构图词

| 构图 | 数量 |
| --- | ---: |
${tableRows(summary.compositionCounts)}

## 100 条样本覆盖的模板

| 模板 | 样本数 |
| --- | ---: |
${tableRows(selectedTemplateCounts)}

## 分析口径

这次分析把提示词拆成 8 个模块：

- 创作目标：海报、UI、产品图、角色、信息图、摄影、字体、图标等。
- 主体：人物、产品、空间、界面、文字、信息结构。
- 场景：地点、时间、环境、叙事上下文。
- 构图：居中、对称、近景、全身、俯视、等距、网格、爆炸视图、标注。
- 风格：真实、电影感、编辑感、动漫、3D、复古、极简、水彩、科幻等。
- 光线镜头：棚拍、自然光、霓虹、轮廓光、景深、胶片颗粒。
- 文字约束：是否含文字、是否要求可读、是否有精确文本、是否禁止额外文字。
- 质量与风险：结构精度、文字准确性、人物比例、一致性、复杂度。

## 使用建议

先从 100 条高价值样本里挑与你当下创作最接近的模板，再改变量，不要直接复制整段。每次测试时记录“生成结果评分”和“失败原因”，连续 5-10 次后就能沉淀出你自己的稳定模板。
`;

  fs.writeFileSync(path.join(OUT_DIR, "gpt-image-2-prompt-research.md"), content);
}

function writeTemplateFramework(selected) {
  const examplesByTemplate = selected.reduce((acc, row) => {
    acc[row.templateId] ||= [];
    acc[row.templateId].push(row);
    return acc;
  }, {});

  const templateSections = TEMPLATE_DEFINITIONS.map((template) => {
    const examples = (examplesByTemplate[template.id] || [])
      .slice(0, 5)
      .map((row) => `${row.id}「${row.title}」`)
      .join("；");

    return `## ${template.id} ${template.name}

适用：${template.use}

核心结构：${template.structure}

变量：${template.variables.join("、")}

提示词骨架：

\`\`\`text
${template.skeleton}
\`\`\`

样本参考：${examples || "本轮未入选，可在全量数据中按关键词检索"}
`;
  }).join("\n");

  const content = `# GPT Image 2 创作提示词框架

这套框架来自两类资料：OpenAI 官方 GPT Image 2 文档，以及本项目同步的 2168 条 YouMind GPT Image 2 提示词。

## 母模板

\`\`\`text
Create a [作品类型] for [用途/受众].

Main subject:
[主体是谁/是什么]，[数量/状态/动作]，[关键外观/材质/身份]。

Scene:
[地点/环境]，[时间/天气/时代]，[背景元素]。

Composition:
[景别/角度]，[版式层级]，[主体位置]，[辅助元素位置]。

Visual style:
[媒介/渲染方式]，[审美方向]，[色彩系统]，[材质纹理]。

Lighting and camera:
[光线]，[镜头]，[景深]，[质感]。

Text requirements:
[是否含文字]，[精确文字]，[文字位置]，[可读性要求]。

Quality constraints:
clean, coherent, polished, high detail, readable hierarchy, no random text, no visual clutter.

Output:
[比例/尺寸/用途]，[背景要求]。
\`\`\`

## 使用顺序

1. 先选下面 20 个模板之一。
2. 只替换变量，不要先改结构。
3. 第一轮用低成本设置快速看方向。
4. 记录失败原因，再补充更具体的构图、文字、数量、位置约束。
5. 定稿时再提高质量和尺寸。

${templateSections}
`;

  fs.writeFileSync(path.join(OUT_DIR, "gpt-image-2-template-framework.md"), content);
}

function writeSelectedJson(filePath, selected) {
  fs.writeFileSync(filePath, `${JSON.stringify(selected, null, 2)}\n`);
}

function main() {
  ensureDir(OUT_DIR);
  const data = loadData();
  const prompts = data.prompts || [];
  const summary = summarizeDataset(prompts);
  const selected = selectHighValuePrompts(prompts);

  writeResearchNotes(data, summary, selected);
  writeTemplateFramework(selected);
  writeSelectedJson(path.join(OUT_DIR, "high-value-prompts-100.json"), selected);
  writeCsv(path.join(OUT_DIR, "high-value-prompts-100.csv"), selected);
  fs.writeFileSync(path.join(OUT_DIR, "dataset-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);

  console.log(
    JSON.stringify(
      {
        prompts: prompts.length,
        selected: selected.length,
        files: [
          "analysis/gpt-image-2-prompt-research.md",
          "analysis/gpt-image-2-template-framework.md",
          "analysis/high-value-prompts-100.json",
          "analysis/high-value-prompts-100.csv",
          "analysis/dataset-summary.json"
        ]
      },
      null,
      2
    )
  );
}

main();
