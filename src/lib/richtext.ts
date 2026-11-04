import sanitizeHtml from "sanitize-html";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Ne garde que les balises prévues par l’éditeur. À appliquer À L’ENREGISTREMENT et à l’affichage. */
export function cleanHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ["h2", "h3", "p", "br", "strong", "em", "u", "ul", "ol", "li", "blockquote", "a", "hr"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedClasses: { p: ["lead"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      b: "strong",
      i: "em",
      div: "p",
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

/** Affiche indifféremment un ancien texte brut (paragraphes séparés par une ligne vide) ou du HTML. */
export function bodyToHtml(body: string): string {
  if (/^\s*</.test(body)) return cleanHtml(body);
  return body
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}
