interface MarkdownHtmlProps {
  html: string;
}

export function MarkdownHtml({html}: MarkdownHtmlProps) {
  return <div dangerouslySetInnerHTML={{__html: html}} />;
}

