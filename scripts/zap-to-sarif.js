#!/usr/bin/env node
/**
 * OWASP ZAP JSON to SARIF 2.1.0 Converter
 * Transforms ZAP vulnerability report JSON into OASIS SARIF v2.1.0 format
 * for seamless ingestion by GitHub Code Scanning via github/codeql-action/upload-sarif.
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    output: null,
    category: 'zap-dast'
  };

  for (const arg of args) {
    if (arg.startsWith('--input=')) {
      options.input = path.resolve(process.cwd(), arg.split('=')[1]);
    } else if (arg.startsWith('--output=')) {
      options.output = path.resolve(process.cwd(), arg.split('=')[1]);
    } else if (arg.startsWith('--category=')) {
      options.category = arg.split('=')[1];
    }
  }

  if (!options.input || !options.output) {
    console.error(
      'Usage: node scripts/zap-to-sarif.js --input=<zap-json> --output=<output-sarif> [--category=<category>]'
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

function convertZapToSarif(zapData, category) {
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

  for (const site of sites) {
    const alerts = site.alerts || [];
    for (const alert of alerts) {
      const ruleId = String(alert.pluginid || alert.alertRef || alert.name);
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
                  uri: uri.startsWith('http') ? uri : `http://localhost/${uri}`,
                  uriBaseId: '%SRCROOT%'
                },
                region: {
                  startLine: 1,
                  startColumn: 1
                }
              }
            }
          ],
          properties: {
            category,
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

  const sarif = convertZapToSarif(zapData, options.category);
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
