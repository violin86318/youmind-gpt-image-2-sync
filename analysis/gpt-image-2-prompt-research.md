# GPT Image 2 提示词调研与样本分析

生成时间：stable

## 调研结论

1. GPT Image 2 的强项是多模态理解、指令跟随、真实世界知识、细节编辑和文本渲染；这意味着提示词应该写成“视觉规格书”，而不是只堆风格词。
2. 官方文档提醒了几个稳定风险：复杂提示可能增加延迟；文本位置和清晰度仍可能失败；连续角色、品牌元素的一致性需要额外控制；结构化布局的精确摆放仍需明确约束。
3. 对创作工作流更有效的做法是先用低质量/小尺寸快速迭代，定稿时再提高质量和尺寸；如果需要编辑参考图，输入图像会增加成本。
4. 本项目 2168 条样本的主流写法不是短 prompt，而是包含主体、构图、风格、光线、文字、布局、负面约束的长规格。
5. 高价值样本通常具备三个特征：任务类型清晰、版式/构图可执行、失败风险被提前约束。

## 官方资料来源

- [OpenAI Image generation guide](https://developers.openai.com/api/docs/guides/image-generation)
- [OpenAI Images and vision guide](https://developers.openai.com/api/docs/guides/images-vision)
- [Creating images in ChatGPT](https://help.openai.com/en/articles/8932459-image-generation)
- [Introducing image generation in the API](https://openai.com/index/image-generation-api/)
- [ChatGPT Images 2.0 system card](https://deploymentsafety.openai.com/chatgpt-images-2-0/chatgpt-images-2-0.pdf)

## 数据概览

- 数据来源：Feishu Base
- 样本总数：2168
- 提示词长度：min 50 / p25 851 / median 1574 / p75 2303 / p90 3186 / max 7093

## 作品类型分布

| 类型 | 数量 |
| --- | ---: |
| 人物/角色 | 754 |
| 海报/封面 | 727 |
| UI/界面 | 209 |
| 信息图/图解 | 132 |
| 摄影/真实场景 | 82 |
| 产品/电商 | 80 |
| 字体/Logo | 67 |
| 空间/场景 | 31 |
| 图标/贴纸 | 29 |
| 插画/漫画 | 29 |
| 综合视觉 | 28 |

## 高频风格词

| 风格 | 数量 |
| --- | ---: |
| realistic | 689 |
| cinematic | 560 |
| anime | 393 |
| premium | 386 |
| editorial | 285 |
| photorealistic | 278 |
| studio | 221 |
| fantasy | 185 |
| 3d | 156 |
| vintage | 147 |
| luxury | 143 |
| minimalist | 142 |
| sci-fi | 105 |
| manga | 83 |
| hand-drawn | 77 |
| watercolor | 70 |

## 高频构图词

| 构图 | 数量 |
| --- | ---: |
| vertical | 702 |
| centered | 443 |
| grid | 298 |
| horizontal | 254 |
| layered | 250 |
| close-up | 214 |
| full-body | 154 |
| symmetrical | 117 |
| callout | 100 |
| 2x2 | 71 |
| front-facing | 58 |
| annotations | 34 |
| top-down | 31 |
| poster layout | 28 |
| isometric | 19 |
| cutaway | 13 |

## 100 条样本覆盖的模板

| 模板 | 样本数 |
| --- | ---: |
| 2x2 对比/系列图 | 5 |
| Logo/字体实验 | 5 |
| SaaS 仪表盘 | 5 |
| 产品英雄图 | 5 |
| 全身角色设定 | 5 |
| 动作漫画/动漫场景 | 5 |
| 图标/贴纸套组 | 5 |
| 地图/空间导览 | 5 |
| 复古真实摄影 | 5 |
| 文化节日/地域视觉 | 5 |
| 杂志编辑版式 | 5 |
| 流程图/步骤图 | 5 |
| 爆炸视图/结构图解 | 5 |
| 电商直播/UI 样机 | 5 |
| 电影/专辑封面 | 5 |
| 电影感人物肖像 | 5 |
| 百科信息图卡 | 5 |
| 移动 App 截图 | 5 |
| 等距 3D 空间 | 5 |
| 编辑感海报主视觉 | 5 |

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
