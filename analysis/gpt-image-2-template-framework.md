# GPT Image 2 创作提示词框架

这套框架来自两类资料：OpenAI 官方 GPT Image 2 文档，以及本项目同步的 2168 条 YouMind GPT Image 2 提示词。

## 母模板

```text
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
```

## 使用顺序

1. 先选下面 20 个模板之一。
2. 只替换变量，不要先改结构。
3. 第一轮用低成本设置快速看方向。
4. 记录失败原因，再补充更具体的构图、文字、数量、位置约束。
5. 定稿时再提高质量和尺寸。

## T01 电影感人物肖像

适用：人物头像、社媒头像、角色主视觉、个人品牌照

核心结构：身份 + 表情姿态 + 服饰细节 + 场景氛围 + 镜头光线 + 质感

变量：人物身份、情绪、服装、背景、镜头、光线

提示词骨架：

```text
Create a cinematic portrait of [人物身份], [表情/姿态], wearing [服装与材质]. Place them in [背景/时代/空间]. Use [镜头/景别], [光线], [色调]. Emphasize [面部细节/质感/情绪]. Avoid distorted facial features and random text.
```

样本参考：15797「情感动漫电影横幅」；15743「粉色动漫 Natsuki 横幅」；15435「银行内电影质感的红色劫匪团队」；15762「维多利亚风格动物象棋对弈」；15034「动漫角色蓝图设计稿」

## T02 全身角色设定

适用：游戏角色、IP 形象、Cosplay、职业角色设定

核心结构：角色身份 + 全身姿态 + 服装道具 + 比例 + 背景简化 + 可复用设定

变量：角色职业、姿态、服饰、道具、比例、背景

提示词骨架：

```text
Create a full-body character design of [角色职业/身份], standing [姿态]. Include [服装层次], [关键道具], [发型/表情]. Use [风格] with clean proportions and readable silhouette. Plain or lightly textured background, no extra text.
```

样本参考：15446「日系机甲少女手办广告海报」；15607「电影时代排版网格」；15090「动漫女主角宣传海报」；15041「电影感武士风格代理商落地页」；15014「极简主义 9 宫格时尚拼贴」

## T03 动作漫画/动漫场景

适用：动漫分镜、战斗场景、运动瞬间、夸张叙事图

核心结构：冲突动作 + 速度线/动态构图 + 角色位置 + 镜头角度 + 氛围特效

变量：动作、角色数量、冲突关系、镜头角度、特效、画风

提示词骨架：

```text
Create a dynamic [anime/manga] action scene showing [角色/主体] performing [动作]. Use [镜头角度], strong diagonal composition, motion lines, dramatic lighting, and [特效]. Keep anatomy coherent and the main action instantly readable.
```

样本参考：15798「奇幻精灵游侠集换式卡牌」；15374「动漫 RPG 剑术攻击项目」；15799「暗黑奇幻兽人战争领袖 TCG 卡牌」；15800「奇幻法师集换式卡牌」；14432「动漫武士游戏广告海报」

## T04 编辑感海报主视觉

适用：活动海报、品牌主视觉、展览宣传、社媒封面

核心结构：主题 + 主视觉 + 标题区 + 信息层级 + 版式 + 色彩系统

变量：主题、主视觉、标题、副文案、版式、色彩

提示词骨架：

```text
Design an editorial poster for [主题/活动]. Main visual: [主体]. Layout: [标题位置], [副文案区域], [信息层级]. Style: [视觉风格], [色彩系统], [材质]. Text must be legible and limited to the exact words: [文字].
```

样本参考：15077「史诗级 FC Barcelona 传承海报」；15668「北欧奢华旅行海报」；14842「尤文图斯电影感球员海报」；15467「日式视频制作海报」；15386「动漫风航空学生优惠海报」

## T05 电影/专辑封面

适用：电影海报、音乐封面、书籍封面、播客封面

核心结构：类型感 + 主角/符号 + 标题字 + 副标题 + 氛围 + 留白

