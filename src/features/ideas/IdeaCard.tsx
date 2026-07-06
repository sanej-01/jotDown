import { useState } from 'react';
import { EditableText } from '@/components/EditableText';
import { CloseIcon } from '@/components/icons';
import { formatTimestamp } from '@/lib/date';
import { LIMITS } from '@/types/database';
import type { Item } from '@/types/database';

interface IdeaCardProps {
  idea: Item;
  onEditTitle: (id: string, title: string) => void;
  onEditNote: (id: string, note: string) => void;
  onDelete: (idea: Item) => void;
}

/**
 * An idea card (FR-I1/FR-I2). Collapsed shows the title + timestamp; tapping
 * expands to reveal/edit the note. Title is inline-editable; the note edits in
 * a textarea that saves on blur.
 */
export function IdeaCard({ idea, onEditTitle, onEditNote, onDelete }: IdeaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(idea.note);

  function saveNote() {
    if (note !== idea.note) onEditNote(idea.id, note);
  }

  return (
    <li className="rounded-card border border-border bg-surface px-4 py-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-content">
            <EditableText
              value={idea.title}
              onSave={(title) => onEditTitle(idea.id, title)}
            />
          </div>

          {expanded && (
            <textarea
              value={note}
              maxLength={LIMITS.noteMax}
              onChange={(e) => setNote(e.target.value)}
              onBlur={saveNote}
              placeholder="Add a note…"
              rows={3}
              className="mt-2 w-full resize-y rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-content placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
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
