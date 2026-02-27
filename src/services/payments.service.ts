import { supabase } from "@/lib/supabaseClient";

export async function listPaymentsByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("id,date,amount,note")
    .eq("customer_id", customerId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPayment(input: { customerId: string; amount: number; date?: string; note?: string }) {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("payments")
    .insert({
      customer_id: input.customerId,
      amount: input.amount,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      note: input.note ?? null,
      created_by: user.user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deletePaymentById(id: string) {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw error;
}
