/**
 * Añade `const { t } = useTranslation();` dentro de componentes funcionales
 * que ya importan `useTranslation` pero aún no declaran `t`.
 *
 * Ejecutar:
 * npx jscodeshift -t scripts/add-t-hook.js src --extensions=tsx,jsx --parser=tsx
 */
module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let modified = false;

  // ¿Importa useTranslation?
  const importsI18n = root.find(j.ImportDeclaration, {
    source: { value: 'react-i18next' }
  });
  if (!importsI18n.size()) return null;

  // Helper: check if file already references identifier 't'
  const usesT = root.find(j.Identifier, { name: 't' }).size() > 0;

  // If file already uses t somewhere, nothing to add
  if (usesT) return null;

  // Find function declarations and function expressions assigned to const (arrow)
  const functionNodes = [];

  root.find(j.FunctionDeclaration).forEach(p => functionNodes.push(p));
  root.find(j.VariableDeclarator, {
    init: { type: 'ArrowFunctionExpression' }
  }).forEach(p => functionNodes.push(p));

  functionNodes.forEach(p => {
    let body;
    if (p.node.type === 'FunctionDeclaration') {
      body = p.node.body;
    } else if (p.node.type === 'VariableDeclarator') {
      body = p.node.init.body;
    }
    if (!body || body.type !== 'BlockStatement') return;

    // check if body already contains useTranslation call
    const hasUseTranslationCall = j(body).find(j.CallExpression, {
      callee: { name: 'useTranslation' }
    }).size() > 0;

    // if not, insert const { t } = useTranslation(); at top of body
    if (!hasUseTranslationCall) {
      const stmt = j.variableDeclaration('const', [
        j.variableDeclarator(
          j.objectPattern([j.property('init', j.identifier('t'), j.identifier('t'))]),
          j.callExpression(j.identifier('useTranslation'), [])
        )
      ]);
      body.body.unshift(stmt);
      modified = true;
    }
  });

  if (modified) {
    return root.toSource({ quote: 'single' });
  }
  return null;
};

