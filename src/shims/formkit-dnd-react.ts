import { useRef, useState, useEffect, type RefCallback } from "react";

export const useDragAndDrop = <T extends HTMLElement, V,>(initial: V[]) => {
  const [items, setItems] = useState<V[]>(initial);
  const dragIndex = useRef<number | null>(null);
  const nodeRef = useRef<T | null>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const onDragStart = (event: DragEvent) => {
      const el = (event.target as HTMLElement | null)?.closest("[data-dnd-index]") as HTMLElement | null;
      if (!el) return;
      dragIndex.current = Number(el.dataset.dndIndex);
      event.dataTransfer?.setData("text/plain", String(dragIndex.current));
      event.dataTransfer?.setDragImage(el, 16, 16);
    };

    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
    };

    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      const el = (event.target as HTMLElement | null)?.closest("[data-dnd-index]") as HTMLElement | null;
      if (!el) return;
      const from = dragIndex.current;
      const to = Number(el.dataset.dndIndex);
      if (from == null || Number.isNaN(to) || from === to) return;
      setItems((prev) => {
        const copy = [...prev];
        const [moved] = copy.splice(from, 1);
        copy.splice(to, 0, moved);
        return copy;
      });
      dragIndex.current = null;
    };

    node.addEventListener("dragstart", onDragStart);
    node.addEventListener("dragover", onDragOver);
    node.addEventListener("drop", onDrop);

    return () => {
      node.removeEventListener("dragstart", onDragStart);
      node.removeEventListener("dragover", onDragOver);
      node.removeEventListener("drop", onDrop);
    };
  }, []);

  const ref: RefCallback<T> = (node) => {
    nodeRef.current = node;
  };

  return [ref, items, setItems] as const;
};
