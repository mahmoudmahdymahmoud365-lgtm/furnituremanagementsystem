import {
  TrendingUp, Users, FileText, DollarSign, ArrowUpLeft, ArrowDownLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { AppLayout } from "@/components/layout/AppLayout";
import { useInvoices, useCustomers, useReceipts } from "@/data/hooks";
import type { InvoiceItem } from "@/data/types";

const calcTotal = (items: InvoiceItem[]) => items.reduce((s, i) => s + (i.qty * i.unitPrice - i.lineDiscount), 0);

const COLORS = [
  "hsl(172, 66%, 26%)", "hsl(38, 92%, 50%)", "hsl(205, 79%, 52%)", "hsl(142, 71%, 35%)", "hsl(220, 10%, 70%)",
];

const statusColors: Record<string, string> = {
  "مسودة": "bg-muted text-muted-foreground",
  "مؤكدة": "bg-info/10 text-info",
  "تم التسليم": "bg-success/10 text-success",
  "مغلقة": "bg-muted text-muted-foreground",
};

export default function Dashboard() {
  const { invoices } = useInvoices();
  const { customers } = useCustomers();
  const { receipts } = useReceipts();

  const totalSales = invoices.reduce((s, inv) => s + calcTotal(inv.items), 0);
  const totalPaid = invoices.reduce((s, inv) => s + inv.paidTotal, 0);
  const totalPending = totalSales - totalPaid;

  const stats = [
    { title: "إجمالي المبيعات", value: `${totalSales.toLocaleString()} ج.م`, icon: DollarSign, change: "+١٢%", up: true },
    { title: "عدد الفواتير", value: String(invoices.length), icon: FileText, change: `${invoices.length}`, up: true },
    { title: "الأرصدة المعلقة", value: `${totalPending.toLocaleString()} ج.م`, icon: TrendingUp, change: "", up: false },
    { title: "عدد العملاء", value: String(customers.length), icon: Users, change: `${customers.length}`, up: true },
  ];

  // Product breakdown for pie chart
  const productMap = new Map<string, number>();
  invoices.forEach((inv) => inv.items.forEach((item) => {
    productMap.set(item.productName, (productMap.get(item.productName) || 0) + (item.qty * item.unitPrice - item.lineDiscount));
  }));
  const topProducts = Array.from(productMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Monthly sales (simple grouping)
  const monthMap = new Map<string, number>();
  invoices.forEach((inv) => {
    const m = inv.date.substring(0, 7);
    monthMap.set(m, (monthMap.get(m) || 0) + calcTotal(inv.items));
  });
  const salesByMonth = Array.from(monthMap.entries()).map(([month, sales]) => ({ month, sales }));

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="page-header">لوحة التحكم</h1>
          <p className="text-muted-foreground -mt-4 mb-6">مرحباً بك في نظام إدارة الأثاث</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.title} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">المبيعات الشهرية</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214, 20%, 88%)", fontFamily: "Cairo" }} />
                  <Bar dataKey="sales" fill="hsl(172, 66%, 26%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">أعلى المنتجات مبيعاً</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={topProducts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {topProducts.map((_, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: "Cairo", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {topProducts.map((product, i) => (
                  <div key={product.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-muted-foreground">{product.name}</span>
                    <span className="mr-auto font-medium">{product.value.toLocaleString()} ج.م</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">آخر الفواتير</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-right pb-3 font-medium">رقم الفاتورة</th>
                    <th className="text-right pb-3 font-medium">العميل</th>
                    <th className="text-right pb-3 font-medium">المبلغ</th>
                    <th className="text-right pb-3 font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(-4).reverse().map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{inv.id}</td>
                      <td className="py-3">{inv.customer}</td>
                      <td className="py-3">{calcTotal(inv.items).toLocaleString()} ج.م</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inv.status] || ""}`}>{inv.status}</span>
                      </td>
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
