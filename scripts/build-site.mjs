import path from "path";
import fs from "fs";
import { ROOT, SITE_DIR, ensureDirSync, writeJsonSync } from "./lib/config.mjs";
import { loadSitePayloadForBuild } from "./lib/site-source.mjs";

const DETAIL_DIR = path.join(SITE_DIR, "data", "prompt-details");

function splitAnalysis(analysis) {
  if (!analysis || typeof analysis !== "object") {
    return { lite: null, detail: null };
  }

  const { breakdown = null, copyTemplate = "", similarPromptIds = [], ...lite } = analysis;

  return {
    lite,
    detail: {
      breakdown,
      copyTemplate,
      similarPromptIds
    }
  };
}

function splitPrompt(prompt) {
  const { prompt: promptText = "", translatedPrompt = "", analysis = null, ...rest } = prompt;
  const split = splitAnalysis(analysis);

  return {
    lite: {
      ...rest,
      analysis: split.lite
    },
    detail: {
      id: prompt.id,
      prompt: promptText,
      translatedPrompt,
      analysis: split.detail
    }
  };
}

function buildPromptIndexPayload(payload) {
  return {
    ...payload,
    prompts: payload.prompts.map((prompt) => splitPrompt(prompt).lite)
  };
}

function writePromptDetails(prompts) {
  fs.rmSync(DETAIL_DIR, { recursive: true, force: true });
  ensureDirSync(DETAIL_DIR);

  for (const prompt of prompts) {
    writeJsonSync(path.join(DETAIL_DIR, `${prompt.id}.json`), splitPrompt(prompt).detail);
  }
}

function copyAnalysisReports() {
  const sourceDir = path.join(ROOT, "analysis", "reports");
  const targetDir = path.join(SITE_DIR, "reports");

  if (!fs.existsSync(sourceDir)) {
    return;
  }

  ensureDirSync(targetDir);

  for (const fileName of fs.readdirSync(sourceDir)) {
    if (!fileName.endsWith(".md")) {
      continue;
    }

    fs.copyFileSync(path.join(sourceDir, fileName), path.join(targetDir, fileName));
  }
}

async function main() {
  const { payload, source } = await loadSitePayloadForBuild();
  const outputPath = path.join(SITE_DIR, "data", "prompts.json");
  const indexPath = path.join(SITE_DIR, "data", "prompts-index.json");

  writeJsonSync(outputPath, payload);
  writeJsonSync(indexPath, buildPromptIndexPayload(payload));
  writePromptDetails(payload.prompts);
  copyAnalysisReports();

  console.log(`Site data written to ${outputPath}`);
  console.log(`Site index written to ${indexPath}`);
  console.log(`Site source: ${payload.dataSourceLabel} (${source})`);

  if (payload.validation?.checked) {
    console.log(
      `Feishu validation passed. expected=${payload.validation.expectedCount} actual=${payload.validation.actualCount}`
    );
  }

  if (payload.fallbackReason) {
    console.warn(`Fell back to YouMind source: ${payload.fallbackReason}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
