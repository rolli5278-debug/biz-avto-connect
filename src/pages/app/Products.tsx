import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthProvider";
import ExportMenu from "@/components/ExportMenu";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { buildCsv, downloadCsv } from "@/lib/csv";
import { createProduct, deleteProductById, listProducts, updateProduct, type Product } from "@/services/products.service";

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

const schema = z.object({
  name: z.string().min(2, "Nomi kamida 2 ta belgi"),
  sku: z.string().min(2, "SKU kamida 2 ta belgi"),
  stock: z.coerce.number().min(0, "0 dan kichik bo‘lmasin"),
  price: z.coerce.number().min(0, "0 dan kichik bo‘lmasin"),
});

export default function Products() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [q, setQ] = useState("");

  const productsQ = useQuery({ queryKey: ["products"], queryFn: listProducts });
  const items = productsQ.data ?? [];

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((p) => !query || p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query));
  }, [items, q]);

  const exportProductsCsv = () => {
    const headers = ["ID", "Nomi", "SKU", "Qoldiq", "Narx"];
    const rows = filtered.map((p) => [p.id, p.name, p.sku, p.stock, p.price]);
    const csv = buildCsv(headers, rows, { withBom: true });
    downloadCsv(`products_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  // add/edit
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const addForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", sku: "", stock: 0, price: 0 },
  });

  const editForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", sku: "", stock: 0, price: 0 },
  });

  const createMut = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["products"] });
      setOpenAdd(false);
      addForm.reset({ name: "", sku: "", stock: 0, price: 0 });
      toast({ title: "Muvaffaqiyatli", description: "Mahsulot qo‘shildi." });
    },
    onError: (e: any) => toast({ title: "Xatolik", description: e.message, variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => updateProduct(id, patch),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["products"] });
      setOpenEdit(false);
      setEditing(null);
      toast({ title: "Saqlandi", description: "Mahsulot yangilandi." });
    },
    onError: (e: any) => toast({ title: "Xatolik", description: e.message, variant: "destructive" }),
  });

  const delMut = useMutation({
    mutationFn: deleteProductById,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "O‘chirildi", description: "Mahsulot o‘chirildi." });
    },
    onError: (e: any) => toast({ title: "Xatolik", description: e.message, variant: "destructive" }),
  });

  const openEditFor = (p: Product) => {
    setEditing(p);
    editForm.reset({ name: p.name, sku: p.sku, stock: p.stock, price: p.price });
    setOpenEdit(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Mahsulotlar (Supabase).</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ExportMenu items={[{ label: "Products CSV", onClick: exportProductsCsv }]} />

          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Yangi mahsulot</DialogTitle></DialogHeader>

              <form
                className="grid gap-4"
                onSubmit={addForm.handleSubmit((v) => createMut.mutate(v))}
              >
                <div className="grid gap-2">
                  <Label>Nomi</Label>
                  <Input {...addForm.register("name")} />
                  {addForm.formState.errors.name && <p className="text-xs text-destructive">{addForm.formState.errors.name.message}</p>}
                </div>

                <div className="grid gap-2">
                  <Label>SKU</Label>
                  <Input {...addForm.register("sku")} />
                  {addForm.formState.errors.sku && <p className="text-xs text-destructive">{addForm.formState.errors.sku.message}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Qoldiq</Label>
                    <Input inputMode="numeric" {...addForm.register("stock")} onChange={(e) => addForm.setValue("stock", Number(e.target.value || 0))} />
                    {addForm.formState.errors.stock && <p className="text-xs text-destructive">{addForm.formState.errors.stock.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label>Narx</Label>
                    <Input inputMode="numeric" {...addForm.register("price")} onChange={(e) => addForm.setValue("price", Number(e.target.value || 0))} />
                    {addForm.formState.errors.price && <p className="text-xs text-destructive">{addForm.formState.errors.price.message}</p>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" type="submit" disabled={createMut.isPending}>Saqlash</Button>
                  <Button className="flex-1" variant="outline" type="button" onClick={() => setOpenAdd(false)}>Bekor</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Mahsulotni tahrirlash</DialogTitle></DialogHeader>

              <form
                className="grid gap-4"
                onSubmit={editForm.handleSubmit((v) => {
                  if (!editing) return;
                  updateMut.mutate({ id: editing.id, patch: v });
                })}
              >
                <div className="grid gap-2">
                  <Label>Nomi</Label>
                  <Input {...editForm.register("name")} />
                </div>
                <div className="grid gap-2">
                  <Label>SKU</Label>
                  <Input {...editForm.register("sku")} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Qoldiq</Label>
                    <Input inputMode="numeric" {...editForm.register("stock")} onChange={(e) => editForm.setValue("stock", Number(e.target.value || 0))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Narx</Label>
                    <Input inputMode="numeric" {...editForm.register("price")} onChange={(e) => editForm.setValue("price", Number(e.target.value || 0))} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" type="submit" disabled={updateMut.isPending}>Saqlash</Button>
                  <Button className="flex-1" variant="outline" type="button" onClick={() => setOpenEdit(false)}>Bekor</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
                  <TableHead>Nomi</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Qoldiq</TableHead>
                  <TableHead className="text-right">Narx</TableHead>
                  <TableHead className="text-right">Amal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                    <TableCell>
                      <Badge variant={p.stock < 15 ? "secondary" : "outline"}>{p.stock} dona</Badge>
                    </TableCell>
                    <TableCell className="text-right">{money(p.price)} so'm</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" aria-label="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditFor(p)}>
                            <Pencil className="mr-2 h-4 w-4" /> Tahrirlash
                          </DropdownMenuItem>

                          {isAdmin && (
                            <ConfirmDeleteDialog
                              title="Mahsulot o‘chirilsinmi?"
                              description="Bu amal qaytarilmaydi."
                              onConfirm={() => delMut.mutate(p.id)}
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
