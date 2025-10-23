import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { List } from "lucide-react";

type Heading = {
  id: string;
  text: string;
  level: number;
};

export const TableOfContents = ({ content }: { content: string }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const extractedHeadings: Heading[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      extractedHeadings.push({ id, text, level });
    }

    setHeadings(extractedHeadings);

    // Track active heading on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    // Wait for headings to be rendered
    setTimeout(() => {
      extractedHeadings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      });
    }, 100);

    return () => observer.disconnect();
  }, [content]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    // Use requestAnimationFrame to avoid forced reflow
    requestAnimationFrame(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  return (
    <Card className="p-6 sticky top-24" style={{ contain: "layout" }}>
      <div className="flex items-center gap-2 mb-4">
        <List className="h-5 w-5 text-travliaq-turquoise" />
        <h3 className="font-semibold text-travliaq-deep-blue">
          Table des matières
        </h3>
      </div>
      <nav className="space-y-2" style={{ contain: "layout style" }}>
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollToHeading(heading.id)}
            className={`block text-left text-sm transition-colors hover:text-travliaq-turquoise ${
              activeId === heading.id
                ? "text-travliaq-turquoise font-medium"
                : "text-muted-foreground"
            }`}
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </Card>
  );
};
