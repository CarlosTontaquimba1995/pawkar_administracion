import { jsPDF } from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import { appColors } from '@/theme/colors';

// Extend jsPDF with autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: UserOptions) => jsPDF;
    }
}

type ThemeColors = typeof appColors;

export const generateThemePdf = (colors: ThemeColors) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const tableStartY = 60;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Paleta de Colores del Tema', pageWidth / 2, 20, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, pageWidth - margin, 15, { align: 'right' });

    // Color table data
    const colorFields = [
        { label: 'Primario', value: colors.primary as string },
        { label: 'Secundario', value: colors.secondary as string },
        { label: 'Acento 1', value: colors.accent1 as string },
        { label: 'Acento 2', value: colors.accent2 as string },
    ];

    // Prepare table data - using string arrays for simplicity
    const tableData = colorFields.map(({ label, value }) => [
        label,
        value,
        '' // Empty cell for color swatch
    ]);

    // Generate table
    autoTable(doc, {
        startY: tableStartY,
        head: [['Nombre', 'Valor', 'Muestra']],
        body: tableData,
        didParseCell: (data) => {
            // Style the first column (index 0) to be bold
            if (data.column.index === 0) {
                data.cell.styles.fontStyle = 'bold';
            }
            // Set background color for the third column (index 2)
            if (data.column.index === 2) {
                const rowIndex = data.row.index - 1; // -1 because of header row
                if (rowIndex >= 0 && rowIndex < colorFields.length) {
                    data.cell.styles.fillColor = colorFields[rowIndex].value;
                }
            }
        },
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 10,
            cellPadding: 5,
            lineColor: [221, 221, 221],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: 40,
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 30 },
        },
        didDrawCell: (data: {
            column: { index: number };
            row: { index: number };
            cell: { x: number; y: number; width: number; height: number; section: string };
        }) => {
            // Draw color swatch
            if (data.column.index === 2 && data.cell.section === 'body') {
                const color = colorFields[data.row.index].value;
                doc.setFillColor(color);
                doc.rect(
                    data.cell.x + 2,
                    data.cell.y + 2,
                    data.cell.width - 4,
                    data.cell.height - 4,
                    'F' as any
                );
            }
        },
    });

    // Save the PDF
    doc.save('paleta-colores-tema.pdf');
};
