import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ItemClient from "./ItemClient";

interface Props {
  params: Promise<{ category: string; itemCode: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { category: slug, itemCode } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .single();

  const { data: item } = await supabase
    .from("items")
    .select("name, item_code")
    .eq("item_code", itemCode)
    .single();

  if (!item || !category) return { title: "Not Found" };

  return {
    title: `${item.name} (${item.item_code}) — KGN Props`,
    description: `View and book ${item.name} from ${category.name} collection at KGN Props, Mumbai.`,
  };
}

export default async function ItemPage({ params }: Props) {
  const { category: slug, itemCode } = await params;
  const supabase = await createClient();

  // Fetch category
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  // Fetch item
  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("item_code", itemCode)
    .eq("category_id", category.id)
    .single();

  if (!item) notFound();

  // Fetch all images for this item
  const { data: images } = await supabase
    .from("item_images")
    .select("id, image_url, is_primary, display_order")
    .eq("item_id", item.id)
    .order("display_order");

  return (
    <ItemClient
      item={{
        id: item.id,
        item_code: item.item_code,
        name: item.name,
        description: item.description,
        material: item.material,
        color: item.color,
        style: item.style,
        height: item.height,
        length: item.length,
        width: item.width,
        depth: item.depth,
        configuration: item.configuration,
        quantity_available: item.quantity_available,
        quantity_total: item.quantity_total,
        status: item.status,
      }}
      images={(images || []).map((img) => ({
        id: img.id,
        url: img.image_url,
        isPrimary: img.is_primary,
      }))}
      category={{
        name: category.name,
        slug: category.slug,
      }}
    />
  );
}
