/**
 * Remark plugin: converts FAQ sections in markdown to <details>/<summary> accordions.
 *
 * Matches a "## Frequently Asked Questions" heading, then converts each
 * "**Question?**" paragraph + following answer paragraph(s) to a <details class="faq"> element.
 */

export default function remarkFaqAccordion() {
  return (tree) => {
    const nodes = tree.children;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (
        node.type === 'heading' &&
        node.depth === 2 &&
        getHeadingText(node).toLowerCase().includes('frequently asked')
      ) {
        const newNodes = [node];
        let j = i + 1;

        while (j < nodes.length) {
          const curr = nodes[j];

          if (curr.type === 'heading') break;

          // Question: paragraph whose only child is a strong node
          if (
            curr.type === 'paragraph' &&
            curr.children.length === 1 &&
            curr.children[0].type === 'strong'
          ) {
            const questionText = serializeInline(curr.children[0].children);
            const answerParts = [];
            j++;

            while (j < nodes.length) {
              const next = nodes[j];
              if (next.type === 'heading') break;
              if (
                next.type === 'paragraph' &&
                next.children.length === 1 &&
                next.children[0].type === 'strong'
              ) break;
              if (next.type === 'paragraph') {
                answerParts.push(`<p>${serializeInline(next.children)}</p>`);
              }
              j++;
            }

            newNodes.push({
              type: 'html',
              value: `<details class="faq">\n<summary>${questionText}</summary>\n${answerParts.join('\n')}\n</details>`,
            });
          } else {
            newNodes.push(curr);
            j++;
          }
        }

        nodes.splice(i, j - i, ...newNodes);
        break;
      }
    }
  };
}

function getHeadingText(node) {
  return node.children.map((c) => (c.type === 'text' ? c.value : '')).join('');
}

function serializeInline(children) {
  return (children || []).map((child) => {
    if (child.type === 'text') return escHtml(child.value);
    if (child.type === 'strong') return `<strong>${serializeInline(child.children)}</strong>`;
    if (child.type === 'emphasis') return `<em>${serializeInline(child.children)}</em>`;
    if (child.type === 'inlineCode') return `<code>${escHtml(child.value)}</code>`;
    if (child.type === 'link')
      return `<a href="${child.url}">${serializeInline(child.children)}</a>`;
    if (child.type === 'html') return child.value;
    return '';
  }).join('');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
