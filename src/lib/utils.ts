/** Returns true if the entry should be published on the current build date. */
export function isPublished(data: { draft?: boolean; pubDate?: Date }): boolean {
  if (!data.draft) return true;
  if (!data.pubDate) return false;
  return data.pubDate <= new Date();
}

/** Extracts FAQ Q&A pairs from raw markdown body under "## Frequently Asked Questions". */
export function extractFAQ(body: string): Array<{ q: string; a: string }> {
  const faqStart = body.search(/^## Frequently Asked Questions/im);
  if (faqStart === -1) return [];

  const section = body.slice(faqStart);
  // Find the end: next ## heading or end of string
  const nextHeading = section.slice(1).search(/^## /m);
  const faqSection = nextHeading === -1 ? section : section.slice(0, nextHeading + 1);

  const faqs: Array<{ q: string; a: string }> = [];
  // Match bold Q: **text?** followed by one or more answer paragraphs
  const qPattern = /\*\*([^*]+?)\*\*\n+([\s\S]+?)(?=\n\n\*\*|\n\n##|$)/g;
  let m: RegExpExecArray | null;

  while ((m = qPattern.exec(faqSection)) !== null) {
    const q = m[1].trim();
    const a = m[2].trim().replace(/\n+/g, ' ');
    if (q && a) faqs.push({ q, a });
  }

  return faqs;
}

/** Replaces [PHONE] placeholder in text with the real phone number. */
export function replacePhone(text: string, phone: string): string {
  return text.replace(/\[PHONE\]/g, phone);
}

/** Strips the "← comment text" editorial notes from content. */
export function stripEditorialNotes(text: string): string {
  return text.replace(/←[^\n]*/g, '').trim();
}
