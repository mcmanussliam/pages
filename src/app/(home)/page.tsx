import type { Metadata } from "next";

const lines = [
  { id: "whoami", text: "% whoami" },
  { id: "name", text: "liam mcmanus" },
  { id: "gap-1", text: "" },
  { id: "ls", text: "% ls" },
  { id: "docs", text: "docs" },
  { id: "about-file", text: "about.txt" },
  { id: "gap-2", text: "" },
  { id: "cat-about", text: "% cat about.txt" },
  { id: "about-1", text: "i made some small projects," },
  { id: "about-2", text: "i wrote docs for them," },
  { id: "about-3", text: "and put them here." },
  { id: "gap-3", text: "" },
  { id: "idle", text: "% █" },
] as const;

export const metadata: Metadata = {
  description: "Small software projects, docs, and experiments.",
  openGraph: {
    images: "/og/home",
  },
};

export default function HomePage() {
  return (
    <main className="flex flex-1 bg-fd-background py-12 text-fd-foreground md:py-16">
      <div className="mx-auto flex w-full max-w-(--fd-layout-width) items-start px-4">
        <div className="font-mono text-sm leading-7 md:text-[15px]">
          {lines.map((line) => {
            if (line.text === "") {
              return <div key={line.id} className="h-7" />;
            }

            return (
              <div
                key={line.id}
                className={
                  line.text.startsWith("%") ? "" : "text-fd-muted-foreground"
                }
              >
                {line.text}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
