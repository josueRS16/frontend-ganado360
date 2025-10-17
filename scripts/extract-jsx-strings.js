/**
 * Extrae textos estáticos en JSX/atributos y escribe scripts/jsx-strings.json
 * Ejecutar:
 *   npm install --no-save @babel/parser @babel/traverse glob fs-extra
 *   node scripts/extract-jsx-strings.js
 */
const fs = require('fs-extra');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const path = require('path');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'scripts', 'jsx-strings.json');

async function run() {
  const files = glob.sync('src/**/*.{tsx,jsx}', { nodir: true });
  const results = {};

  for (const file of files) {
    const code = await fs.readFile(file, 'utf8');
    let ast;
    try {
      ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties'],
      });
    } catch (e) {
      console.error('parse error', file, e.message);
      continue;
    }

    const items = new Map();

    traverse(ast, {
      JSXText(path) {
        const raw = path.node.value || '';
        const text = raw.replace(/\s+/g, ' ').trim();
        if (!text) return;
        if (text.length < 2) return;
        // ignore strings that are just punctuation
        if (/^[\p{P}\p{S}]+$/u.test(text)) return;
        items.set(text, { text });
      },
      JSXAttribute(path) {
        const val = path.node.value;
        if (!val) return;
        if (val.type === 'StringLiteral' || val.type === 'Literal') {
          const text = String(val.value || '').trim();
          if (!text) return;
          items.set(text, { text, attr: path.node.name && path.node.name.name ? path.node.name.name : null });
        }
        if (val.type === 'JSXExpressionContainer' && val.expression && val.expression.type === 'StringLiteral') {
          const text = String(val.expression.value || '').trim();
          if (!text) return;
          items.set(text, { text, attr: path.node.name && path.node.name.name ? path.node.name.name : null });
        }
      }
    });

    if (items.size) {
      results[file] = Array.from(items.values()).map(i => ({
        text: i.text,
        attr: i.attr || null
      }));
    }
  }

  await fs.ensureDir(path.dirname(OUT));
  await fs.writeJson(OUT, results, { spaces: 2 });
  console.log('Wrote', OUT);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});