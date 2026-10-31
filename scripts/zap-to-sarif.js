#!/usr/bin/env node
/**
 * OWASP ZAP JSON to SARIF 2.1.0 Converter
 * Transforms ZAP vulnerability report JSON into OASIS SARIF v2.1.0 format
 * for seamless ingestion by GitHub Code Scanning via github/codeql-action/upload-sarif.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Code Scanning only accepts repo-relative file locations (an http:// URI is rejected with
// "SARIF URI scheme did not match the checkout URI scheme"), so DAST findings are anchored to
// the OpenAPI spec describing the scanned surface; the scanned URL stays in the message.
const DEFAULT_ANCHOR = 'docs/api/openapi.yaml';

function parseRulesFile(rulesFilePath) {
  const ignoredRules = new Set();
  if (!rulesFilePath || !fs.existsSync(rulesFilePath)) return ignoredRules;
  const content = fs.readFileSync(rulesFilePath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\t+/);
    if (parts.length >= 2) {
      const ruleId = parts[0].trim();
      const threshold = parts[1].trim().toUpperCase();
      if (threshold === 'IGNORE') {
        ignoredRules.add(ruleId);
      }
    }
  }
  return ignoredRules;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    output: null,
    category: 'zap-dast',
    anchor: DEFAULT_ANCHOR,
    rules: null
  };

  for (const arg of args) {
    if (arg.startsWith('--input=')) {
      options.input = path.resolve(process.cwd(), arg.split('=')[1]);
    } else if (arg.startsWith('--output=')) {
      options.output = path.resolve(process.cwd(), arg.split('=')[1]);
    } else if (arg.startsWith('--category=')) {
      options.category = arg.split('=')[1];
    } else if (arg.startsWith('--anchor=')) {
      options.anchor = arg.split('=')[1];
    } else if (arg.startsWith('--rules=')) {
      options.rules = path.resolve(process.cwd(), arg.split('=')[1]);
    }
  }

  if (!options.rules) {
    if (
      options.category === 'zap-baseline' &&
      fs.existsSync(path.resolve(process.cwd(), 'security/zap-rules.tsv'))
    ) {
      options.rules = path.resolve(process.cwd(), 'security/zap-rules.tsv');
    } else if (
      options.category === 'zap-api' &&
      fs.existsSync(path.resolve(process.cwd(), 'security/zap-api-rules.tsv'))
    ) {
      options.rules = path.resolve(process.cwd(), 'security/zap-api-rules.tsv');
    }
  }

  if (!options.input || !options.output) {
    console.error(
      'Usage: node scripts/zap-to-sarif.js --input=<zap-json> --output=<output-sarif> [--category=<category>] [--anchor=<repo-relative-file>] [--rules=<rules-tsv>]'
    );
    process.exit(1);
  }

  return options;
}

function cleanText(str) {
  if (!str || typeof str !== 'string') return '';
  let text = '';
  let insideTag = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '<') {
      insideTag = true;
    } else if (ch === '>') {
      insideTag = false;
    } else if (!insideTag) {
      text += ch;
    }
  }

  const entityMap = {
    nbsp: ' ',
    amp: '&',
    quot: '"',
    lt: '<',
    gt: '>'
  };
  return text.replace(/&(nbsp|amp|quot|lt|gt);/g, (_, code) => entityMap[code] || _).trim();
}

function mapRiskToLevel(riskCode) {
  // ZAP risk codes: 3: High, 2: Medium, 1: Low, 0: Informational
  switch (String(riskCode)) {
    case '3':
      return 'error';
    case '2':
      return 'warning';
    case '1':
      return 'warning';
    case '0':
    default:
      return 'note';
  }
}

/**
 * Builds a lookup from OpenAPI path templates (e.g. /api/books/{id}) to their 1-based line
 * numbers in the anchor file, so findings land on the matching endpoint definition.
 */
function buildPathLineIndex(anchorText) {
  const index = [];
  if (!anchorText) return index;
  anchorText.split(/\r?\n/).forEach((line, i) => {
    const match = /^ {2}(\/[^:\s]*):\s*$/.exec(line);
    if (match) {
      const pattern = match[1]
        .split('/')
        .map((seg) =>
          /^\{[^}]+\}$/.test(seg) ? '[^/]+' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        )
        .join('/');
      index.push({ regex: new RegExp(`^${pattern}/?$`), line: i + 1 });
    }
  });
  return index;
}

function findAnchorLine(uri, pathIndex) {
  let pathname;
  try {
    pathname = new URL(uri, 'http://localhost').pathname;
  } catch {
    return 1;
  }
  const hit = pathIndex.find((entry) => entry.regex.test(pathname));
  return hit ? hit.line : 1;
}

