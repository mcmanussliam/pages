import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        {
          type: "menu",
          text: "Documentation",
          on: "menu",
          items: [
            { text: "Be Right Back", url: "/docs" },
            { text: "Obsidian Actions", url: "/docs/obsidian-actions" },
          ],
        },
        {
          type: "main",
          text: "Be Right Back",
          on: "nav",
          url: "/docs",
        },
        {
          type: "main",
          text: "Obsidian Actions",
          on: "nav",
          url: "/docs/obsidian-actions",
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
