# YouMind GPT Image 2 Sync

这个项目把 YouMind 的 GPT Image 2 公开提示词做成一条自动化链路：

1. 从 `https://youmind.com/youhome-api/prompts` 拉取 `model=gpt-image-2` 的公开分页数据。
2. 增量同步到飞书多维表格。
3. 生成 `site/data/prompts.json`，并通过 GitHub Actions 部署 `site/` 到 GitHub Pages。

## 本地命令

```bash
npm run fetch
npm run build:site
npm run serve:site
```

如果要新建飞书多维表格：

```bash
npm run bootstrap:lark
```

运行后会生成 `.gpt-image-2.local.json`，里面包含 `baseToken` 和 `tableId`。

同步到飞书：

```bash
npm run ensure:lark
npm run sync:lark
```

`ensure:lark` 只会在已有表格里追加缺失的 YouMind 字段，不会删除或改写原来的测试字段。

如果要先刷新本机 `lark-cli` 登录态：

```bash
npm run sync:lark:local-auth
```

## GitHub Actions

已配置 `.github/workflows/sync-and-deploy.yml`。

GitHub 托管 Runner 模式需要配置仓库 Secrets：

- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_BASE_TOKEN`
- `FEISHU_TABLE_ID`

自托管 Runner 模式可以复用本机 `lark-cli` 登录态。仓库 Variables 设置：

- `ENABLE_SELF_HOSTED_LARK_SYNC=1`

并确保 runner 有这些 labels：

- `self-hosted`
- `macOS`
- `ARM64`
- `youmind-sync`

## GitHub Pages

仓库 Settings 里把 Pages Source 设为 `GitHub Actions`。之后 workflow 会把 `site/` 作为 Pages artifact 部署。
