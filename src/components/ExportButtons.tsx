import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonsProps {
  data: Record<string, unknown>[];
  headers: { key: string; label: string }[];
  fileName: string;
  title: string;
}

export function ExportButtons({ data, headers, fileName, title }: ExportButtonsProps) {
  const { toast } = useToast();

  const exportToExcel = async () => {
    const XLSX = await import("xlsx");
    const rows = data.map((row) =>
      Object.fromEntries(headers.map((h) => [h.label, row[h.key] ?? ""]))
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    // Set RTL
    ws["!cols"] = headers.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    toast({ title: "تم التصدير", description: `تم تصدير ${fileName}.xlsx بنجاح` });
  };

  const exportToPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Use a built-in font (no Arabic shaping, but functional)
    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString("ar-EG"), doc.internal.pageSize.getWidth() / 2, 22, { align: "center" });

    const tableHeaders = headers.map((h) => h.label).reverse();
    const tableRows = data.map((row) =>
      headers.map((h) => String(row[h.key] ?? "")).reverse()
    );

    (doc as any).autoTable({
      head: [tableHeaders],
      body: tableRows,
      startY: 28,
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 3,
        halign: "right",
      },
      headStyles: {
        fillColor: [30, 70, 50],
        textColor: 255,
        halign: "right",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 28 },
    });

    doc.save(`${fileName}.pdf`);
    toast({ title: "تم التصدير", description: `تم تصدير ${fileName}.pdf بنجاح` });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportToExcel}>
        <FileSpreadsheet className="h-4 w-4 ml-1" />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={exportToPDF}>
        <FileText className="h-4 w-4 ml-1" />
        PDF
      </Button>
    </div>
  );
}
