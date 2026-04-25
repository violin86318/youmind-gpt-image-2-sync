import fs from "fs";
import path from "path";
import { resolveSyncTarget } from "./lib/config.mjs";
import { runLarkCliJson, runLarkCliJsonAsync } from "./lib/lark-cli.mjs";

const ANALYSIS_PATH = path.join(process.cwd(), "analysis/high-value-prompts-100.json");

const ANALYSIS_FIELD_DEFINITIONS = [
  { name: "分析-入选样本", type: "checkbox" },
  { name: "分析-样本排名", type: "number" },
  { name: "分析-作品类型", type: "text" },
  { name: "分析-主体类型", type: "text" },
  { name: "分析-构图模式", type: "text" },
  { name: "分析-风格关键词", type: "text" },
  { name: "分析-光线镜头", type: "text" },
  { name: "分析-是否含文字", type: "checkbox" },
  { name: "分析-文字要求", type: "text" },
  { name: "分析-模板编号", type: "text" },
  { name: "分析-优先级评分", type: "number" },
  { name: "分析-失败风险", type: "text" },
  { name: "分析-入选理由", type: "text" }
];

function listAllFields(baseToken, tableId) {
  const fields = [];
  let offset = 0;

  while (true) {
    const response = runLarkCliJson([
      "base",
      "+field-list",
      "--base-token",
      baseToken,
      "--table-id",
      tableId,
      "--limit",
      "100",
      "--offset",
      String(offset)
    ]);

    const data = response.data || {};
    fields.push(...(data.items || []));

    if (!data.has_more && fields.length >= (data.total || fields.length)) {
      break;
    }

    offset += 100;
  }

  return fields;
}

function ensureAnalysisFields(baseToken, tableId) {
  const existing = listAllFields(baseToken, tableId);
  const existingNames = new Set(existing.map((field) => field.field_name));
  const missing = ANALYSIS_FIELD_DEFINITIONS.filter((field) => !existingNames.has(field.name));

  if (missing.length === 0) {
    console.log(`Analysis fields already complete (${existing.length} fields).`);
    return;
  }

  console.log(`Adding ${missing.length} analysis fields: ${missing.map((field) => field.name).join(", ")}`);
  for (const field of missing) {
    runLarkCliJson([
      "base",
      "+field-create",
      "--base-token",
      baseToken,
      "--table-id",
      tableId,
      "--json",
      JSON.stringify(field)
    ]);
  }
}

function listPromptRecordIds(baseToken, tableId) {
  const records = new Map();
  let offset = 0;

  while (true) {
    const response = runLarkCliJson([
      "base",
      "+record-list",
      "--base-token",
      baseToken,
      "--table-id",
      tableId,
      "--limit",
      "100",
      "--offset",
      String(offset)
    ]);

    const data = response.data || {};
    const fields = data.fields || [];
    const promptIdIndex = fields.indexOf("Prompt ID");

    if (promptIdIndex < 0) {
      throw new Error("Missing Prompt ID field in record-list response.");
    }

    for (let index = 0; index < (data.record_id_list || []).length; index += 1) {
      const row = data.data?.[index] || [];
      const promptId = row[promptIdIndex] ? String(row[promptIdIndex]) : "";

      if (promptId) {
        records.set(promptId, data.record_id_list[index]);
      }
    }

    if (!data.has_more) {
      break;
    }

    offset += 100;
  }

  return records;
}

async function runWithConcurrency(items, worker) {
  const concurrency = Math.max(1, Number(process.env.LARK_SYNC_CONCURRENCY || 4));
  let cursor = 0;
  let completed = 0;

  async function runNext() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index]);
      completed += 1;

      if (completed === items.length || completed % 20 === 0) {
        console.log(`  synced ${completed}/${items.length}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runNext())
  );
}

function fieldsForRow(row) {
  return {
    "分析-入选样本": true,
    "分析-样本排名": row.rank,
    "分析-作品类型": row.workType,
    "分析-主体类型": row.subjectType,
    "分析-构图模式": (row.compositionPatterns || []).join(", "),
    "分析-风格关键词": (row.styleKeywords || []).join(", "),
    "分析-光线镜头": (row.lightingCamera || []).join(", "),
    "分析-是否含文字": Boolean(row.containsText),
    "分析-文字要求": row.textRequirement || "",
    "分析-模板编号": `${row.templateId} ${row.templateName}`,
    "分析-优先级评分": row.score,
    "分析-失败风险": (row.failureRisks || []).join("；"),
    "分析-入选理由": row.whySelected || ""
  };
}

async function main() {
  const target = resolveSyncTarget();
  const selected = JSON.parse(fs.readFileSync(ANALYSIS_PATH, "utf8"));

  ensureAnalysisFields(target.baseToken, target.tableId);

  console.log("Loading Feishu record ids ...");
  const recordIds = listPromptRecordIds(target.baseToken, target.tableId);
  const updates = selected
    .map((row) => ({
      row,
      recordId: recordIds.get(String(row.id))
    }))
    .filter((entry) => entry.recordId);

  const missing = selected.filter((row) => !recordIds.has(String(row.id)));
  if (missing.length > 0) {
    console.warn(`Skipping ${missing.length} selected prompts missing from Feishu.`);
  }

  console.log(`Syncing analysis fields for ${updates.length} selected prompts ...`);
  await runWithConcurrency(updates, ({ row, recordId }) =>
    runLarkCliJsonAsync([
      "base",
      "+record-upsert",
      "--base-token",
      target.baseToken,
      "--table-id",
      target.tableId,
      "--record-id",
      recordId,
      "--json",
      JSON.stringify(fieldsForRow(row))
    ])
  );

  console.log(`Finished syncing analysis fields. updated=${updates.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
