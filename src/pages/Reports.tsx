import { ExportButtons } from "@/components/ExportButtons";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Users, UserCog } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvoices, useCustomers, useEmployees } from "@/data/hooks";
import type { InvoiceItem } from "@/data/types";

const calcTotal = (items: InvoiceItem[]) => items.reduce((sum, i) => sum + (i.qty * i.unitPrice - i.lineDiscount), 0);

export default function Reports() {
  const { invoices } = useInvoices();
  const { customers } = useCustomers();
  const { employees } = useEmployees();
  const [dateFrom, setDateFrom] = useState("2025-06-01");
  const [dateTo, setDateTo] = useState("2025-06-30");

  const filteredInvoices = invoices.filter((inv) => inv.date >= dateFrom && inv.date <= dateTo);

  // Customer balances from real data
  const customerBalances = customers.map((c) => {
    const custInvoices = invoices.filter((inv) => inv.customer === c.fullName);
    const totalInvoices = custInvoices.reduce((s, inv) => s + calcTotal(inv.items), 0);
    const totalPaid = custInvoices.reduce((s, inv) => s + inv.paidTotal, 0);
    return { name: c.fullName, totalInvoices, totalPaid, balance: totalInvoices - totalPaid };
  });

  // Commission data from real invoices
  const empCommissions = employees
    .filter((e) => e.role === "مبيعات")
    .map((e) => {
      const empInvoices = invoices.filter((inv) => inv.employee === e.name);
      const totalSales = empInvoices.reduce((s, inv) => s + calcTotal(inv.items), 0);
      const commissionAmount = empInvoices.reduce((s, inv) => s + calcTotal(inv.items) * (inv.commissionPercent / 100), 0);
      return { name: e.name, monthlySalary: e.monthlySalary, totalSales, commissionAmount, totalDue: e.monthlySalary + commissionAmount };
    });

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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="text-base">تقرير المبيعات</CardTitle>
                  <ExportButtons
                    data={filteredInvoices.map((inv) => ({ id: inv.id, customer: inv.customer, date: inv.date, total: calcTotal(inv.items), paidTotal: inv.paidTotal }))}
                    headers={[{ key: "id", label: "الفاتورة" }, { key: "customer", label: "العميل" }, { key: "date", label: "التاريخ" }, { key: "total", label: "الإجمالي" }, { key: "paidTotal", label: "المدفوع" }]}
                    fileName="تقرير_المبيعات"
                    title="تقرير المبيعات"
                  />
                </div>
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
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="border-b last:border-0">
                        <td className="p-3 font-medium text-primary">{inv.id}</td>
                        <td className="p-3">{inv.customer}</td>
                        <td className="p-3">{inv.date}</td>
                        <td className="p-3">{calcTotal(inv.items).toLocaleString()} ج.م</td>
                        <td className="p-3">{inv.paidTotal.toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="text-base">أرصدة العملاء</CardTitle>
                  <ExportButtons
                    data={customerBalances as any}
                    headers={[{ key: "name", label: "العميل" }, { key: "totalInvoices", label: "إجمالي الفواتير" }, { key: "totalPaid", label: "المدفوع" }, { key: "balance", label: "الرصيد المتبقي" }]}
                    fileName="أرصدة_العملاء"
                    title="أرصدة العملاء"
                  />
                </div>
              </CardHeader>
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
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="text-base">تقرير العمولات والمرتبات</CardTitle>
                  <ExportButtons
                    data={empCommissions as any}
                    headers={[{ key: "name", label: "الموظف" }, { key: "monthlySalary", label: "المرتب الثابت" }, { key: "totalSales", label: "إجمالي المبيعات" }, { key: "commissionAmount", label: "إجمالي العمولات" }, { key: "totalDue", label: "المستحق الكلي" }]}
                    fileName="تقرير_العمولات"
                    title="تقرير العمولات والمرتبات"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-right p-3 font-medium text-muted-foreground">الموظف</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">المرتب الثابت</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">إجمالي المبيعات</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">إجمالي العمولات</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">المستحق الكلي</th>
                  </tr></thead>
                  <tbody>
                    {empCommissions.map((c) => (
                      <tr key={c.name} className="border-b last:border-0">
                        <td className="p-3">{c.name}</td>
                        <td className="p-3">{c.monthlySalary.toLocaleString()} ج.م</td>
                        <td className="p-3">{c.totalSales.toLocaleString()} ج.م</td>
                        <td className="p-3 text-accent-foreground">{c.commissionAmount.toLocaleString()} ج.م</td>
                        <td className="p-3 font-bold text-primary">{c.totalDue.toLocaleString()} ج.م</td>
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
