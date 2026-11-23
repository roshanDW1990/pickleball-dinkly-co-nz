import React from 'react';
import { cn } from '../../utils/cn';

type Block =
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; lines: string[] }
  | { type: 'spacer' };

const HEADING_RE = /^#{1,3}\s+(.*)$/;
const BULLET_RE = /^\s*[-*•]\s+(.*)$/;

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  for (const rawLine of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trimEnd();
    const last = blocks[blocks.length - 1];
    const heading = line.match(HEADING_RE);
    const bullet = line.match(BULLET_RE);

    if (!line.trim()) {
      if (last && last.type !== 'spacer') blocks.push({ type: 'spacer' });
    } else if (heading) {
      blocks.push({ type: 'heading', text: heading[1] });
    } else if (bullet) {
      if (last?.type === 'list') last.items.push(bullet[1]);
      else blocks.push({ type: 'list', items: [bullet[1]] });
    } else if (last?.type === 'paragraph') {
      last.lines.push(line);
    } else {
      blocks.push({ type: 'paragraph', lines: [line] });
    }
  }
  if (blocks[blocks.length - 1]?.type === 'spacer') blocks.pop();
  return blocks;
}

function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-slate-800">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export function toPlainText(source: string): string {
  return source
    .split('\n')
    .map(line => line.replace(HEADING_RE, '$1').replace(BULLET_RE, '• $1'))
    .join('\n')
    .replace(/\*\*([^*]+)\*\*/g, '$1');
}

interface RichTextProps {
  text: string;
  className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ text, className }) => {
  const blocks = parseBlocks(text);

  return (
    <div className={cn('text-slate-600 leading-relaxed', className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <h4 key={i} className="text-lg font-semibold text-slate-800 leading-snug mt-1 mb-1 first:mt-0">
                {renderInline(block.text)}
              </h4>
            );
          case 'list':
            return (
              <ul key={i} className="list-disc pl-5 space-y-1 marker:text-green-600">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case 'paragraph':
            return (
              <p key={i}>
                {block.lines.map((line, j) => (
                  <React.Fragment key={j}>
                    {j > 0 && <br />}
                    {renderInline(line)}
                  </React.Fragment>
                ))}
              </p>
            );
          default:
            return <div key={i} className="h-3" aria-hidden="true" />;
        }
      })}
    </div>
  );
};
