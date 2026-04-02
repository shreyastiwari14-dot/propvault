import { createClient } from "@/lib/supabase/server";
import HomeClient from "./HomeClient";

export const metadata = {
  title: "KGN Furniture & Props — Film & Production",
  description:
    "Browse and book premium furniture and props for film, OTT and commercial productions in Mumbai.",
};

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, item_count")
    .order("display_order");

  // Get thumbnail for each category (first primary image)
  const categoryData = await Promise.all(
    (categories || []).map(async (cat) => {
      const { data: items } = await supabase
        .from("items")
        .select("id, item_images(image_url, is_primary)")
        .eq("category_id", cat.id)
        .limit(1);

      let thumbnail: string | null = null;
      if (items && items[0]) {
        const images = (items[0] as any).item_images;
        if (Array.isArray(images) && images.length > 0) {
          const primary = images.find((img: any) => img.is_primary);
          thumbnail = primary?.image_url || images[0]?.image_url || null;
        }
      }

      return { ...cat, thumbnail };
    })
  );

  const totalItems = (categories || []).reduce(
    (sum, cat) => sum + (cat.item_count || 0),
    0
  );

  return <HomeClient categoryData={categoryData} totalItems={totalItems} />;
}
