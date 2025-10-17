/**
 * jscodeshift transform: reemplaza textos exactos por {t('key')}
 * - Usa el mapping generado por scripts/jsx-strings.json -> scripts/i18n-map.json
 *
 * Ejecutar después de generar scripts/i18n-map.json:
 * npx jscodeshift -t scripts/transform-i18n.js src --extensions=tsx,jsx --parser=tsx
 */
const fs = require('fs');
const path = require('path');

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  const mapPath = path.join(process.cwd(), 'scripts', 'i18n-map.json');
  if (!fs.existsSync(mapPath)) return null;
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8')); // { "Original Text": "key_name", ... }

  let modified = false;

  function makeTCall(key) {
    return j.jsxExpressionContainer(
      j.callExpression(j.identifier('t'), [j.literal(key)])
    );
  }

  // Replace exact JSXText nodes (trimmed) matching keys
  root.find(j.JSXText).forEach(path => {
    const raw = path.node.value || '';
    const text = raw.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const key = map[text];
    if (key) {
      j(path).replaceWith(makeTCall(key));
      modified = true;
    }
  });

  // Replace JSXAttribute string literal values that exactly match keys
  root.find(j.JSXAttribute).forEach(path => {
    const val = path.node.value;
    if (!val) return;
    if (val.type === 'Literal' || val.type === 'StringLiteral') {
      const text = String(val.value || '').trim();
      const key = map[text];
      if (key) {
        path.get('value').replace(makeTCall(key));
        modified = true;
      }
    }
    if (val.type === 'JSXExpressionContainer' && val.expression.type === 'StringLiteral') {
      const text = String(val.expression.value || '').trim();
      const key = map[text];
      if (key) {
        path.get('value').replace(makeTCall(key));
        modified = true;
      }
    }
  });

  if (modified) {
    // ensure import { useTranslation } from 'react-i18next' exists
    const hasImport = root.find(j.ImportDeclaration, {
      source: { value: 'react-i18next' }
    }).size();

    if (!hasImport) {
      const firstImport = root.find(j.ImportDeclaration).at(0);
      const newImport = j.importDeclaration(
        [j.importSpecifier(j.identifier('useTranslation'))],
        j.literal('react-i18next')
      );
      if (firstImport.size()) {
        firstImport.insertBefore(newImport);
      } else {
        root.get().node.program.body.unshift(newImport);
      }
    }

    return root.toSource({ quote: 'single' });
  }

  return null;
};