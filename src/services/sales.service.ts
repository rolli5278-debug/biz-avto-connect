import { supabase } from "@/lib/supabaseClient";

export type PayType = "Naqd" | "Terminal" | "O'tkazma";
export type SaleStatus = "To'landi" | "Qarz";

export async function listSales(params?: { status?: string; payType?: string }) {
  let q = supabase
    .from("sales")
    .select("id,date,amount,pay_type,status,note,customer_id, customers(name)")
    .order("date", { ascending: false });

  if (params?.status && params.status !== "all") q = q.eq("status", params.status);
  if (params?.payType && params.payType !== "all") q = q.eq("pay_type", params.payType);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((s: any) => ({
    id: s.id,
    date: s.date,
    amount: s.amount,
    payType: s.pay_type as PayType,
    status: s.status as SaleStatus,
    note: s.note as string | null,
    customerId: s.customer_id as string,
    customerName: s.customers?.name ?? "",
  }));
}

export async function createSale(input: {
  customerId: string;
  amount: number;
  payType: PayType;
  status: SaleStatus;
  date?: string;
  note?: string;
}) {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("sales")
    .insert({
      customer_id: input.customerId,
      amount: input.amount,
      pay_type: input.payType,
      status: input.status,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      note: input.note ?? null,
      created_by: user.user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSaleById(id: string) {
  const { error } = await supabase.from("sales").delete().eq("id", id);
  if (error) throw error;
}
