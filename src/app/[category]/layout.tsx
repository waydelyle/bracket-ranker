import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getCategoryBySlug } from "@/data/categories";

interface CategoryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}

export default async function CategoryLayout({
  children,
  params,
}: CategoryLayoutProps) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);

  const breadcrumbItems = [{ label: "Home", href: "/" }];
  if (cat) {
    breadcrumbItems.push({ label: cat.name, href: `/${cat.slug}` });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 pt-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      {children}
    </div>
  );
}
