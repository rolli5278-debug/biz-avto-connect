import { supabase } from "@/lib/supabaseClient";

export async function listCustomersWithBalance() {
  const { data, error } = await supabase.from("customer_balance").select("*").order("debt", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createCustomer(input: { name: string; phone?: string }) {
  const { data, error } = await supabase
    .from("customers")
    .insert({ name: input.name, phone: input.phone ?? null })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomerById(customerId: string) {
  const { error } = await supabase.from("customers").delete().eq("id", customerId);
  if (error) throw error;
}
