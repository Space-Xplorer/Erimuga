import { useState } from 'react';

/**
 * Minimal drag-to-reorder for lists, built on native HTML5 drag events so it
 * adds no dependency. Desktop-only by nature — pair it with up/down buttons for
 * touch, which is why the admin tables keep both.
 *
 * Usage:
 *   const { dragProps, isDragging } = useDragSort(items.length, (from, to) => reorder(from, to));
 *   ...
 *   <div {...dragProps(index)} className={isDragging(index) ? 'opacity-50' : ''}>
 *
 * `onReorder(from, to)` is called once, on drop, with the moved item's original
 * and target indices.
 */
export default function useDragSort(count, onReorder) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const dragProps = (index) => ({
    draggable: true,
    onDragStart: (e) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      // Firefox needs data set for a drag to actually begin.
      e.dataTransfer.setData('text/plain', String(index));
    },
    onDragOver: (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (index !== overIndex) setOverIndex(index);
    },
    onDrop: (e) => {
      e.preventDefault();
      if (dragIndex !== null && dragIndex !== index) onReorder(dragIndex, index);
      setDragIndex(null);
      setOverIndex(null);
    },
    onDragEnd: () => {
      setDragIndex(null);
      setOverIndex(null);
    },
  });

  return {
    dragProps,
    isDragging: (index) => dragIndex === index,
    isOver: (index) => overIndex === index && dragIndex !== index,
  };
}
