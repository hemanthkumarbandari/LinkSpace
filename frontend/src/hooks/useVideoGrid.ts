'use client';

export const VIDEO_GRID_PAGE_SIZE = 6;

export interface GridSlot {
  gridColumn: string;
  gridRow: string;
}

export interface VideoGridLayout {
  templateColumns: string;
  templateRows: string;
  slots: GridSlot[];
  totalPages: number;
  pageCount: number;
}

function columnCount(n: number): number {
  if (n <= 1) return 1;
  if (n === 2) return 2;
  if (n === 3) return 3;
  if (n === 4) return 2;
  return 3;
}

function layoutForCount(n: number): Pick<VideoGridLayout, 'templateColumns' | 'templateRows' | 'slots'> {
  if (n <= 0) {
    return { templateColumns: '1fr', templateRows: '1fr', slots: [] };
  }

  const cols = columnCount(n);
  const rows = Math.ceil(n / cols);

  const slots: GridSlot[] = Array.from({ length: n }, (_, i) => ({
    gridColumn: String((i % cols) + 1),
    gridRow: String(Math.floor(i / cols) + 1),
  }));

  return {
    templateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    templateRows: `repeat(${rows}, minmax(0, 1fr))`,
    slots,
  };
}

export function useVideoGrid(totalCount: number, page: number): VideoGridLayout {
  const totalPages = Math.max(1, Math.ceil(Math.max(totalCount, 1) / VIDEO_GRID_PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const pageStart = safePage * VIDEO_GRID_PAGE_SIZE;
  const pageCount =
    totalCount === 0 ? 0 : Math.min(VIDEO_GRID_PAGE_SIZE, totalCount - pageStart);

  return {
    ...layoutForCount(pageCount),
    totalPages,
    pageCount,
  };
}
