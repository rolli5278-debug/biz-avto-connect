import { useMemo, useState } from "react";
import { ExternalLink, MoreHorizontal, Plus, Search, Trash2, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthProvider";
import ExportMenu from "@/components/ExportMenu";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import CustomerCombobox, { type CustomerOption } from "@/components/CustomerCombobox";

import { buildCsv, downloadCsv } from "@/lib/csv";
import { createCustomer, deleteCustomerById, listCustomersWithBalance } from "@/services/customers.service";
import { createPayment } from "@/services/payments.service";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function money(n: number) {
  return Number(n || 0).toLocaleString("uz-UZ");
}

type BalanceRow = {
  customer_id: string;
  name: string;
  phone: string | null;
  debt: number;
};

const customerSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 ta belgi bo‘lsin"),
  phone: z.string().optional(),
});

const paySchema = z.object({
  amount: z.coerce.number().positive("Summa 0 dan katta bo‘lsin"),
  note: z.string().optional(),
});

export default function Customers() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [q, setQ] = useState("");

  const customersQ = useQuery({ queryKey: ["customers-balance"], queryFn: listCustomersWithBalance });
  const rows: BalanceRow[] = (customersQ.data ?? []) as any[];

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows
      .filter((c) => !query || c.name.toLowerCase().includes(query) || (c.phone?.toLowerCase().includes(query) ?? false))
      .sort((a, b) => Number(b.debt || 0) - Number(a.debt || 0));
  }, [rows, q]);

  const totalDebt = useMemo(() => filtered.reduce((sum, c) => sum + Number(c.debt || 0), 0), [filtered]);

  const customerOptions: CustomerOption[] = useMemo(
    () => rows.map((r) => ({ id: r.customer_id, name: r.name, phone: r.phone, debt: Number(r.debt || 0) })),
    [rows],
  );

  const exportCustomersCsv = () => {
    const headers = ["Customer ID", "Ism", "Telefon", "Qarz"];
    const csvRows = filtered.map((c) => [c.customer_id, c.name, c.phone ?? "", c.debt]);
    const csv = buildCsv(headers, csvRows, { withBom: true });
    downloadCsv(`customers_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  // Add customer
  const [openAdd, setOpenAdd] = useState(false);
  const addForm = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", phone: "" },
  });

  const addMut = useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers-balance"] });
      setOpenAdd(false);
      addForm.reset();
      toast({ title: "Muvaffaqiyatli", description: "Mijoz qo‘shildi." });
    },
    onError: (e: any) => toast({ title: "Xatolik", description: e.message, variant: "destructive" }),
  });

  // Delete customer (admin only)
  const delMut = useMutation({
    mutationFn: deleteCustomerById,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers-balance"] });
      toast({ title: "O‘chirildi", description: "Mijoz o‘chirildi." });
    },
    onError: (e: any) => toast({ title: "Xatolik", description: e.message, variant: "destructive" }),
  });

  // Pay modal
  const [openPay, setOpenPay] = useState(false);
  const [payCustomerId, setPayCustomerId] = useState("");
  const payForm = useForm<z.infer<typeof paySchema>>({
    resolver: zodResolver(paySchema),
    defaultValues: { amount: 0, note: "" },
  });

  const openPayFor = (customerId: string) => {
    setPayCustomerId(customerId);
    payForm.reset({ amount: 0, note: "" });
    setOpenPay(true);
  };

  const payMut = useMutation({
    mutationFn: (input: { customerId: string; amount: number; note?: string }) => createPayment(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers-balance"] });
      setOpenPay(false);
      toast({ title: "Muvaffaqiyatli", description: "To‘lov qo‘shildi." });
    },
    onError: (e: any) => toast({ title: "Xatolik", description: e.message, variant: "destructive" }),
  });

  if (customersQ.isLoading) return <div className="text-sm text-muted-foreground">Yuklanmoqda...</div>;
  if (customersQ.isError) return <div className="text-sm text-destructive">Xatolik: {(customersQ.error as any)?.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Mijozlar va qarzlar.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ExportMenu items={[{ label: "Customers CSV", onClick: exportCustomersCsv }]} />

          <Dialog open={openPay} onOpenChange={setOpenPay}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Wallet className="h-4 w-4" /> Qarz to‘lash
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Qarz to‘lash</DialogTitle></DialogHeader>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Mijoz</Label>
                  <CustomerCombobox customers={customerOptions} value={payCustomerId} onChange={setPayCustomerId} />
                </div>

                <form
                  className="grid gap-4"
                  onSubmit={payForm.handleSubmit((v) => {
                    if (!payCustomerId) {
                      toast({ title: "Xatolik", description: "Mijoz tanlang.", variant: "destructive" });
                      return;
                    }
                    payMut.mutate({ customerId: payCustomerId, amount: v.amount, note: v.note?.trim() || undefined });
                  })}
                >
                  <div className="grid gap-2">
                    <Label>Summa</Label>
                    <Input inputMode="numeric" {...payForm.register("amount")} onChange={(e) => payForm.setValue("amount", Number(e.target.value || 0))} />
                    {payForm.formState.errors.amount && <p className="text-xs text-destructive">{payForm.formState.errors.amount.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label>Izoh (ixtiyoriy)</Label>
                    <Input {...payForm.register("note")} />
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" type="submit" disabled={payMut.isPending}>Saqlash</Button>
                    <Button className="flex-1" variant="outline" type="button" onClick={() => setOpenPay(false)}>Bekor</Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Yangi mijoz</DialogTitle></DialogHeader>

              <form
                className="grid gap-4"
                onSubmit={addForm.handleSubmit((v) => addMut.mutate({ name: v.name, phone: v.phone?.trim() || undefined }))}
              >
                <div className="grid gap-2">
                  <Label>Ism</Label>
                  <Input {...addForm.register("name")} />
                  {addForm.formState.errors.name && <p className="text-xs text-destructive">{addForm.formState.errors.name.message}</p>}
                </div>

                <div className="grid gap-2">
                  <Label>Telefon</Label>
                  <Input {...addForm.register("phone")} />
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" type="submit" disabled={addMut.isPending}>Saqlash</Button>
                  <Button className="flex-1" variant="outline" type="button" onClick={() => setOpenAdd(false)}>Bekor</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Mijozlar</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{filtered.length}</div></CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Jami qarz</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{money(totalDebt)} so'm</div></CardContent>
        </Card>
      </div>

      <Card className="border-border/70">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Ro‘yxat</CardTitle>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidirish..." className="pl-9" />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ism</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead className="text-right">Qarz</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead className="text-right">Amal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.customer_id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.phone ?? "—"}</TableCell>
                    <TableCell className="text-right">{money(c.debt)} so'm</TableCell>
                    <TableCell>{Number(c.debt || 0) > 0 ? <Badge variant="secondary">Qarz</Badge> : <Badge variant="outline">Toza</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" aria-label="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/app/customers/${c.customer_id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" /> Ochish
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPayFor(c.customer_id)}>
                            <Wallet className="mr-2 h-4 w-4" /> Qarz to‘lash
                          </DropdownMenuItem>

                          {isAdmin && (
                            <ConfirmDeleteDialog
                              title="Mijoz o‘chirilsinmi?"
                              description="Mijoz o‘chirilsa, sotuv va to‘lovlari ham o‘chadi."
                              onConfirm={() => delMut.mutate(c.customer_id)}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" /> O‘chirish
                                </DropdownMenuItem>
                              }
                            />
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      Natija topilmadi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
