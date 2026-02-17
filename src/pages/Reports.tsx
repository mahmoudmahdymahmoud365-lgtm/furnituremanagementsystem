import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, UserCog } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const salesData = [
  { invoice: "INV-001", customer: "أحمد محمد", date: "2025-06-15", total: 24000, paid: 15000 },
  { invoice: "INV-002", customer: "سارة أحمد", date: "2025-06-16", total: 33500, paid: 0 },
];

const customerBalances = [
  { name: "أحمد محمد علي", totalInvoices: 24000, totalPaid: 15000, balance: 9000 },
  { name: "سارة أحمد حسن", totalInvoices: 33500, totalPaid: 0, balance: 33500 },
  { name: "محمود حسن إبراهيم", totalInvoices: 0, totalPaid: 0, balance: 0 },
];

const commissionData = [
  { name: "محمد سعيد", totalSales: 24000, commission: 3, commissionAmount: 720 },
  { name: "علي حسن", totalSales: 33500, commission: 2.5, commissionAmount: 837.5 },
];

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("2025-06-01");
  const [dateTo, setDateTo] = useState("2025-06-30");

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="page-header">التقارير</h1>

        <Tabs defaultValue="sales" dir="rtl">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="sales" className="gap-2"><BarChart3 className="h-4 w-4" />المبيعات</TabsTrigger>
            <TabsTrigger value="balances" className="gap-2"><Users className="h-4 w-4" />أرصدة العملاء</TabsTrigger>
            <TabsTrigger value="commissions" className="gap-2"><UserCog className="h-4 w-4" />العمولات</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">تقرير المبيعات</CardTitle>
                <div className="flex gap-4 mt-2">
                  <div className="space-y-1"><Label className="text-xs">من</Label><Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} dir="ltr" className="w-40" /></div>
                  <div className="space-y-1"><Label className="text-xs">إلى</Label><Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} dir="ltr" className="w-40" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-right p-3 font-medium text-muted-foreground">الفاتورة</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">العميل</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">التاريخ</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">الإجمالي</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">المدفوع</th>
                  </tr></thead>
                  <tbody>
                    {salesData.map((s) => (
                      <tr key={s.invoice} className="border-b last:border-0">
                        <td className="p-3 font-medium text-primary">{s.invoice}</td>
                        <td className="p-3">{s.customer}</td>
                        <td className="p-3">{s.date}</td>
                        <td className="p-3">{s.total.toLocaleString()} ج.م</td>
                        <td className="p-3">{s.paid.toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances">
            <Card>
              <CardHeader><CardTitle className="text-base">أرصدة العملاء</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-right p-3 font-medium text-muted-foreground">العميل</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">إجمالي الفواتير</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">المدفوع</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">الرصيد المتبقي</th>
                  </tr></thead>
                  <tbody>
                    {customerBalances.map((c) => (
                      <tr key={c.name} className="border-b last:border-0">
                        <td className="p-3">{c.name}</td>
                        <td className="p-3">{c.totalInvoices.toLocaleString()} ج.م</td>
                        <td className="p-3 text-success">{c.totalPaid.toLocaleString()} ج.م</td>
                        <td className="p-3 text-destructive font-medium">{c.balance.toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card>
              <CardHeader><CardTitle className="text-base">تقرير العمولات</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-right p-3 font-medium text-muted-foreground">الموظف</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">إجمالي المبيعات</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">نسبة العمولة</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">مبلغ العمولة</th>
                  </tr></thead>
                  <tbody>
                    {commissionData.map((c) => (
                      <tr key={c.name} className="border-b last:border-0">
                        <td className="p-3">{c.name}</td>
                        <td className="p-3">{c.totalSales.toLocaleString()} ج.م</td>
                        <td className="p-3">{c.commission}%</td>
                        <td className="p-3 font-medium text-accent">{c.commissionAmount.toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
