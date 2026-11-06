export interface VirtualRange {
  startIndex: number;
  endIndex: number;
}

export interface SurfaceAnchor {
  index: number;
  offset: number;
}

export interface VirtualSurfaceOptions {
  maxItems?: number;
}

export interface VirtualSurface {
  readonly itemCount: number;
  readonly totalSize: number;
  itemOffset(index: number): number;
  visibleRange(scrollOffset: number, viewportSize: number, overscan?: number): VirtualRange;
  anchorAt(scrollOffset: number): SurfaceAnchor | null;
  restoreAnchor(anchor: SurfaceAnchor | null): number;
}

function finiteNonNegative(value: number, name: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite non-negative number.`);
  }
  return value;
}

function positiveLimit(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError('maxItems must be a positive safe integer.');
  }
  return value;
}

export function createVirtualSurface(
  input: Iterable<number>,
  options: VirtualSurfaceOptions = {},
): VirtualSurface {
  if (input == null || typeof input[Symbol.iterator] !== 'function') {
    throw new TypeError('Item sizes must be iterable.');
  }
  const maximum = positiveLimit(options.maxItems ?? 100_000);
  const sizes: number[] = [];
  const offsets = [0];
  for (const size of input) {
    if (sizes.length === maximum) throw new RangeError('Virtual surface item capacity exceeded.');
    if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0) {
      throw new RangeError('Item sizes must be positive finite numbers.');
    }
    const total = offsets[offsets.length - 1]! + size;
    if (!Number.isFinite(total)) throw new RangeError('Total surface size exceeds numeric range.');
    sizes.push(size);
    offsets.push(total);
  }
  const count = sizes.length;
  const itemAt = (offset: number): number => {
    let low = 0;
    let high = count;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (offsets[middle + 1]! <= offset) low = middle + 1;
      else high = middle;
    }
    return low;
  };
  return {
    itemCount: count,
    totalSize: offsets[count]!,
    itemOffset(index) {
      if (!Number.isSafeInteger(index) || index < 0 || index > count) {
        throw new RangeError('Item offset index must be between zero and itemCount.');
      }
      return offsets[index]!;
    },
    visibleRange(scrollOffset, viewportSize, overscan = 0) {
      finiteNonNegative(scrollOffset, 'scrollOffset');
      finiteNonNegative(viewportSize, 'viewportSize');
      if (!Number.isSafeInteger(overscan) || overscan < 0) {
        throw new RangeError('overscan must be a non-negative safe integer.');
      }
      if (count === 0) return { startIndex: 0, endIndex: 0 };
      const start = Math.min(scrollOffset, offsets[count]!);
      const end = Math.min(start + viewportSize, offsets[count]!);
      if (start === end) {
        const index = itemAt(start);
        return { startIndex: Math.max(0, index - overscan), endIndex: index };
      }
      const first = itemAt(start);
      let last = itemAt(end);
      if (last < count && offsets[last]! < end) last++;
      return {
        startIndex: Math.max(0, first - overscan),
        endIndex: Math.min(count, last + overscan),
      };
    },
    anchorAt(scrollOffset) {
      finiteNonNegative(scrollOffset, 'scrollOffset');
      if (count === 0) return null;
      const position = Math.min(scrollOffset, offsets[count]!);
      const index = Math.min(itemAt(position), count - 1);
      return { index, offset: position - offsets[index]! };
    },
    restoreAnchor(anchor) {
      if (anchor === null) return 0;
      if (
        !anchor ||
        typeof anchor !== 'object' ||
        !Number.isSafeInteger(anchor.index) ||
        anchor.index < 0 ||
        typeof anchor.offset !== 'number' ||
        !Number.isFinite(anchor.offset) ||
        anchor.offset < 0
      ) {
        throw new TypeError('Expected a non-negative surface anchor.');
      }
      if (count === 0) return 0;
      const index = Math.min(anchor.index, count - 1);
      return offsets[index]! + Math.min(anchor.offset, sizes[index]!);
    },
  };
}
