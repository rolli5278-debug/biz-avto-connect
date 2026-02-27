import { useQuery } from "@tanstack/react-query";
import { listCustomersWithBalance } from "@/services/customers.service";
import { listSales } from "@/services/sales.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function money(n: number) {
  return Number(n || 0).toLocaleString("uz-UZ");
}

export default function Dashboard() {
  const customersQ = useQuery({ queryKey: ["customers-balance"], queryFn: listCustomersWithBalance });
  const salesQ = useQuery({ queryKey: ["sales", { status: "all", payType: "all" }], queryFn: () => listSales({ status: "all", payType: "all" }) });

  const customers = customersQ.data ?? [];
  const sales = salesQ.data ?? [];

  const totalDebt = customers.reduce((sum: number, c: any) => sum + Number(c.debt || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = sales.filter((s) => s.date === today);
  const todayTotal = todaySales.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Umumiy ko‘rsatkichlar.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mijozlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jami qarz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{money(totalDebt)} so'm</div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bugungi sotuv</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{money(todayTotal)} so'm</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
