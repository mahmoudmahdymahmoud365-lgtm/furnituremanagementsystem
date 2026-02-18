import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, FileText, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InvoicePrint from "@/components/InvoicePrint";

interface InvoiceItem {
  productName: string;
  qty: number;
  unitPrice: number;
  lineDiscount: number;
}

interface Invoice {
  id: string;
  customer: string;
  branch: string;
  employee: string;
  date: string;
  items: InvoiceItem[];
  status: string;
  paidTotal: number;
  commissionPercent: number;
}

const calcLineTotal = (item: InvoiceItem) => item.qty * item.unitPrice - item.lineDiscount;
const calcTotal = (items: InvoiceItem[]) => items.reduce((sum, item) => sum + calcLineTotal(item), 0);

const initialInvoices: Invoice[] = [
  {
    id: "INV-001", customer: "أحمد محمد علي", branch: "القاهرة", employee: "محمد سعيد",
    date: "2025-06-15",
    items: [{ productName: "غرفة نوم كاملة", qty: 1, unitPrice: 25000, lineDiscount: 1000 }],
    status: "مؤكدة", paidTotal: 15000, commissionPercent: 3,
  },
  {
    id: "INV-002", customer: "سارة أحمد حسن", branch: "الجيزة", employee: "علي حسن",
    date: "2025-06-16",
    items: [
      { productName: "طقم أنتريه مودرن", qty: 1, unitPrice: 18000, lineDiscount: 0 },
      { productName: "دولاب ملابس", qty: 2, unitPrice: 8000, lineDiscount: 500 },
    ],
    status: "مسودة", paidTotal: 0, commissionPercent: 2.5,
  },
];

const statusColors: Record<string, string> = {
  "مسودة": "bg-muted text-muted-foreground",
  "مؤكدة": "bg-info/10 text-info",
  "تم التسليم": "bg-success/10 text-success",
  "مغلقة": "bg-muted text-muted-foreground",
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState("");
  const [branch, setBranch] = useState("");
  const [employee, setEmployee] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ productName: "", qty: 1, unitPrice: 0, lineDiscount: 0 }]);
  const [commissionPercent, setCommissionPercent] = useState(0);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrint = (inv: Invoice) => {
    setPrintInvoice(inv);
    setTimeout(() => {
      const content = printRef.current;
      if (!content) return;
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(`
        <html dir="rtl">
          <head>
            <title>فاتورة ${inv.id}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: 'Cairo', sans-serif; }
              @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
            </style>
          </head>
          <body>${content.innerHTML}</body>
        </html>
      `);
      win.document.close();
      win.focus();
      win.print();
      win.close();
      setPrintInvoice(null);
    }, 100);
  };

  const addItem = () => setItems([...items, { productName: "", qty: 1, unitPrice: 0, lineDiscount: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof InvoiceItem, value: string | number) =>
    setItems(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));

  const handleSave = () => {
    if (!customer || items.some((i) => !i.productName)) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    const newId = `INV-${String(invoices.length + 1).padStart(3, "0")}`;
    setInvoices([...invoices, {
      id: newId, customer, branch, employee,
      date: new Date().toISOString().split("T")[0],
      items: [...items], status: "مسودة", paidTotal: 0, commissionPercent,
    }]);
    toast({ title: "تمت الإضافة", description: "تم إنشاء الفاتورة بنجاح" });
    setCustomer(""); setBranch(""); setEmployee(""); setCommissionPercent(0);
    setItems([{ productName: "", qty: 1, unitPrice: 0, lineDiscount: 0 }]);
    setOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="page-header mb-0">فواتير المبيعات</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 ml-2" />فاتورة جديدة</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>إنشاء فاتورة جديدة</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="space-y-1.5"><Label>العميل *</Label><Input value={customer} onChange={(e) => setCustomer(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>الفرع</Label><Input value={branch} onChange={(e) => setBranch(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>الموظف</Label><Input value={employee} onChange={(e) => setEmployee(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>نسبة العمولة %</Label><Input type="number" value={commissionPercent} onChange={(e) => setCommissionPercent(Number(e.target.value))} dir="ltr" /></div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">بنود الفاتورة</h3>
                  <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 ml-1" />إضافة بند</Button>
                </div>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 items-end p-3 bg-muted/50 rounded-lg">
                      <div className="space-y-1"><Label className="text-xs">المنتج</Label><Input value={item.productName} onChange={(e) => updateItem(i, "productName", e.target.value)} className="text-sm" /></div>
                      <div className="space-y-1"><Label className="text-xs">الكمية</Label><Input type="number" value={item.qty} onChange={(e) => updateItem(i, "qty", Number(e.target.value))} dir="ltr" className="text-sm" /></div>
                      <div className="space-y-1"><Label className="text-xs">السعر</Label><Input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))} dir="ltr" className="text-sm" /></div>
                      <div className="space-y-1"><Label className="text-xs">الخصم</Label><Input type="number" value={item.lineDiscount} onChange={(e) => updateItem(i, "lineDiscount", Number(e.target.value))} dir="ltr" className="text-sm" /></div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium whitespace-nowrap">{calcLineTotal(item).toLocaleString()}</span>
                        {items.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive h-8 w-8"><Trash2 className="h-3 w-3" /></Button>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4 p-3 bg-primary/5 rounded-lg">
                  <div className="text-left">
                    <span className="text-muted-foreground text-sm">الإجمالي: </span>
                    <span className="text-xl font-bold text-primary">{calcTotal(items).toLocaleString()} ج.م</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full mt-4">حفظ الفاتورة</Button>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-right p-3 font-medium text-muted-foreground">رقم الفاتورة</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">العميل</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">التاريخ</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">الإجمالي</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">العمولة %</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">مبلغ العمولة</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">المدفوع</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">المتبقي</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">الحالة</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const total = calcTotal(inv.items);
                    const commissionAmount = total * (inv.commissionPercent / 100);
                    const remaining = total - inv.paidTotal;
                    return (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium text-primary">{inv.id}</td>
                        <td className="p-3">{inv.customer}</td>
                        <td className="p-3">{inv.date}</td>
                        <td className="p-3">{total.toLocaleString()} ج.م</td>
                        <td className="p-3">{inv.commissionPercent}%</td>
                        <td className="p-3 text-accent-foreground">{commissionAmount.toLocaleString()} ج.م</td>
                        <td className="p-3 text-success">{inv.paidTotal.toLocaleString()} ج.م</td>
                        <td className="p-3 text-destructive">{remaining.toLocaleString()} ج.م</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inv.status] || ""}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="icon" onClick={() => handlePrint(inv)} title="طباعة">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Hidden print area */}
        <div className="hidden">
          {printInvoice && <InvoicePrint ref={printRef} invoice={printInvoice} />}
        </div>
      </div>
    </AppLayout>
  );
}