变量：作品类型、标题、主角或符号、氛围、字体、留白

提示词骨架：

```text
Create a [电影/专辑/书籍] cover titled [标题]. Feature [主角/核心符号] in [氛围场景]. Use [类型风格], strong title typography, clear hierarchy, and [色彩]. No extra words beyond [允许文字].
```

样本参考：14869「Apple 风格极简演示文稿封面」；14598「《Dark Space Emperor》电影海报」；15772「动漫春季旅行电影海报」；15096「温馨企鹅奇幻电影海报」；15731「优雅都市时尚杂志封面」

## T06 产品英雄图

适用：产品首图、广告图、电商详情页首屏

核心结构：产品 + 角度 + 材质 + 背景 + 灯光 + 卖点氛围

变量：产品、角度、材质、背景、灯光、品牌调性

提示词骨架：

```text
Create a premium product hero shot of [产品], shown from [角度]. Emphasize [材质/工艺/细节]. Background: [背景]. Lighting: [灯光]. Mood: [品牌调性]. Clean composition, sharp focus, no unwanted labels.
```

样本参考：15639「极简主义精华液产品拼图」；15536「商业产品信息图」；14177「Pet Brand Identity System Board」；14576「Audi S4 宣传海报」；15517「工业设计展示页」

## T07 爆炸视图/结构图解

适用：硬件拆解、产品卖点、技术说明、科普图

核心结构：对象 + 分层结构 + 标注数量 + 左右说明 + 技术质感

变量：对象、组件层数、标注数量、文案、风格、背景

提示词骨架：

```text
Create an exploded-view technical diagram poster of [对象]. Show [组件层数] separated layers with [标注数量] clean callout labels. Use [风格], precise spacing, readable labels, and a clear centerline. Keep every label short and legible.
```

样本参考：14165「Vintage Pomegranate Growth Atlas」；15000「科幻机甲蓝图机库」；14956「特摄英雄参考图集」；15110「隐藏的刻字米粒」；13460「VR 头显爆炸视图海报」

## T08 电商直播/UI 样机

适用：直播带货界面、社交电商、移动端商品页

核心结构：设备框 + 页面模块 + 商品信息 + 交互按钮 + 真实运营密度

变量：设备、页面类型、商品、模块、按钮、品牌风格

提示词骨架：

```text
Create a realistic [设备] UI mockup for [页面类型]. Include [商品/内容], [顶部导航], [主视觉], [信息卡片], [CTA buttons], and [互动元素]. Keep layout dense but organized, with legible UI text and coherent spacing.
```

样本参考：14891「中文直播宿舍自拍 UI」；15397「摩洛哥餐厅品牌项目」；14581「Apple macOS 重新设计宣传样机」；14403「日本绿色科技宣传拼贴画」；15795「印尼学校营养计划落地页」

## T09 SaaS 仪表盘

适用：B2B 产品概念图、后台系统、数据看板

核心结构：业务场景 + 导航 + 数据卡片 + 图表 + 状态 + 视觉系统

变量：业务、导航、指标、图表、状态、色彩

提示词骨架：

```text
Design a SaaS dashboard interface for [业务场景]. Include [左侧导航], [顶部筛选], [关键指标卡], [图表], [表格/任务列表]. Use [视觉系统], compact spacing, legible labels, and realistic data density.
```

样本参考：15391「未来感 AI 体育海报」；14627「高端未来感 AI 工作空间」；14565「蒸汽朋克风格 ElectroVid 首页设计稿」；15389「未来感董事会分析会议」；14497「日本 X 变现缩略图」

## T10 移动 App 截图

适用：App Store 截图、产品概念、移动工具界面

核心结构：手机设备 + 页面目标 + 组件状态 + 内容层级 + 手势/反馈

变量：App 类型、页面、组件、内容、状态、设备

提示词骨架：

