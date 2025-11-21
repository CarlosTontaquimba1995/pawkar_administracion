import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Plantilla } from '../../../types/plantilla.types';

/**
 * Generate PDF report for a single team's players
 */
export const generatePlayersByTeamPDF = (players: Plantilla[], teamName: string) => {
  const doc = new jsPDF();

  // Set document properties
  doc.setProperties({
    title: `Plantilla - ${teamName}`,
    subject: 'Reporte de Jugadores por Equipo',
    author: 'Pawkar Administración',
    keywords: 'jugadores, equipo, plantilla',
    creator: 'Pawkar System'
  });

  // Add header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Reporte de Jugadores', 105, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(`Equipo: ${teamName}`, 105, 30, { align: 'center' });

  // Add generation date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generado: ${currentDate}`, 105, 38, { align: 'center' });

  // Prepare table data with truncated names if needed
  const tableData = players.map(player => [
    player.numeroCamiseta.toString(),
    player.jugadorNombreCompleto,
    player.rolNombre,
    player.tieneSancion ? 'Sí' : 'No',
    player.tieneSancion && player.sanciones.length > 0
      ? player.sanciones.map(s => s.tipoSancion).join(', ')
      : '-'
  ]);

  // Generate table with adjusted column widths
  autoTable(doc, {
    startY: 45,
    head: [['Nº', 'Nombre', 'Rol', 'Sanc.', 'Detalle']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8
    },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      lineWidth: 0.1,
      overflow: 'linebreak',
      cellWidth: 'wrap',
      minCellHeight: 10
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },  // Número
      1: { cellWidth: 60, fontStyle: 'bold' }, // Nombre
      2: { cellWidth: 25 },                   // Rol
      3: { halign: 'center', cellWidth: 15 }, // Sancionado
      4: { cellWidth: 80 }                    // Detalle
    },
    margin: { left: 5, right: 5 },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  });

  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 45;
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Total de jugadores: ${players.length}`, 14, finalY + 15);

  const sanctionedPlayers = players.filter(p => p.tieneSancion).length;
  doc.text(`Jugadores sancionados: ${sanctionedPlayers}`, 14, finalY + 22);

  // Save the PDF
  doc.save(`Plantilla_${teamName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
};

/**
 * Generate PDF report for all teams
 */
export const generateAllTeamsPDF = (allPlantillas: Plantilla[]) => {
  const doc = new jsPDF();

  // Set document properties
  doc.setProperties({
    title: 'Plantillas - Todos los Equipos',
    subject: 'Reporte Completo de Jugadores',
    author: 'Pawkar Administración',
    keywords: 'jugadores, equipos, plantillas',
    creator: 'Pawkar System'
  });

  // Group players by team
  const teamGroups = allPlantillas.reduce((acc, player) => {
    if (!acc[player.equipoNombre]) {
      acc[player.equipoNombre] = [];
    }
    acc[player.equipoNombre].push(player);
    return acc;
  }, {} as Record<string, Plantilla[]>);

  const teamNames = Object.keys(teamGroups).sort();
  let isFirstPage = true;

  teamNames.forEach((teamName, index) => {
    const players = teamGroups[teamName];

    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    // Add header for each team
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Reporte de Jugadores - Todos los Equipos', 105, 15, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text(`${index + 1}. ${teamName}`, 14, 30);

    // Prepare table data for this team with optimized formatting
    const tableData = players.map(player => [
      player.numeroCamiseta.toString(),
      player.jugadorNombreCompleto,
      player.rolNombre,
      player.tieneSancion ? 'Sí' : 'No'
    ]);

    // Generate table for this team with adjusted layout
    autoTable(doc, {
      startY: 35,
      head: [['Nº', 'Nombre', 'Rol', 'Sanc.']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineWidth: 0.1,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        minCellHeight: 10
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },  // Número
        1: { cellWidth: 90, fontStyle: 'bold' }, // Nombre
        2: { cellWidth: 40 },                   // Rol
        3: { halign: 'center', cellWidth: 15 }   // Sancionado
      },
      margin: { left: 5, right: 5 },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);

        // Generation date
        const currentDate = new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        doc.text(`Generado: ${currentDate}`, 14, doc.internal.pageSize.getHeight() - 10);

        // Page number
        doc.text(
          `Página ${data.pageNumber}`,
          doc.internal.pageSize.getWidth() - 14,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'right' }
        );
      }
    });

    // Add team summary
    const finalY = (doc as any).lastAutoTable.finalY || 35;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total: ${players.length} jugadores`, 14, finalY + 10);
  });

  // Save the PDF
  doc.save(`Plantillas_Todos_Equipos_${new Date().getTime()}.pdf`);
};
