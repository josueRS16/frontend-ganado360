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

  // If file already references identifier 't' somewhere, skip
  const usesT = root.find(j.Identifier, { name: 't' }).size() > 0;
  if (usesT) return null;

  // Find top-level function components:
  // FunctionDeclaration and const X = () => { ... }
  root.find(j.ExportNamedDeclaration).forEach(() => {}); // no-op to ensure parse

  // Function declarations
  root.find(j.FunctionDeclaration).forEach(p => {
    const body = p.node.body;
    if (!body || body.type !== 'BlockStatement') return;
    const hasUseTranslationCall = j(body).find(j.CallExpression, { callee: { name: 'useTranslation' } }).size() > 0;
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

  // Arrow functions assigned to const
  root.find(j.VariableDeclarator, {
    init: { type: 'ArrowFunctionExpression' }
  }).forEach(p => {
    const init = p.node.init;
    const body = init.body;
    if (!body) return;
    if (body.type !== 'BlockStatement') return;
    const hasUseTranslationCall = j(body).find(j.CallExpression, { callee: { name: 'useTranslation' } }).size() > 0;
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

