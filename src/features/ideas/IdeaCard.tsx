import { useState } from 'react';
import { EditableText } from '@/components/EditableText';
import { CloseIcon } from '@/components/icons';
import { formatTimestamp } from '@/lib/date';
import { LIMITS } from '@/types/database';
import type { IdeaColor, Item } from '@/types/database';

interface IdeaCardProps {
  idea: Item;
  onEditTitle: (id: string, title: string) => void;
  onEditNote: (id: string, note: string) => void;
  onEditColor: (id: string, color: IdeaColor) => void;
  onDelete: (idea: Item) => void;
}

/** Visual config for each color option. */
const COLOR_OPTIONS: { value: IdeaColor; bg: string; ring: string; dot: string; label: string }[] = [
  { value: 'red',    bg: 'bg-red-400',    ring: 'ring-red-400',    dot: 'bg-red-400',    label: 'Red' },
  { value: 'yellow', bg: 'bg-yellow-400', ring: 'ring-yellow-400', dot: 'bg-yellow-400', label: 'Yellow' },
  { value: 'blue',   bg: 'bg-blue-400',   ring: 'ring-blue-400',   dot: 'bg-blue-400',   label: 'Blue' },
];

/** Left-border accent color per value (card collapsed state). */
const BORDER_COLOR: Record<IdeaColor, string> = {
  red:    'border-l-red-400',
  yellow: 'border-l-yellow-400',
  blue:   'border-l-blue-400',
};

/**
 * An idea card (FR-I1/FR-I2). Collapsed shows the title + timestamp with a
 * colored left-border accent. Expanded reveals/edits the note and shows a
 * 3-circle color picker (red / yellow / blue) at the bottom-right of the
 * edit box (default yellow).
 */
export function IdeaCard({ idea, onEditTitle, onEditNote, onEditColor, onDelete }: IdeaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(idea.note);

  const color: IdeaColor = idea.color ?? 'yellow';

  function saveNote() {
    if (note !== idea.note) onEditNote(idea.id, note);
  }

  return (
    <li
      className={[
        'rounded-card border border-border border-l-4 bg-surface px-4 py-3',
        BORDER_COLOR[color],
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <EditableText
            value={idea.title}
            onSave={(title) => onEditTitle(idea.id, title)}
            multiline
            displayLines={2}
            editRows={5}
          />

          {expanded && (
            <div className="mt-2">
              <textarea
                value={note}
                maxLength={LIMITS.noteMax}
                onChange={(e) => setNote(e.target.value)}
                onBlur={saveNote}
                placeholder="Add a note…"
                rows={3}
                className="w-full resize-y rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-content placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />

              {/* Color picker — 3 circles at bottom-right of the edit area.
                  Clicking one immediately persists the color (optimistic update). */}
              <div className="mt-2 flex justify-end gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onEditColor(idea.id, opt.value)}
                    aria-label={`Set color ${opt.label}`}
                    aria-pressed={color === opt.value}
                    className={[
                      'h-6 w-6 rounded-full transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      opt.bg,
                      opt.ring,
                      // Selected: slight scale-up + ring to indicate active state
                      color === opt.value
                        ? 'ring-2 ring-offset-2 scale-110'
                        : 'opacity-60 hover:opacity-100 hover:scale-105',
                    ].join(' ')}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-left text-xs uppercase tracking-wide text-content-muted hover:text-content focus-visible:outline-none"
          >
            {formatTimestamp(idea.created_at)}
            {(idea.note || expanded) && ` · ${expanded ? 'Tap to collapse' : 'Tap to expand'}`}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDelete(idea)}
          aria-label={`Delete ${idea.title}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-content-muted hover:bg-surface-muted hover:text-content focus-visible:outline-none"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
