import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { Checkbox } from './ui/Checkbox';
import { EditableText } from './EditableText';
import { CloseIcon } from './icons';
import type { Item } from '@/types/database';

interface ItemRowProps {
  item: Item;
  onToggle: (item: Item) => void;
  onEditTitle: (id: string, title: string) => void;
  onDelete: (item: Item) => void;
  /** Optional trailing control (e.g. a due-date badge for todos). */
  trailing?: ReactNode;
  /** Optional leading drag handle (wired by ReorderableList). */
  dragHandle?: ReactNode;
  style?: CSSProperties;
}

/**
 * A single checkable row shared by Todos and List entries: an optional drag
 * handle, a circular checkbox, an inline-editable title, an optional trailing
 * slot, and a delete "×". Completed rows are dimmed and struck through (FR-T2).
 *
 * Design rationale:
 * - Forwards its ref/style to support dnd-kit positioning transforms (scale,
 *   translate, opacity during drag).
 * - dragHandle and trailing are optional slots so ReorderableList can inject
 *   a grip icon while non-draggable sections (completed items) use ItemRow
 *   without a handle.
 * - The ref must be a real DOM node, not just a component ref, since dnd-kit
 *   uses it to measure bounding boxes and apply CSS transforms.
 */
export const ItemRow = forwardRef<HTMLLIElement, ItemRowProps>(function ItemRow(
  { item, onToggle, onEditTitle, onDelete, trailing, dragHandle, style },
  ref,
) {
  return (
    <li
      ref={ref}
      style={style}
      className={[
        'flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2',
        item.done ? 'opacity-60' : '',
      ].join(' ')}
    >
      {dragHandle}

      <Checkbox checked={item.done} onChange={() => onToggle(item)} label={item.title} />

      <div className="min-w-0 flex-1">
        <EditableText
          value={item.title}
          done={item.done}
          onSave={(title) => onEditTitle(item.id, title)}
        />
      </div>

      {trailing}

      <button
        type="button"
        onClick={() => onDelete(item)}
        aria-label={`Delete ${item.title}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-content-muted hover:bg-surface-muted hover:text-content focus-visible:outline-none"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </li>
  );
});
