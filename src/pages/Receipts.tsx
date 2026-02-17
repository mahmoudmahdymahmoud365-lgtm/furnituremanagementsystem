import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Receipt {
  id: string;
  invoiceId: string;
  customer: string;
  amount: number;
  date: string;
  method: string;
  notes: string;
}

const initialReceipts: Receipt[] = [
  { id: "R001", invoiceId: "INV-001", customer: "أحمد محمد علي", amount: 10000, date: "2025-06-15", method: "نقدي", notes: "" },
  { id: "R002", invoiceId: "INV-001", customer: "أحمد محمد علي", amount: 5000, date: "2025-06-20", method: "تحويل بنكي", notes: "دفعة ثانية" },
];

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ invoiceId: "", customer: "", amount: 0, method: "نقدي", notes: "" });
  const { toast } = useToast();

  const handleSave = () => {
    if (!form.invoiceId || !form.amount) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    const newId = `R${String(receipts.length + 1).padStart(3, "0")}`;
    setReceipts([...receipts, { id: newId, ...form, date: new Date().toISOString().split("T")[0] }]);
    toast({ title: "تم التسجيل", description: "تم تسجيل المقبوضة بنجاح" });
    setForm({ invoiceId: "", customer: "", amount: 0, method: "نقدي", notes: "" });
    setOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="page-header mb-0">المقبوضات</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 ml-2" />تسجيل مقبوضة</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>تسجيل مقبوضة جديدة</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-1.5"><Label>رقم الفاتورة *</Label><Input value={form.invoiceId} onChange={(e) => setForm({ ...form, invoiceId: e.target.value })} dir="ltr" /></div>
                <div className="space-y-1.5"><Label>العميل</Label><Input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>المبلغ *</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} dir="ltr" /></div>
                <div className="space-y-1.5"><Label>طريقة الدفع</Label><Input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>ملاحظات</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <Button onClick={handleSave} className="w-full mt-4">حفظ</Button>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-right p-3 font-medium text-muted-foreground">الكود</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">رقم الفاتورة</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">العميل</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">المبلغ</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">التاريخ</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">طريقة الدفع</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-primary">{r.id}</td>
                      <td className="p-3">{r.invoiceId}</td>
                      <td className="p-3">{r.customer}</td>
                      <td className="p-3">{r.amount.toLocaleString()} ج.م</td>
                      <td className="p-3">{r.date}</td>
                      <td className="p-3">{r.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