```text
Create a polished mobile app screenshot for [App 类型], showing [页面]. Include [组件], [内容列表/卡片], [状态/反馈], and [CTA]. Use [设计语言]. Keep text short, aligned, and readable.
```

样本参考：14892「中国宿舍直播截图」；14540「AI Thinking App 截图」；14480「ChatGPT 应用展示微信朋友圈截图」；14661「带有广告设计网格的 AI 聊天截图」；14542「带有宇宙艺术风格的 AI 聊天截图」

## T11 百科信息图卡

适用：知识卡片、科普图、社媒长图、教学材料

核心结构：中心对象 + 分区模块 + 标注 + 数据/事实 + 图标系统

变量：主题、中心对象、模块、标注、数据、图标风格

提示词骨架：

```text
Create an encyclopedia-style infographic about [主题]. Center: [对象]. Surround it with [模块数量] labeled sections, concise facts, small icons, and clean dividers. Use [风格]. All labels must be readable and minimal.
```

样本参考：14866「McLaren GT3X 技术蓝图海报」；15683「科幻灯塔结构解析图」；15662「AI 广州美食地图对比」；15597「八种视觉语法下的苹果」；15421「植物生长图谱海报」

## T12 流程图/步骤图

适用：教程流程、方法论、商业流程、食谱步骤

核心结构：步骤数量 + 节点 + 箭头 + 分支 + 输出结果

变量：流程主题、步骤、节点、箭头、分支、色彩

提示词骨架：

```text
Create a clean flowchart explaining [流程主题]. Use [步骤数量] numbered steps with arrows, concise labels, and [图标/插图]. Layout: [横向/纵向/环形]. Keep text short and hierarchy obvious.
```

样本参考：14870「Thoughtful Systems 演示封面」；13883「Chalkboard AI 产品信息图」；15292「Scrapbook Byte-level BPE 原理解析」；13611「动漫艺术创作流程信息图」；14048「复杂信息图表说明表」

## T13 地图/空间导览

适用：城市美食地图、活动导览、园区地图、旅行视觉

核心结构：俯视地图 + 地标 + 路线 + 图标 + 标注 + 地域风格

变量：城市/空间、地标、路线、图标、标注、风格

提示词骨架：

```text
Create a [手绘/信息图] map of [城市/空间]. Include [地标数量] landmarks, [路线/区域], small illustrated icons, and readable labels. Use [地域风格/色彩], top-down composition, and clear visual hierarchy.
```

样本参考：14444「成都手绘美食地图 UI」；14883「复古北京旅行剪贴簿海报」；15612「复古中国美食地图海报」；15638「静安寺站 2 号线入口」；14400「GTA 风格海滩俱乐部游戏截图」

## T14 杂志编辑版式

适用：杂志封面、专题页、品牌刊物、人物专访视觉

核心结构：封面人物/对象 + 栏目文字 + 网格 + 摄影/插画 + 出版质感

变量：刊物主题、主图、标题、栏目、网格、质感

提示词骨架：

```text
Design a magazine-style editorial layout for [刊物主题]. Main image: [主图]. Use [网格系统], [标题], [栏目文字], and [出版风格]. Keep typography refined, aligned, and limited to exact text.
```

样本参考：15448「尤文图斯 Yamal 转会海报」；15026「奢华出版与品牌推广编辑排版」；14888「GPT IMAGE 2 中文提示词文档」；15684「日式时尚杂志封面：鲤鱼旗主题礼服」；15339「动漫时尚杂志封面」

## T15 Logo/字体实验

适用：品牌字标、标题字、活动视觉、字体风格探索

核心结构：文字 + 字形特征 + 材质/文化风格 + 背景 + 禁止额外文字

变量：文字、字形、材质、文化风格、背景、用途

提示词骨架：

```text
Create a typography/logo treatment for the exact text [文字]. Style the letters with [字形特征], [材质/文化风格], and [色彩]. Plain background. The only readable text should be [文字].
```

