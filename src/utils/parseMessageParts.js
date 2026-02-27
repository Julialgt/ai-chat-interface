export function parseMessageParts(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const segments = text.split('```');
  const parts = [];

  segments.forEach((segment, index) => {
    const isCode = index % 2 === 1;
    if (!segment) return;

    if (isCode) {
      // Strip optional leading language id on the first line.
      const firstNewline = segment.indexOf('\n');
      let code = segment;
      if (firstNewline !== -1) {
        const maybeLang = segment.slice(0, firstNewline).trim();
        const rest = segment.slice(firstNewline + 1);
        if (maybeLang.length > 0 && !maybeLang.includes(' ')) {
          code = rest;
        }
      }
      parts.push({ type: 'code', content: code.trimEnd() });
    } else {
      parts.push({ type: 'text', content: segment });
    }
  });

  return parts;
}

