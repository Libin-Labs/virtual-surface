import { createVirtualSurface, type SurfaceAnchor } from '@lp-labs/virtual-surface';

const surface = createVirtualSurface([24, 48, 32]);
const anchor: SurfaceAnchor | null = surface.anchorAt(30);
console.log(surface.visibleRange(20, 40), surface.restoreAnchor(anchor));
