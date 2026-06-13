export const IMAGE_COUNT = 4;

/**
 * Product photos only exist for these ids (responsive WebP variants live in
 * `static/`). Everything else falls back to the generated CakeArt SVG, which
 * uses the product's `grad` colors.
 */
const PHOTO_PRODUCT_IDS = new Set<string>(['pancho-pineapple']);

export function hasPhotos(productId: string): boolean {
  return PHOTO_PRODUCT_IDS.has(productId);
}

/** Hero on product detail (1:1, up to ~464–752 CSS px). */
export const HERO_WIDTHS_PRODUCT = [320, 480, 640, 768, 960, 1280, 1536] as const;

/** Hero in compact ProductCard (4:3, up to ~320 CSS px). */
export const HERO_WIDTHS_COMPACT = [160, 240, 320, 480, 640] as const;

/** Thumbnail row (4 columns, ~46–169 CSS px). */
export const THUMB_WIDTHS = [64, 96, 192, 384] as const;

/** Lightbox stage (~85vw, up to ~1200 CSS px). */
export const LIGHTBOX_WIDTHS = [768, 1024, 1280, 1536] as const;

/** Width used for the plain `src` fallback (must exist for every photo asset). */
const DEFAULT_WIDTH = 480;

export const HERO_SIZES_PRODUCT =
  '(max-width: 880px) calc(100vw - 128px), calc((min(100vw, 1180px) - 92px - 44px) / 2 - 80px)';

export const HERO_SIZES_COMPACT =
  '(min-width: 1100px) 320px, (min-width: 640px) 33vw, calc(100vw - 88px)';

export const THUMB_SIZES_PRODUCT =
  '(max-width: 880px) calc((100vw - 128px - 30px) / 4 - 12px), calc(((min(100vw, 1180px) - 92px - 44px) / 2 - 80px - 30px) / 4 - 12px)';

export const THUMB_SIZES_COMPACT =
  '(min-width: 1100px) 68px, (min-width: 640px) 18vw, calc((100vw - 88px - 18px) / 4 - 8px)';

export const LIGHTBOX_SIZES = '85vw';

/** Landing page hero (`static/hero-img_1-*.webp`, index 0 only). */
export const LANDING_HERO_ASSET_ID = 'hero-img';
export const LANDING_HERO_IMAGE_INDEX = 0;
export const LANDING_HERO_WIDTHS = HERO_WIDTHS_PRODUCT;
export const LANDING_HERO_SIZES =
  '(max-width: 880px) calc(100vw - 48px), calc((min(100vw, 1180px) - 78px) * 0.475)';

export function getProductImagePath(productId: string, index: number): string;
export function getProductImagePath(productId: string, index: number, width: number): string;
export function getProductImagePath(productId: string, index: number, width?: number): string {
  const n = index + 1;
  return `/${productId}_${n}-${width ?? DEFAULT_WIDTH}w.webp`;
}

export function buildSrcSet(
  productId: string,
  index: number,
  widths: readonly number[],
): string {
  return widths.map((w) => `${getProductImagePath(productId, index, w)} ${w}w`).join(', ');
}

export function getProductImageUrls(productId: string): string[] {
  return Array.from({ length: IMAGE_COUNT }, (_, i) => getProductImagePath(productId, i));
}

export function getLandingHeroSrc(): string {
  return getProductImagePath(LANDING_HERO_ASSET_ID, LANDING_HERO_IMAGE_INDEX);
}

export function getLandingHeroSrcSet(): string {
  return buildSrcSet(LANDING_HERO_ASSET_ID, LANDING_HERO_IMAGE_INDEX, LANDING_HERO_WIDTHS);
}
