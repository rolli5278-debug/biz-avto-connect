import { supabase } from "@/lib/supabaseClient";

export type Product = { id: string; name: string; sku: string; stock: number; price: number };

export async function listProducts() {
  const { data, error } = await supabase.from("products").select("id,name,sku,stock,price").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function createProduct(input: { name: string; sku: string; stock: number; price: number }) {
  const { data, error } = await supabase
    .from("products")
    .insert({ name: input.name, sku: input.sku, stock: input.stock, price: input.price })
    .select("id,name,sku,stock,price")
    .single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, patch: Partial<{ name: string; sku: string; stock: number; price: number }>) {
  const { data, error } = await supabase
    .from("products")
    .update({ ...patch })
    .eq("id", id)
    .select("id,name,sku,stock,price")
    .single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProductById(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
