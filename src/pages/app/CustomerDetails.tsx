import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthProvider";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import ExportMenu from "@/components/ExportMenu";

import { buildCsv, downloadCsv } from "@/lib/csv";
import { listCustomersWithBalance } from "@/services/customers.service";
import { listSales } from "@/services/sales.service";
import { createPayment, deletePaymentById, listPaymentsByCustomer } from "@/services/payments.service";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function money(n: number) {
  return Number(n || 0).toLocaleString("uz-UZ");
}

const paySchema = z.object({
  amount: z.coerce.number().positive("Summa 0 dan katta bo‘lsin"),
  note: z.string().optional(),
});

export default function CustomerDetails() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const customersQ = useQuery({ queryKey: ["customers-balance"], queryFn: listCustomersWithBalance });
  const salesQ = useQuery({ queryKey: ["sales", { status: "all", payType: "all" }], queryFn: () => listSales({ status: "all", payType: "all" }) });
  const paymentsQ = useQuery({ queryKey: ["payments", id], queryFn: () => listPaymentsByCustomer(id), enabled: !!id });

  const customer = useMemo(() => {
    const rows = (customersQ.data ?? []) as any[];
    const row = rows.find((r) => r.customer_id === id);
    return row
      ? {
          id: row.customer_id,
          name: row.name,
          phone: row.phone,
          debt: Number(row.debt || 0),
          debtSalesSum: Number(row.debt_sales_sum || 0),
          paymentsSum: Number(row.payments_sum || 0),
        }
      : null;
  }, [customersQ.data, id]);

  const sales = useMemo(() => {
    const all = salesQ.data ?? [];
    return all.filter((s) => s.customerId === id);
  }, [salesQ.data, id]);

  const payments = paymentsQ.data ?? [];

  const exportSalesCsv = () => {
    if (!customer) return;
    const headers = ["Sale ID", "Sana", "To'lov", "Holat", "Summa", "Izoh"];
    const rows = sales.map((s) => [s.id, s.date, s.payType, s.status, s.amount, s.note ?? ""]);
    const csv = buildCsv(headers, rows, { withBom: true });
    downloadCsv(`${customer.name}_sales_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const exportPaymentsCsv = () => {
    if (!customer) return;
    const headers = ["Payment ID", "Sana", "Summa", "Izoh"];
    const rows = payments.map((p: any) => [p.id, p.date, p.amount, p.note ?? ""]);
    const csv = buildCsv(headers, rows, { withBom: true });
    downloadCsv(`${customer.name}_payments_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  // add payment
  const [openPay, setOpenPay] = useState(false);
  const form = useForm<z.infer<typeof paySchema>>({ resolver: zodResolver(paySchema), defaultValues: { amount: 0, note: "" } });

  const addMut = useMutation({
    mutationFn: (input: { customerId: string; amount: number; note?: string }) => createPayment(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers-balance"] });
      await qc.invalidateQueries({ queryKey: ["payments", id] });
      toast({ title: "Muvaffaqiyatli", description: "To‘lov qo‘shildi." });
      setOpenPay(false);
      form.reset({ amount: 0, note: "" });
    },
    onError: (e: any) => toast({ title: "Xatolik", description: e.message, variant: "destructive" }),
  });

  const delPayMut = useMutation({
    mutationFn: deletePaymentById,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers-balance"] });
      await qc.invalidateQueries({ queryKey: ["payments", id] });
      toast({ title: "O‘chirildi", description: "To‘lov o‘chirildi." });
    },
    onError: (e: any) => toast({ title: "Xatolik", description: e.message, variant: "destructive" }),
  });

  if (customersQ.isLoading) return <div className="text-sm text-muted-foreground">Yuklanmoqda...</div>;

  if (!customer) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline">
          <Link to="/app/customers" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Orqaga
          </Link>
        </Button>
        <Card className="border-border/70">
          <CardContent className="p-6 text-sm text-muted-foreground">Mijoz topilmadi.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Button asChild variant="outline">
            <Link to="/app/customers" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Mijozlar
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">{customer.phone ?? "Telefon yo‘q"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ExportMenu items={[{ label: "Sales CSV", onClick: exportSalesCsv }, { label: "Payments CSV", onClick: exportPaymentsCsv }]} />

          <Dialog open={openPay} onOpenChange={setOpenPay}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> To‘lov
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>To‘lov qo‘shish</DialogTitle></DialogHeader>

              <form
                className="grid gap-4"
                onSubmit={form.handleSubmit((v) =>
                  addMut.mutate({ customerId: customer.id, amount: v.amount, note: v.note?.trim() || undefined }),
                )}
              >
                <div className="grid gap-2">
                  <Label>Summa</Label>
                  <Input inputMode="numeric" {...form.register("amount")} onChange={(e) => form.setValue("amount", Number(e.target.value || 0))} />
                  {form.formState.errors.amount && <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>}
                </div>

                <div className="grid gap-2">
                  <Label>Izoh</Label>
                  <Input {...form.register("note")} />
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" type="submit" disabled={addMut.isPending}>Saqlash</Button>
                  <Button className="flex-1" variant="outline" type="button" onClick={() => setOpenPay(false)}>Bekor</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Joriy qarz</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{money(customer.debt)} so'm</div>
            <div className="mt-1 text-xs text-muted-foreground">
              <Badge variant={customer.debt > 0 ? "secondary" : "outline"}>{customer.debt > 0 ? "DEBT" : "OK"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Qarz sotuvlar</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{money(customer.debtSalesSum)} so'm</div></CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">To‘lovlar</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{money(customer.paymentsSum)} so'm</div></CardContent>
        </Card>
      </div>

      <Card className="border-border/70">
        <CardHeader><CardTitle>Sotuvlar</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead>To‘lov</TableHead>
                  <TableHead className="text-right">Summa</TableHead>
                  <TableHead>Holat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.id}</TableCell>
                    <TableCell className="text-muted-foreground">{s.date}</TableCell>
                    <TableCell><Badge variant="outline">{s.payType}</Badge></TableCell>
                    <TableCell className="text-right">{money(s.amount)} so'm</TableCell>
                    <TableCell><Badge variant={s.status === "Qarz" ? "secondary" : "default"}>{s.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {sales.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Sotuv yo‘q.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader><CardTitle>To‘lovlar</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead>Izoh</TableHead>
                  <TableHead className="text-right">Summa</TableHead>
                  <TableHead className="text-right">Amal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.id}</TableCell>
                    <TableCell className="text-muted-foreground">{p.date}</TableCell>
                    <TableCell className="text-muted-foreground">{p.note ?? "—"}</TableCell>
                    <TableCell className="text-right">{money(p.amount)} so'm</TableCell>
                    <TableCell className="text-right">
                      {isAdmin && (
                        <ConfirmDeleteDialog
                          title="To‘lov o‘chirilsinmi?"
                          description="O‘chirilsa, qarz qayta hisoblanadi."
                          onConfirm={() => delPayMut.mutate(p.id)}
                          trigger={
                            <Button variant="outline" size="sm" className="gap-2">
                              <Trash2 className="h-4 w-4" /> O‘chirish
                            </Button>
                          }
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">To‘lov yo‘q.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
