import React, { useRef } from 'react';
import { Bold, Heading, List, Eye } from 'lucide-react';
import { RichText } from './RichText';

interface RichTextEditorProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
  placeholder?: string;
}

const HEADING_PREFIX = '## ';
const BULLET_PREFIX = '- ';

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  name,
  value,
  onChange,
  required,
  rows = 10,
  placeholder,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyChange = (next: string, selStart: number, selEnd: number) => {
    onChange(next);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  };

  const toggleBold = () => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end);

    if (value.slice(start - 2, start) === '**' && value.slice(end, end + 2) === '**') {
      applyChange(value.slice(0, start - 2) + selected + value.slice(end + 2), start - 2, end - 2);
      return;
    }
    if (selected.length > 4 && selected.startsWith('**') && selected.endsWith('**')) {
      const inner = selected.slice(2, -2);
      applyChange(value.slice(0, start) + inner + value.slice(end), start, start + inner.length);
      return;
    }

    const inner = selected || 'bold text';
    applyChange(value.slice(0, start) + `**${inner}**` + value.slice(end), start + 2, start + 2 + inner.length);
  };

  const toggleLinePrefix = (prefix: string, otherPrefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const nextBreak = value.indexOf('\n', end);
    const lineEnd = nextBreak === -1 ? value.length : nextBreak;

    const lines = value.slice(lineStart, lineEnd).split('\n');
    const allHavePrefix = lines.filter(l => l.trim()).every(l => l.startsWith(prefix));
    const updated = lines
      .map(line => {
        if (!line.trim()) return line;
        if (allHavePrefix) return line.slice(prefix.length);
        const base = line.startsWith(otherPrefix) ? line.slice(otherPrefix.length) : line;
        return prefix + base;
      })
      .join('\n');

    applyChange(value.slice(0, lineStart) + updated + value.slice(lineEnd), lineStart, lineStart + updated.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleBold();
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      const el = e.currentTarget;
      const { selectionStart: start, selectionEnd: end } = el;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const line = value.slice(lineStart, start);
      if (!line.startsWith(BULLET_PREFIX)) return;

      e.preventDefault();
      if (line.trim() === BULLET_PREFIX.trim()) {
        applyChange(value.slice(0, lineStart) + value.slice(end), lineStart, lineStart);
        return;
      }
      const insert = '\n' + BULLET_PREFIX;
      const pos = start + insert.length;
      applyChange(value.slice(0, start) + insert + value.slice(end), pos, pos);
    }
  };

  const tools = [
    { label: 'Bold', hint: 'Bold (Ctrl+B)', icon: Bold, onClick: toggleBold },
    { label: 'Heading', hint: 'Heading', icon: Heading, onClick: () => toggleLinePrefix(HEADING_PREFIX, BULLET_PREFIX) },
    { label: 'Bullets', hint: 'Bullet list', icon: List, onClick: () => toggleLinePrefix(BULLET_PREFIX, HEADING_PREFIX) },
  ];

  return (
    <div className="space-y-3">
      <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-shadow">
        <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
          {tools.map(({ label, hint, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              title={hint}
              aria-label={hint}
              onMouseDown={e => e.preventDefault()}
              onClick={onClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-white hover:text-green-700 hover:shadow-sm active:scale-95 transition-all"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          name={name}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          required={required}
          rows={rows}
          placeholder={placeholder}
          className="block w-full px-4 py-3 text-slate-800 font-mono text-sm leading-relaxed resize-y focus:outline-none"
        />
      </div>
      <p className="text-xs text-slate-400">
        Select words and press Bold (or Ctrl+B). Use Heading or Bullets on any line. Press Enter on a bullet to start the next one.
      </p>

      {value.trim() && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">
            <Eye className="h-3.5 w-3.5" />
            Preview - how players will see it
          </p>
          <RichText text={value} />
        </div>
      )}
    </div>
  );
};
