import surface = require('@lp-labs/virtual-surface');

const range: surface.VirtualRange = surface.createVirtualSurface([10]).visibleRange(0, 5);
console.log(range.startIndex);
