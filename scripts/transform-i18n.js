/**
 * jscodeshift transform: reemplaza textos estáticos conocidos por {t('key')}
 * - Solo modifica JSXText y valores de atributos JSX exactos que coincidan con el mapa.
 * - No añade useTranslation automáticamente dentro de componentes; solo marca archivos
 *   que requieren import/useTranslation si no lo tienen (para revisión).
 *
 * Ejecutar:
 * npx jscodeshift -t scripts/transform-i18n.js src --extensions=tsx,jsx --parser=tsx
 */
const map = {
  "Ganado360": "app_name",
  "Sistema de Gestión Ganadera": "app_subtitle",
  "Ventas": "ventas",
  "Animales": "animales",
  "Recordatorios": "recordatorios",
  "Acciones Rápidas": "acciones_rapidas",
  "Gestionar Animales": "gestionar_animales",
  "Ver y editar ganado": "ver_y_editar_ganado",
  "Registrar Venta": "registrar_venta",
  "Nueva transacción": "nueva_transaccion",
  "Ver Recordatorios": "ver_recordatorios",
  "Próximas tareas": "proximas_tareas",
  "Gestionar Usuarios": "gestionar_usuarios",
  "Administración": "administracion",
  "Cerrar sesión": "cerrar_sesion",
  "Cambiar a inglés": "cambiar_a_ingles",
  "Cambiar a español": "cambiar_a_espanol",
  "Acciones Rápidas": "acciones_rapidas",
  "Confirmar": "confirmar",
  "Cancelar": "cancelar"
};

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let modified = false;
  const filePath = fileInfo.path;

  // Helper to create JSXExpression: {t('key')}
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
    if (map[text]) {
      // replace the JSXText node with expression {t('key')}
      j(path).replaceWith(makeTCall(map[text]));
      modified = true;
    }
  });

  // Replace JSXAttribute string literal values that exactly match keys
  root.find(j.JSXAttribute).forEach(path => {
    const val = path.node.value;
    if (!val) return;
    // cases: JSXExpressionContainer, Literal (StringLiteral), JSXText not typical
    if (val.type === 'Literal' && typeof val.value === 'string') {
      const text = val.value.trim();
      if (map[text]) {
        path.get('value').replace(makeTCall(map[text]));
        modified = true;
      }
    }
    if (val.type === 'JSXExpressionContainer' && val.expression.type === 'Literal' && typeof val.expression.value === 'string') {
      const text = val.expression.value.trim();
      if (map[text]) {
        path.get('value').replace(makeTCall(map[text]));
        modified = true;
      }
    }
  });

  // If we modified the file, ensure there is an import from react-i18next.
  if (modified) {
    const hasImport = root.find(j.ImportDeclaration, {
      source: { value: 'react-i18next' }
    }).size();

    if (!hasImport) {
      // add: import { useTranslation } from 'react-i18next';
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

    // Write back source
    return root.toSource({ quote: 'single' });
  }

  return null;
};