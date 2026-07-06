import type { ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ItemRow } from './ItemRow';
import { GripIcon } from './icons';
import type { Item } from '@/types/database';

interface ReorderableListProps {
  items: Item[];
  onToggle: (item: Item) => void;
  onEditTitle: (id: string, title: string) => void;
  onDelete: (item: Item) => void;
  /** Persist a move: place `item` between `before` and `after` (midpoint). */
  onReorder: (item: Item, before?: Item, after?: Item) => void;
  /** Optional per-item trailing control (e.g. a due-date badge). */
  renderTrailing?: (item: Item) => ReactNode;
}

/**
 * One draggable row, wired to dnd-kit's sortable transforms + drag handle.
 *
 * dnd-kit integration:
 * - useSortable({ id: item.id }) hooks this row into the drag context. It
 *   returns:
 *   - attributes / listeners: attach to a drag handle button to enable dragging
 *   - setNodeRef: attach to the DOM node dnd-kit measures and transforms
 *   - transform: CSS transform (translate/scale) computed by dnd-kit during drag
 *   - isDragging: true while this item is being dragged
 * - CSS.Transform.toString() converts the transform object to a valid CSS string
 * - opacity and zIndex darken/elevate the item during drag so it's visually
 *   distinct from stationary neighbours
 */
function SortableRow({
  item,
  onToggle,
  onEditTitle,
  onDelete,
  trailing,
}: {
  item: Item;
  onToggle: (item: Item) => void;
  onEditTitle: (id: string, title: string) => void;
  onDelete: (item: Item) => void;
  trailing?: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  // The drag handle button: receives dnd-kit's attributes (role, aria) and
  // listeners (onPointerDown, onKeyDown) automatically. The touch-none class
  // prevents the browser's default scroll-drag on touch devices, letting
  // the pointer sensor handle the drag.
  const handle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      aria-label={`Reorder ${item.title}`}
      className="flex h-9 w-6 shrink-0 cursor-grab touch-none items-center justify-center text-content-muted hover:text-content focus-visible:outline-none active:cursor-grabbing"
    >
      <GripIcon className="h-4 w-4" />
    </button>
  );

  return (
    <ItemRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: 'relative',
      }}
      item={item}
      onToggle={onToggle}
      onEditTitle={onEditTitle}
      onDelete={onDelete}
      dragHandle={handle}
      trailing={trailing}
    />
  );
}

/**
 * A vertically sortable list of items (FR-T6 / TODO-07). Drag via the grip
 * handle (mouse or touch) or reorder with the keyboard. On drop, the new
 * neighbours are handed to `onReorder`, which persists a fractional midpoint
 * sort_order so no other rows are rewritten.
 *
 * Design rationale:
 * - Uses dnd-kit for accessibility (keyboard + pointer + touch support OOB).
 * - Only reorderable items in the `items` prop (completed items stay static).
 * - On drop, passes the moved item and its new neighbours to onReorder, which
 *   calculates the midpoint fractional sort_order (e.g., if before=10, after=20,
 *   the new sort_order is 15). This avoids rewriting other rows' sort_order.
 */
export function ReorderableList({
  items,
  onToggle,
  onEditTitle,
  onDelete,
  onReorder,
  renderTrailing,
}: ReorderableListProps) {
  // Configure sensors for drag detection: pointer (mouse/touch) + keyboard.
  // activationConstraint.distance=8px prevents a tap on the handle from being
  // misread as a drag start (important for touch where a small movement is noise).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    // Guard: no drop target, or dropped on self (no-op).
    if (!over || active.id === over.id) return;

    // Find the old and new positions in the current items array.
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    // Simulate the move to determine the item's new neighbours.
    // moved[newIndex - 1] is the item that will be before the moved item.
    // moved[newIndex + 1] is the item that will be after it.
    // These are passed to onReorder to calculate the fractional midpoint.
    const moved = arrayMove(items, oldIndex, newIndex);
    onReorder(items[oldIndex]!, moved[newIndex - 1], moved[newIndex + 1]);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <SortableRow
              key={item.id}
              item={item}
              onToggle={onToggle}
              onEditTitle={onEditTitle}
              onDelete={onDelete}
              trailing={renderTrailing?.(item)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
