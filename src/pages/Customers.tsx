import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string;
  address: string;
  governorate: string;
  jobTitle: string;
  notes: string;
}

const initialCustomers: Customer[] = [
  { id: "C001", fullName: "أحمد محمد علي", nationalId: "29901011234567", phone: "01012345678", address: "شارع التحرير", governorate: "القاهرة", jobTitle: "مهندس", notes: "" },
  { id: "C002", fullName: "سارة أحمد حسن", nationalId: "30001021234567", phone: "01098765432", address: "شارع الهرم", governorate: "الجيزة", jobTitle: "طبيبة", notes: "عميل مميز" },
  { id: "C003", fullName: "محمود حسن إبراهيم", nationalId: "28501031234567", phone: "01112345678", address: "شارع النصر", governorate: "الإسكندرية", jobTitle: "تاجر", notes: "" },
];

const emptyCustomer: Omit<Customer, "id"> = {
  fullName: "", nationalId: "", phone: "", address: "", governorate: "", jobTitle: "", notes: "",
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState(emptyCustomer);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const filtered = customers.filter(
    (c) =>
      c.fullName.includes(search) ||
      c.phone.includes(search) ||
      c.nationalId.includes(search)
  );

  const handleSave = () => {
    if (!formData.fullName || !formData.phone) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    if (editingId) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...formData } : c))
      );
      toast({ title: "تم التحديث", description: "تم تحديث بيانات العميل بنجاح" });
    } else {
      const newId = `C${String(customers.length + 1).padStart(3, "0")}`;
      setCustomers((prev) => [...prev, { id: newId, ...formData }]);
      toast({ title: "تمت الإضافة", description: "تم إضافة العميل بنجاح" });
    }
    setFormData(emptyCustomer);
    setEditingId(null);
    setOpen(false);
  };

  const handleEdit = (customer: Customer) => {
    setFormData({ ...customer });
    setEditingId(customer.id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "تم الحذف", description: "تم حذف العميل بنجاح" });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="page-header mb-0">إدارة العملاء</h1>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setFormData(emptyCustomer); setEditingId(null); } }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة عميل
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "تعديل العميل" : "إضافة عميل جديد"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>الاسم الكامل *</Label>
                  <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>الرقم القومي</Label>
                  <Input value={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>الهاتف *</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>المحافظة</Label>
                  <Input value={formData.governorate} onChange={(e) => setFormData({ ...formData, governorate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>الوظيفة</Label>
                  <Input value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>العنوان</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>ملاحظات</Label>
                  <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full mt-4">
                {editingId ? "تحديث" : "حفظ"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الهاتف أو الرقم القومي..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-right p-3 font-medium text-muted-foreground">الكود</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">الاسم</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">الهاتف</th>
                    <th className="text-right p-3 font-medium text-muted-foreground hidden md:table-cell">المحافظة</th>
                    <th className="text-right p-3 font-medium text-muted-foreground hidden lg:table-cell">الوظيفة</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-primary">{c.id}</td>
                      <td className="p-3">{c.fullName}</td>
                      <td className="p-3" dir="ltr">{c.phone}</td>
                      <td className="p-3 hidden md:table-cell">{c.governorate}</td>
                      <td className="p-3 hidden lg:table-cell">{c.jobTitle}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد نتائج</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
