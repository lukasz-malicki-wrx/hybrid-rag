"use client";

import { useCallback, useMemo, useState, type DragEvent } from "react";

/** Drag-and-drop of files onto an element; `dragging` drives the overlay. */
export function useFileDrop(onFiles: (files: FileList) => void) {
  const [dragging, setDragging] = useState(false);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);
  const onDragLeave = useCallback((e: DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  }, []);
  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
    },
    [onFiles],
  );

  const handlers = useMemo(() => ({ onDragOver, onDragLeave, onDrop }), [onDragOver, onDragLeave, onDrop]);
  return { dragging, handlers };
}
