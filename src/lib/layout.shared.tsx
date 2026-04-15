import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Link, Shell } from "lucide-react";
import { gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Shell className="size-5" />,
    },
    links: [{ text: "Documentation", url: "/docs", on: "nav" }],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
