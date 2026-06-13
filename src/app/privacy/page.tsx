import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "BracketRanker privacy policy for custom brackets, result pages, analytics, and basic usage data.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <section className="px-4 py-16">
      <article className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated June 13, 2026
          </p>
        </div>

        <div className="space-y-6 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-lg font-bold text-white">
              Information you provide
            </h2>
            <p>
              If you create a custom bracket, BracketRanker stores the bracket
              title and items needed to make the shareable page work. Do not add
              private or sensitive information to a public bracket.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">
              Results and voting data
            </h2>
            <p>
              Bracket results and aggregate vote counts may be stored so result
              pages, sharing, and community rankings can work. These records are
              tied to the bracket result, not to a user account.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">Analytics</h2>
            <p>
              The site may use privacy-conscious analytics to understand page
              performance, popular brackets, and basic usage patterns.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">Contact</h2>
            <p>
              For privacy questions, use the contact page and include enough
              context to identify the bracket or result page you are asking
              about.
            </p>
          </section>
        </div>
      </article>
    </section>
  );
}
