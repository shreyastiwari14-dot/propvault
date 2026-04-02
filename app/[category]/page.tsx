import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CategoryClient from "./CategoryClient";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { category: slug } = await params;
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("name, item_count")
    .eq("slug", slug)
    .single();

  if (!cat) return { title: "Not Found" };

  return {
    title: `${cat.name} — KGN Props | ${cat.item_count} Items`,
    description: `Browse ${cat.item_count} ${cat.name.toLowerCase()} available for film and production rental at KGN Props, Mumbai.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const supabase = await createClient();

  // Fetch category
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  // Fetch items with their primary image
  const { data: items } = await supabase
    .from("items")
    .select(
      `
      id,
      item_code,
      name,
      material,
      color,
      quantity_available,
      quantity_total,
      status,
      item_images (
        image_url,
        is_primary,
        display_order
      )
    `
    )
    .eq("category_id", category.id)
    .order("item_code");

  // Process items to extract primary image
  const processedItems = (items || []).map((item: any) => {
    const images = item.item_images || [];
    const primary = images.find((img: any) => img.is_primary);
    const thumbnail = primary?.image_url || images[0]?.image_url || null;
    return {
      id: item.id,
      item_code: item.item_code,
      name: item.name,
      material: item.material,
      color: item.color,
      quantity_available: item.quantity_available,
      quantity_total: item.quantity_total,
      status: item.status,
      thumbnail,
    };
  });

  return (
    <CategoryClient
      category={{
        name: category.name,
        slug: category.slug,
        item_count: category.item_count,
      }}
      items={processedItems}
    />
  );
}
