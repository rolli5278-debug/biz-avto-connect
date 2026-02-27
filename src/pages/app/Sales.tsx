import { useMemo, useState } from "react";
import { CalendarDays, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
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
import { listCustomersWithBalance } from "@/services/customers.service";
import { createSale, deleteSaleById, listSales, type PayType, type SaleStatus } from "@/services/sales.service";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function money(n: number) {
  return Number(n || 0).toLocaleString("uz-UZ");
}
function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const saleSchema = z.object({
  amount: z.coerce.number().positive("Summa 0 dan katta bo‘lsin"),
  payType: z.enum(["Naqd", "Terminal", "O'tkazma"]),
  status: z.enum(["To'landi", "Qarz"]),
  note: z.string().optional(),
});

export default function Sales() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | SaleStatus>("all");
  const [payType, setPayType] = useState<"all" | PayType>("all");

  const salesQ = useQuery({ queryKey: ["sales", { status, payType }], queryFn: () => listSales({ status, payType }) });
  const customersQ = useQuery({ queryKey: ["customers-balance"], queryFn: listCustomersWithBalance });

  const customerOptions: CustomerOption[] = useMemo(() => {
    const rows = (customersQ.data ?? []) as any[];
    return rows.map((r) => ({ id: r.customer_id, name: r.name, phone: r.phone, debt: Number(r.debt || 0) }));
  }, [customersQ.data]);

  const base = salesQ.data ?? [];
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return base.filter((s) => !query || s.customerName.toLowerCase().includes(query) || s.id.toLowerCase().includes(query) || (s.note?.toLowerCase().includes(query) ?? false));
  }, [base, q]);

  const exportSalesCsv = () => {
    const headers = ["ID", "Sana", "Mijoz", "To'lov turi", "Holat", "Summa", "Izoh"];
    const rows = filtered.map((s) => [s.id, s.date, s.customerName, s.payType, s.status, s.amount, s.note ?? ""]);
    const csv = buildCsv(headers, rows, { withBom: true });
    downloadCsv(`sales_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  // add sale
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [saleDate, setSaleDate] = useState<Date | undefined>(new Date());

  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: { amount: 0, payType: "Naqd", status: "To'landi", note: "" },
  });

  const createMut = useMutation({
    mutationFn: (input: { customerId: string; amount: number; payType: PayType; status: SaleStatus; date?: string; note?: string }) => createSale(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["sales"] });
      await qc.invalidateQueries({ queryKey: ["customers-balance"] });
      toast({ title: "Muvaffaqiyatli", description: "Sotuv qo‘shildi." });
      setOpen(false);
      setCustomerId("");
      setSaleDate(new Date());
      form.reset({ amount: 0, payType: "Naqd", status: "To'landi", note: "" });
    },
    onError: (e: any) => toast({ title: "Xatolik", description: e.message, variant: "destructive" }),
  });

  const delMut = useMutation({
    mutationFn: deleteSaleById,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["sales"] });
      await qc.invalidateQueries({ queryKey: ["customers-balance"] });
      toast({ title: "O‘chirildi", description: "Sotuv o‘chirildi." });
    },
    onError: (e: any) => toast({ title: "Xatolik", description: e.message, variant: "destructive" }),
  });

  if (salesQ.isLoading) return <div className="text-sm text-muted-foreground">Yuklanmoqda...</div>;
  if (salesQ.isError) return <div className="text-sm text-destructive">Xatolik: {(salesQ.error as any)?.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales</h1>
          <p className="text-sm text-muted-foreground">Sotuvlar.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ExportMenu items={[{ label: "Sales CSV (filtered)", onClick: exportSalesCsv }]} />

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Yangi sotuv</DialogTitle></DialogHeader>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Mijoz</Label>
                  <CustomerCombobox customers={customerOptions} value={customerId} onChange={setCustomerId} />
                </div>

                <form
                  className="grid gap-4"
                  onSubmit={form.handleSubmit((v) => {
                    if (!customerId) {
                      toast({ title: "Xatolik", description: "Mijoz tanlang.", variant: "destructive" });
                      return;
                    }
                    createMut.mutate({
                      customerId,
                      amount: v.amount,
                      payType: v.payType as PayType,
                      status: v.status as SaleStatus,
                      date: saleDate ? ymd(saleDate) : undefined,
                      note: v.note?.trim() || undefined,
                    });
                  })}
                >
                  <div className="grid gap-2">
                    <Label>Summa</Label>
                    <Input inputMode="numeric" {...form.register("amount")} onChange={(e) => form.setValue("amount", Number(e.target.value || 0))} />
                    {form.formState.errors.amount && <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>To‘lov turi</Label>
                      <Select value={form.watch("payType")} onValueChange={(v) => form.setValue("payType", v as any)}>
                        <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Naqd">Naqd</SelectItem>
                          <SelectItem value="Terminal">Terminal</SelectItem>
                          <SelectItem value="O'tkazma">O‘tkazma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Holat</Label>
                      <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as any)}>
                        <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="To'landi">To‘landi</SelectItem>
                          <SelectItem value="Qarz">Qarz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Sana</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {saleDate ? ymd(saleDate) : "Sanani tanlang"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={saleDate} onSelect={setSaleDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2">
                    <Label>Izoh</Label>
                    <Input {...form.register("note")} />
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" type="submit" disabled={createMut.isPending}>Saqlash</Button>
                    <Button className="flex-1" variant="outline" type="button" onClick={() => setOpen(false)}>Bekor</Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-border/70">
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Ro‘yxat</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidirish..." className="pl-9" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">Holat</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger><SelectValue placeholder="Hammasi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hammasi</SelectItem>
                  <SelectItem value="To'landi">To‘landi</SelectItem>
                  <SelectItem value="Qarz">Qarz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">To‘lov turi</Label>
              <Select value={payType} onValueChange={(v) => setPayType(v as any)}>
                <SelectTrigger><SelectValue placeholder="Hammasi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hammasi</SelectItem>
                  <SelectItem value="Naqd">Naqd</SelectItem>
                  <SelectItem value="Terminal">Terminal</SelectItem>
                  <SelectItem value="O'tkazma">O‘tkazma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sana</TableHead>
                  <TableHead>Mijoz</TableHead>
                  <TableHead>To‘lov</TableHead>
                  <TableHead className="text-right">Summa</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead className="text-right">Amal</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-muted-foreground">{s.date}</TableCell>
                    <TableCell className="font-medium">{s.customerName}</TableCell>
                    <TableCell><Badge variant="outline">{s.payType}</Badge></TableCell>
                    <TableCell className="text-right">{money(s.amount)} so'm</TableCell>
                    <TableCell><Badge variant={s.status === "Qarz" ? "secondary" : "default"}>{s.status}</Badge></TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" aria-label="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isAdmin && (
                            <ConfirmDeleteDialog
                              title="Sotuv o‘chirilsinmi?"
                              description="Bu amal qaytarilmaydi."
                              onConfirm={() => delMut.mutate(s.id)}
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
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
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
