import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCustomBracket } from "@/app/actions/custom-brackets";
import { BracketGame } from "@/components/bracket/BracketGame";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bracket = await getCustomBracket(id);
  if (!bracket) {
    return { title: "Custom Bracket Not Found" };
  }
  return {
    title: `${bracket.title} - Custom Bracket`,
    description: `Play this custom bracket: ${bracket.title}. ${bracket.items.length} items to rank!`,
  };
}

export default async function CustomBracketPage({ params }: Props) {
  const { id } = await params;
  const bracket = await getCustomBracket(id);

  if (!bracket) {
    notFound();
  }

  const defaultSize =
    bracket.items.length >= 64
      ? 64
      : bracket.items.length >= 32
        ? 32
        : bracket.items.length >= 16
          ? 16
          : 8;

  return (
    <div className="flex flex-1 flex-col">
      <BracketGame
        bracketName={bracket.title}
        bracketDescription={`Custom bracket with ${bracket.items.length} items`}
        items={bracket.items}
        defaultSize={defaultSize}
        categoryColor="#8b5cf6"
        categorySlug="custom"
        bracketSlug={id}
      />
    </div>
  );
}