样本参考：15039「复古快餐品牌项目」；14539「日式居酒屋 Highball 海报」；14554「复古风韩式紫菜包饭食谱海报」；14564「复古法式可丽饼食谱海报」；14991「日本生态社区宣传海报」

## T16 图标/贴纸套组

适用：图标包、贴纸、表情、产品功能图标

核心结构：数量 + 网格 + 统一风格 + 单个对象 + 背景/描边

变量：数量、主题、对象列表、网格、风格、背景

提示词骨架：

```text
Create a cohesive set of [数量] [icons/stickers] about [主题], arranged in a clean [网格]. Each item shows [对象列表]. Use consistent [风格], stroke, lighting, and background. No extra text.
```

样本参考：14664「Neon Lip Balm 新品发布广告」；15333「可爱的日系浪漫喜剧电影海报」；15059「Mirassol FC 球员签约官宣海报」；15029「极简男性头像 Logo 网格」；14993「可爱猫咪贴纸集」

## T17 2x2 对比/系列图

适用：风格对比、产品系列、前后对照、角色变体

核心结构：四宫格 + 每格变量 + 统一构图 + 可比性 + 标签

变量：对比维度、四个变体、统一元素、标签、风格

提示词骨架：

```text
Create a 2x2 comparison grid showing [对比维度]. Each panel features [四个变体]. Keep [统一元素] consistent across panels. Add short readable labels if needed. Use [风格] and balanced spacing.
```

样本参考：14521「优雅芭蕾舞学校宣传网格图」；14639「8 格 GPT-Image-2 漫画宣传页」；15608「电影时代排版网格」；14556「机器人画家拼贴广告」；15671「AI 图像功能宣传网格」

## T18 等距 3D 空间

适用：空间概念、建筑场景、游戏场景、产品场景盒子

核心结构：空间盒子 + 主体 + 分区 + 材质 + 俯视角 + 小细节

变量：空间、主体、分区、材质、细节、色彩

提示词骨架：

```text
Create an isometric 3D miniature scene of [空间]. Include [主体], [分区], [道具细节], and [材质]. Use a clean top-down isometric angle, soft shadows, and [色彩]. Keep the scene readable at thumbnail size.
```

样本参考：14255「Vintage 3D Miniature City Map」；15328「温馨动漫风 ASMR 耳部按摩少女」；14934「日本法律与税务服务 LP 首屏设计」；14686「忧郁风格遮挡室内自拍肖像」；14185「Magical Sleep Website Mockup」

## T19 复古真实摄影

适用：怀旧照片、纪实场景、人物生活方式、品牌氛围图

核心结构：真实事件 + 年代/地点 + 胶片质感 + 光线 + 不完美细节

变量：事件、年代、地点、人物、光线、胶片质感

提示词骨架：

```text
Create a realistic vintage film photograph of [事件/主体] in [年代/地点]. Use [人物/环境细节], natural imperfections, [光线], subtle film grain, and [色调]. Avoid overly polished CGI appearance.
```

样本参考：15254「奢华双语品鉴菜单摄影」；14821「伊斯坦布尔的复古游轮」；14674「超现实露台肖像：乌鸦与小狗」；15695「东京浪漫情侣照片拼贴」；15520「黑白艺术肖像」

## T20 文化节日/地域视觉

适用：节日海报、城市印象、传统文化视觉、地域品牌

核心结构：文化主题 + 符号 + 地域场景 + 现代版式 + 色彩与纹样

变量：文化主题、符号、场景、版式、纹样、色彩

提示词骨架：

```text
Create a contemporary visual poster for [文化主题]. Combine [传统符号], [地域场景], [现代版式], [纹样], and [色彩]. Keep the design respectful, clear, and visually coherent.
```

样本参考：15285「长城旅行拼图」；15441「桃园结义电影感场景」；14173「Cultural Garment Infographic」；14437「梦幻山水女子剪影」；14126「Oriental Aesthetics Ink Wash Poster」

