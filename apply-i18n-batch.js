#!/usr/bin/env node
/**
 * Script para aplicar traducciones i18n en batch a todos los módulos
 * Ejecutar: node apply-i18n-batch.js
 */

const fs = require('fs');
const path = require('path');

// Definir reemplazos por archivo
const replacements = {
  'src/pages/Recordatorios.tsx': [
    { from: "'Cargando recordatorios...'", to: "t('reminders.messages.loading')" },
    { from: "'recordatorios registrados'", to: "t('reminders.messages.registered')" },
    { from: "'Nuevo Recordatorio'", to: "t('reminders.newReminder')" },
    { from: "'Filtros'", to: "t('animals.buttons.filters')" },
    { from: "'Limpiar Filtros'", to: "t('animals.buttons.clearFilters')" },
    { from: "'Fecha Programada'", to: "t('reminders.form.scheduledDate')" },
    { from: "'Animal'", to: "t('reminders.form.animal')" },
    { from: "'Descripción'", to: "t('reminders.form.description')" },
    { from: "'Guardar'", to: "t('common.save')" },
    { from: "'Cancelar'", to: "t('common.cancel')" },
    { from: "'Editar'", to: "t('common.edit')" },
    { from: "'Eliminar'", to: "t('common.delete')" },
    { from: "'Completar'", to: "t('reminders.complete')" },
    { from: "'Acciones'", to: "t('reminders.table.actions')" },
  ],
  
  'src/pages/Historial.tsx': [
    { from: "'Historial Veterinario'", to: "t('history.title')" },
    { from: "'Nuevo Evento'", to: "t('history.newEvent')" },
    { from: "'Editar Evento'", to: "t('history.editEvent')" },
    { from: "'Tipo de Evento'", to: "t('history.form.eventType')" },
    { from: "'Descripción'", to: "t('history.form.description')" },
    { from: "'Fecha de Aplicación'", to: "t('history.form.applicationDate')" },
    { from: "'Próxima Fecha'", to: "t('history.form.nextDate')" },
  ],
  
  'src/pages/Ventas.tsx': [
    { from: "'Ventas'", to: "t('sales.title')" },
    { from: "'Nueva Venta'", to: "t('sales.newSale')" },
    { from: "'Editar Venta'", to: "t('sales.editSale')" },
    { from: "'Comprador'", to: "t('sales.form.buyer')" },
    { from: "'Fecha de Venta'", to: "t('sales.form.saleDate')" },
    { from: "'Monto'", to: "t('sales.form.amount')" },
    { from: "'Método de Pago'", to: "t('sales.form.paymentMethod')" },
  ],
  
  'src/pages/Categorias.tsx': [
    { from: "'Categorías'", to: "t('categories.title')" },
    { from: "'Nueva Categoría'", to: "t('categories.newCategory')" },
    { from: "'Editar Categoría'", to: "t('categories.editCategory')" },
    { from: "'Tipo'", to: "t('categories.form.type')" },
    { from: "'Descripción'", to: "t('categories.form.description')" },
  ],
  
  'src/pages/Estados.tsx': [
    { from: "'Estados'", to: "t('states.title')" },
    { from: "'Nuevo Estado'", to: "t('states.newState')" },
    { from: "'Editar Estado'", to: "t('states.editState')" },
    { from: "'Nombre'", to: "t('states.form.name')" },
    { from: "'Descripción'", to: "t('states.form.description')" },
  ],
  
  'src/pages/Roles.tsx': [
    { from: "'Roles'", to: "t('roles.title')" },
    { from: "'Nuevo Rol'", to: "t('roles.newRole')" },
    { from: "'Editar Rol'", to: "t('roles.editRole')" },
    { from: "'Nombre'", to: "t('roles.form.name')" },
    { from: "'Descripción'", to: "t('roles.form.description')" },
  ],
  
  'src/pages/Usuarios.tsx': [
    { from: "'Usuarios'", to: "t('users.title')" },
    { from: "'Nuevo Usuario'", to: "t('users.newUser')" },
    { from: "'Editar Usuario'", to: "t('users.editUser')" },
    { from: "'Nombre'", to: "t('users.form.name')" },
    { from: "'Correo'", to: "t('users.form.email')" },
    { from: "'Contraseña'", to: "t('users.form.password')" },
    { from: "'Rol'", to: "t('users.form.role')" },
  ],
};

console.log('⚠️  NOTA: Este script es solo una guía.');
console.log('📝 Los reemplazos deben hacerse manualmente con las herramientas de código.');
console.log('');
console.log('✅ Archivos a modificar:');
Object.keys(replacements).forEach(file => {
  console.log(`  - ${file}: ${replacements[file].length} reemplazos`);
});
console.log('');
console.log('📊 Total de reemplazos: ' + Object.values(replacements).reduce((sum, arr) => sum + arr.length, 0));


