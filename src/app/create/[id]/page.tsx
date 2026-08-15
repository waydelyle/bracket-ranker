import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCustomBracket } from "@/app/actions/custom-brackets";
import { MAX_FIELD_SIZE } from "@/lib/bracket-engine";
import { BracketGame } from "@/components/bracket/BracketGame";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bracket = await getCustomBracket(id);
  if (!bracket) {
    return {
      title: "Custom Bracket Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  return {
    title: `${bracket.title} - Custom Bracket`,
    description: `Play this custom bracket: ${bracket.title}. ${bracket.items.length} items to rank!`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function CustomBracketPage({ params }: Props) {
  const { id } = await params;
  const bracket = await getCustomBracket(id);

  if (!bracket) {
    notFound();
  }

  // Everything the builder was given is in the field. Rounding down to a power
  // of two threw away up to half of a custom bracket's entrants — the ones
  // someone had just typed in by hand — before the first matchup.
  const defaultSize = Math.min(bracket.items.length, MAX_FIELD_SIZE);

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
