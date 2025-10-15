import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { VentaFacturaPDF } from '../types/api';

// Extender el tipo de jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

/**
 * Genera un PDF de factura a partir de los datos de una venta
 * @param factura - Datos completos de la factura obtenidos del endpoint /ventas/:id/factura-pdf
 */
export async function generarFacturaPDF(factura: VentaFacturaPDF): Promise<void> {
  // Crear documento PDF en tamaño carta
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  // Colores del tema
  const colorPrimario: [number, number, number] = [76, 133, 87]; // #4C8557 (color-base-green)
  const colorSecundario: [number, number, number] = [144, 169, 131]; // #90A983 (color-tint1)
  const colorTexto: [number, number, number] = [51, 51, 51]; // #333
  const colorBorde: [number, number, number] = [200, 200, 200]; // Gris claro para bordes

  // Dimensiones de página
  const pageWidth = 216; // mm
  const pageHeight = 279; // mm
  const margin = 15; // mm
  const contentWidth = pageWidth - (margin * 2);

  // ===== ENCABEZADO =====
  doc.setFillColor(...colorPrimario);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Título principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', pageWidth / 2, 15, { align: 'center' });

  // Número de factura
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. ${factura.Numero_Factura}`, pageWidth / 2, 22, { align: 'center' });

  // Fecha
  doc.setFontSize(10);
  const fechaFormateada = new Date(factura.Fecha_Venta).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Fecha: ${fechaFormateada}`, pageWidth / 2, 28, { align: 'center' });

  // ===== INFORMACIÓN DE VENDEDOR Y COMPRADOR =====
  let yPos = 45;
  
  // Vendedor
  doc.setTextColor(...colorTexto);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(...colorSecundario);
  doc.rect(margin, yPos, contentWidth / 2 - 5, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('VENDEDOR', margin + 3, yPos + 4);

  doc.setTextColor(...colorTexto);
  doc.setFont('helvetica', 'normal');
  doc.text(factura.Vendedor, margin + 3, yPos + 10);

  // Comprador
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(...colorSecundario);
  doc.rect(margin + contentWidth / 2 + 5, yPos, contentWidth / 2 - 5, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('COMPRADOR', margin + contentWidth / 2 + 8, yPos + 4);

  doc.setTextColor(...colorTexto);
  doc.setFont('helvetica', 'normal');
  doc.text(factura.Comprador, margin + contentWidth / 2 + 8, yPos + 10);

  // ===== LÍNEA DIVISORIA =====
  yPos += 20;
  doc.setDrawColor(...colorPrimario);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // ===== TABLA DE DETALLES DEL ANIMAL =====
  yPos += 10;

  // Preparar datos de la tabla
  const animalInfo = [
    `Nombre: ${factura.Animal_Nombre}`,
    `Raza: ${factura.Animal_Raza}`,
    `Sexo: ${factura.Animal_Sexo === 'M' ? 'Macho' : 'Hembra'}`,
    `Peso: ${factura.Animal_Peso}`,
    `Color: ${factura.Animal_Color}`,
    `Categoría: ${factura.Animal_Categoria}`
  ].join('\n');

  autoTable(doc, {
    startY: yPos,
    head: [['Descripción del Animal', 'Cant.', 'Precio Unit.', 'Método de Pago', 'Observaciones']],
    body: [
      [
        animalInfo,
        factura.Cantidad.toString(),
        formatCurrency(factura.Precio_Unitario),
        factura.Metodo_Pago,
        factura.Observaciones
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: colorPrimario,
      textColor: [255, 255, 255] as [number, number, number],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 9,
      textColor: colorTexto,
      cellPadding: 4,
      lineColor: colorBorde,
      lineWidth: 0.1
    },
    columnStyles: {
      0: { 
        cellWidth: 45, 
        halign: 'left',
        valign: 'top'
      },
      1: { 
        cellWidth: 20, 
        halign: 'center',
        valign: 'top'
      },
      2: { 
        cellWidth: 35, 
        halign: 'left',
        valign: 'top'
      },
        3: { 
          cellWidth: 35, 
          halign: 'center',
          valign: 'top'
        },
        4: { 
          cellWidth: 51, 
          halign: 'left',
          valign: 'top'
        }
    },
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: 'linebreak',
      lineColor: colorBorde,
      lineWidth: 0.1
    }
  });

  // ===== TOTALES =====
  const finalY = doc.lastAutoTable.finalY + 15;
  
  // Crear tabla de totales simple
  autoTable(doc, {
    startY: finalY,
    body: [
      ['SUBTOTAL:', formatCurrency(factura.Subtotal)],
      [`IVA (${factura.IVA_Porcentaje}%):`, formatCurrency(factura.IVA_Monto)],
      ['TOTAL:', formatCurrency(factura.Total)]
    ],
    theme: 'plain',
    bodyStyles: {
      fontSize: 10,
      textColor: colorTexto,
      cellPadding: 3,
      lineColor: colorBorde,
      lineWidth: 0.1
    },
    columnStyles: {
      0: { 
        cellWidth: 70, 
        halign: 'center',
        fontStyle: 'bold'
      },
      1: { 
        cellWidth: 80, 
        halign: 'center',
        fontStyle: 'bold'
      }
    },
    margin: { left: pageWidth - margin - 150, right: margin },
    styles: {
      fontSize: 10,
      cellPadding: 3,
      overflow: 'linebreak'
    },
    didParseCell: (hookData) => {
      // Resaltar solo la última fila (TOTAL)
      if (hookData.section === 'body' && hookData.row.index === 2) {
        hookData.cell.styles.fillColor = colorPrimario;
        hookData.cell.styles.textColor = [255, 255, 255];
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fontSize = 11;
      }
    }  
  });

  // ===== INFORMACIÓN ADICIONAL =====
/*   const yInfo = doc.lastAutoTable.finalY + 20;
 */  
  // Método de pago
 /*  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colorTexto);
  doc.text('Método de Pago:', margin, yInfo);
  doc.setFont('helvetica', 'normal');
  doc.text(factura.Metodo_Pago, margin + 30, yInfo);

  // Observaciones si existen
  let yObservaciones = yInfo + 8;
  if (factura.Observaciones && factura.Observaciones.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones:', margin, yObservaciones);
    
    doc.setFont('helvetica', 'normal');
    const observacionesArray = doc.splitTextToSize(factura.Observaciones, contentWidth - 30);
    doc.text(observacionesArray, margin + 30, yObservaciones);
    yObservaciones += observacionesArray.length * 4;
  } */

  // ===== PIE DE PÁGINA =====
  const footerY = pageHeight - 20;
  
  // Línea superior del pie
  doc.setDrawColor(...colorPrimario);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // Texto del pie
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text('Gracias por su compra', pageWidth / 2, footerY + 6, { align: 'center' });
  doc.text(`Registrado por: ${factura.Registrado_Por_Nombre}`, pageWidth / 2, footerY + 11, { align: 'center' });
  doc.text('Sistema de Gestión Ganadera - Ganado360', pageWidth / 2, footerY + 16, { align: 'center' });

  // ===== GUARDAR PDF =====
  const nombreArchivo = `Factura-${factura.Numero_Factura}.pdf`;
  doc.save(nombreArchivo);
}

/**
 * Formatea un número o string a formato de moneda costarricense
 * @param valor - Valor a formatear
 * @returns String con formato ₡X,XXX.XX
 */
function formatCurrency(valor: string | number): string {
  const numValue = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(numValue)) return '₡0.00';
  
  // Formatear con separadores de miles y asegurar máximo 2 decimales
  const formatted = numValue.toLocaleString('es-CR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  
  // Limitar longitud para evitar desbordes en columnas pequeñas
  const result = `₡${formatted}`;
  return result.length > 15 ? `₡${numValue.toFixed(0)}` : result;
}

/**
 * Vista previa de la factura en una nueva pestaña (útil para debug)
 * @param factura - Datos completos de la factura
 */
export async function previsualizarFacturaPDF(factura: VentaFacturaPDF): Promise<void> {
  // Generar el PDF usando la función principal
  await generarFacturaPDF(factura);
  
  // Nota: Esta función podría ser modificada para mostrar una vista previa
  // en lugar de descargar directamente, pero por ahora usa la misma lógica
}