import { visit } from 'unist-util-visit';

const PHONE_DISPLAY = '123-456-7890';
const PHONE_TEL = '+11234567890';

export default function remarkFaqAccordion() {
  return (tree) => {
    // 1. Replace [PHONE] text nodes with actual number (linked)
    visit(tree, 'text', (node) => {
      if (node.value && node.value.includes('[PHONE]')) {
        node.value = node.value.replace(/\[PHONE\]/g, PHONE_DISPLAY);
      }
    });

    // 2. Remove paragraphs that contain editorial notes (← ...) or are just CTA placeholders
    //    These are lines like: **[ Call 123-456-7890... ]**  ← CTA block above the fold
    visit(tree, 'paragraph', (node, index, parent) => {
      const text = node.children
        .map((c) => (c.type === 'text' ? c.value : c.type === 'strong' ? c.children?.map(x => x.value || '').join('') : ''))
        .join('');
      if (text.includes('←') || /^\s*\[.+\]\s*$/.test(text.trim())) {
        parent.children.splice(index, 1);
        return index;
      }
    });

    // 3. Transform FAQ sections into <details>/<summary> accordions
    const nodes = tree.children;
    let i = 0;
    while (i < nodes.length) {
      const node = nodes[i];
      // Find ## Frequently Asked Questions heading
      if (node.type === 'heading' && node.depth === 2) {
        const headingText = node.children.map(c => c.value || '').join('').trim();
        if (/^Frequently Asked Questions/i.test(headingText)) {
          const faqNodes = [];
          let j = i + 1;
          while (j < nodes.length) {
            const n = nodes[j];
            if (n.type === 'heading' && n.depth <= 2) break;
            faqNodes.push(n);
            j++;
          }

          const accordions = [];
          let k = 0;
          while (k < faqNodes.length) {
            const qNode = faqNodes[k];
            // Question: a paragraph whose first child is a strong element
            if (
              qNode.type === 'paragraph' &&
              qNode.children.length >= 1 &&
              qNode.children[0].type === 'strong'
            ) {
              const qText = qNode.children[0].children.map(c => c.value || '').join('').trim();
              const answerParts = [];
              let m = k + 1;
              while (m < faqNodes.length) {
                const an = faqNodes[m];
                if (
                  an.type === 'paragraph' &&
                  an.children.length >= 1 &&
                  an.children[0].type === 'strong'
                ) break;
                if (an.type === 'heading') break;
                answerParts.push(an);
                m++;
              }
              const aHtml = answerParts
                .map((n) => {
                  if (n.type === 'paragraph') {
                    const txt = n.children.map(c => c.value || (c.type === 'strong' ? `<strong>${c.children.map(x => x.value||'').join('')}</strong>` : '')).join('');
                    return `<p>${txt}</p>`;
                  }
                  return '';
                })
                .join('');
              accordions.push({
                type: 'html',
                value: `<details class="faq"><summary>${qText}</summary>${aHtml}</details>`,
              });
              k = m;
            } else {
              k++;
            }
          }

          // Replace the heading + faq nodes with the section heading + accordions
          const replacement = [
            { type: 'html', value: '<div class="faq-section">' },
            node,
            ...accordions,
            { type: 'html', value: '</div>' },
          ];
          nodes.splice(i, j - i, ...replacement);
          i += replacement.length;
          continue;
        }
      }
      i++;
    }
  };
}
