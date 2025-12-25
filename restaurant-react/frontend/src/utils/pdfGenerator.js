import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateOrderInvoice = (order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Primary Brand Color
    const primaryColor = [230, 81, 0]; // #e65100

    // Header Branding
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('MEALUP', 20, 25);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('RESTAURANT & DELIVERY', 20, 32);

    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`FACTURE N°: #${order.id}`, pageWidth - 20, 25, { align: 'right' });
    doc.text(`DATE: ${format(new Date(order.date_commande), 'dd/MM/yyyy HH:mm')}`, pageWidth - 20, 32, { align: 'right' });

    // Decorative Line
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, 40, pageWidth - 20, 40);

    // Bill To Section
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('CLIENT', 20, 50);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(order.client?.nom || 'Client', 20, 58);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text(order.client?.email || '', 20, 64);
    doc.text(`Tél: ${order.client?.telephone || 'Non renseigné'}`, 20, 70);

    // Order Details Section
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('DÉTAILS DE LA COMMANDE', pageWidth - 20, 50, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    const statusColor = order.statut === 'livré' ? [34, 197, 94] : [234, 179, 8];
    doc.setTextColor(...statusColor);
    doc.text(order.statut.toUpperCase(), pageWidth - 20, 58, { align: 'right' });

    // Table of Items
    const tableData = order.items.map(item => {
        let name = item.plat_nom;
        if (item.customization) {
            try {
                const cust = typeof item.customization === 'string' ? JSON.parse(item.customization) : item.customization;
                if (cust.removed?.length > 0) name += `\n- Sans: ${cust.removed.join(', ')}`;
                if (cust.added?.length > 0) name += `\n+ Extras: ${cust.added.map(e => e.nom).join(', ')}`;
            } catch (e) {
                // Not JSON or empty
            }
        }
        return [
            name,
            item.quantite,
            `${item.plat_prix.toLocaleString()} DA`,
            `${(item.quantite * item.plat_prix).toLocaleString()} DA`
        ];
    });

    autoTable(doc, {
        startY: 85,
        head: [['Article', 'Qté', 'Prix Unitaire', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { halign: 'center', cellWidth: 20 },
            2: { halign: 'right', cellWidth: 40 },
            3: { halign: 'right', cellWidth: 40 },
        },
        styles: { fontSize: 10, cellPadding: 5 },
    });

    // Summary Section
    const finalY = doc.lastAutoTable.finalY + 15;
    const summaryX = pageWidth - 80;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Sous-total:', summaryX, finalY);
    doc.setTextColor(0);
    doc.text(`${order.total.toLocaleString()} DA`, pageWidth - 20, finalY, { align: 'right' });

    const totalY = finalY + 10;
    doc.setDrawColor(200);
    doc.line(summaryX, totalY - 5, pageWidth - 20, totalY - 5);

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', summaryX, totalY);
    doc.text(`${order.total.toLocaleString()} DA`, pageWidth - 20, totalY, { align: 'right' });

    // Footer
    const footerY = 280;
    doc.setDrawColor(240);
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150);
    doc.text('Merci pour votre commande chez MealUp !', pageWidth / 2, footerY, { align: 'center' });
    doc.text('www.mealup.com | 05 55 55 55 55', pageWidth / 2, footerY + 5, { align: 'center' });

    doc.save(`Facture_MealUp_${order.id}.pdf`);
};

export const generateSalesSummary = (data, period) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = [230, 81, 0];

    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT ANALYTIQUE', 20, 25);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Périmètre: ${period}`, 20, 33);
    doc.text(`Généré le: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth - 20, 33, { align: 'right' });

    doc.line(20, 40, pageWidth - 20, 40);

    // Summary Stats Boxes
    const totalRev = data.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
    const totalOrders = data.reduce((sum, item) => sum + (parseInt(item.count || item.total_sold) || 0), 0);

    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, 50, (pageWidth - 50) / 2, 30, 3, 3, 'F');
    doc.roundedRect((pageWidth + 10) / 2, 50, (pageWidth - 50) / 2, 30, 3, 3, 'F');

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('REVENU TOTAL', 35, 60);
    doc.text('COMMANDES TOTALES', (pageWidth + 40) / 2, 60);

    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`${totalRev.toLocaleString()} DA`, 35, 72);
    doc.text(`${totalOrders.toLocaleString()}`, (pageWidth + 40) / 2, 72);

    // Table Section
    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text('Détails des performances', 20, 95);

    const tableData = data.map(item => {
        // Dynamic mapping based on data structure
        const label = item.date || item.category || item.plat_nom || (item.hour !== undefined ? item.hour + 'h' : null) || item.client?.nom || 'N/A';
        const volume = item.count || item.total_sold || item.order_count || 0;
        const revenue = item.revenue || item.total_spent || item.total_revenue || 0;

        return [
            label,
            volume,
            `${(parseFloat(revenue) || 0).toLocaleString()} DA`
        ];
    });

    autoTable(doc, {
        startY: 105,
        head: [['Identifiant', 'Volume', 'Revenu']],
        body: tableData,
        headStyles: { fillColor: primaryColor },
        theme: 'striped'
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150);
    doc.text('Ce rapport est généré automatiquement par le système d\'administration MealUp.', pageWidth / 2, finalY, { align: 'center' });

    doc.save(`Rapport_MealUp_${period.replace(/\s+/g, '_')}.pdf`);
};