function convertZapToSarif(
  zapData,
  category,
  anchor = DEFAULT_ANCHOR,
  anchorText = '',
  ignoredRules = new Set()
) {
  const pathIndex = buildPathLineIndex(anchorText);
  const rules = [];
  const results = [];
  const seenRuleIds = new Set();

  let sites = [];
  if (zapData) {
    if (Array.isArray(zapData.site)) {
      sites = zapData.site;
    } else if (zapData.site && typeof zapData.site === 'object') {
      sites = [zapData.site];
    }
  }

  let ignoredCount = 0;
  for (const site of sites) {
    const alerts = site.alerts || [];
    for (const alert of alerts) {
      const ruleId = String(alert.pluginid || alert.alertRef || alert.name);
      if (ignoredRules.has(ruleId)) {
        ignoredCount++;
        continue;
      }
      const ruleName = alert.alert || alert.name || 'OWASP ZAP Finding';
      const cleanDesc = cleanText(alert.desc) || ruleName;
      const cleanSolution = cleanText(alert.solution) || 'Review endpoint configuration';
      const cleanReference = cleanText(alert.reference) || 'https://www.zaproxy.org/';
      const level = mapRiskToLevel(alert.riskcode);

      if (!seenRuleIds.has(ruleId)) {
        seenRuleIds.add(ruleId);
        rules.push({
          id: ruleId,
          name: ruleName.replace(/[^a-zA-Z0-9_-]/g, '_'),
          shortDescription: {
            text: ruleName
          },
          fullDescription: {
            text: cleanDesc
          },
          help: {
            text: `${cleanDesc}\n\nRemediation:\n${cleanSolution}\n\nReferences:\n${cleanReference}`,
            markdown: `### ${ruleName}\n\n${cleanDesc}\n\n#### Remediation\n${cleanSolution}\n\n#### References\n${cleanReference}`
          },
          properties: {
            tags: [
              'security',
              'dast',
              'owasp-zap',
              category,
              alert.cweid ? `CWE-${alert.cweid}` : 'CWE-Unknown'
            ],
            precision: 'high',
            problem: {
              severity:
                level === 'error' ? 'error' : level === 'warning' ? 'warning' : 'recommendation'
            }
          }
        });
      }

      const instances =
        alert.instances && alert.instances.length > 0
          ? alert.instances
          : [{ uri: site['@name'] || 'http://localhost' }];

      for (const inst of instances) {
        const uri = inst.uri || site['@name'] || 'http://localhost';
        const method = inst.method || 'GET';
        const param = inst.param ? ` (Parameter: ${inst.param})` : '';
        const evidence = inst.evidence ? ` Evidence: "${inst.evidence}"` : '';
        // Many URLs share one anchor line, so fingerprint by rule + request to keep alerts distinct
        const fingerprint = crypto
          .createHash('sha256')
          .update(`${ruleId}|${method}|${uri}|${inst.param || ''}`)
          .digest('hex');

        results.push({
          ruleId,
          level,
          message: {
            text: `[${method}] ${uri}${param} - ${ruleName}.${evidence}`
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: anchor,
                  uriBaseId: '%SRCROOT%'
                },
                region: {
                  startLine: findAnchorLine(uri, pathIndex),
                  startColumn: 1
                }
              }
            }
          ],
          partialFingerprints: {
            zapRequestHash: fingerprint
          },
          properties: {
            category,
            url: uri,
            confidence: alert.confidence || 'Medium',
            risk: alert.riskdesc || 'Medium',
            method,
            attack: inst.attack || '',
            evidence: inst.evidence || ''
          }
        });
      }
    }
  }

  return {
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'OWASP ZAP',
            semanticVersion: zapData && zapData['@version'] ? zapData['@version'] : '2.14.0',
            informationUri: 'https://www.zaproxy.org/',
            rules
          }
        },
        results
      }
    ]
  };
}

function main() {
  const options = parseArgs();
  console.log(`[ZAP-SARIF] Reading ZAP report from: ${options.input}`);

  let zapData = null;
  if (fs.existsSync(options.input)) {
    try {
      const raw = fs.readFileSync(options.input, 'utf-8');
      zapData = JSON.parse(raw);
    } catch (err) {
      console.warn(
        `[ZAP-SARIF] Warning: Unable to parse input JSON (${err.message}). Generating empty SARIF run.`
      );
    }
  } else {
    console.warn(
      `[ZAP-SARIF] Input file not found: ${options.input}. Generating clean SARIF with 0 findings.`
    );
  }

  let anchorText = '';
  const anchorPath = path.resolve(process.cwd(), options.anchor);
  if (fs.existsSync(anchorPath)) {
    anchorText = fs.readFileSync(anchorPath, 'utf-8');
  } else {
    console.warn(
      `[ZAP-SARIF] Anchor file not found: ${options.anchor}. Findings will point at line 1.`
    );
  }

  const ignoredRules = parseRulesFile(options.rules);
  if (options.rules) {
    console.log(
      `[ZAP-SARIF] Loaded rules policy from: ${options.rules} (${ignoredRules.size} ignored rules)`
    );
  }

  const sarif = convertZapToSarif(
    zapData,
    options.category,
    options.anchor,
    anchorText,
    ignoredRules
  );
  const outDir = path.dirname(options.output);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(options.output, JSON.stringify(sarif, null, 2), 'utf-8');
  console.log(`[ZAP-SARIF] Successfully wrote SARIF to: ${options.output}`);
  console.log(
    `[ZAP-SARIF] Summary: ${sarif.runs[0].tool.driver.rules.length} rules, ${sarif.runs[0].results.length} findings categorized under '${options.category}'.`
  );
}

if (require.main === module) {
  main();
}

module.exports = { convertZapToSarif };
