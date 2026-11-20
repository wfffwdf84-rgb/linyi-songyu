/**
 * The product photo, with a fallback for the products that have none.
 *
 * A catalogue import can add a part the factory has no photograph of yet, and
 * such a product is stored with an empty `image` rather than a borrowed photo of
 * a different part. `next/image` must never receive that empty string: an
 * `<Image src="">` is a request for the page itself, which renders as a broken
 * image. Every consumer therefore resolves the value through this helper.
 */
export const PRODUCT_PLACEHOLDER_IMAGE = "/images/product-placeholder.svg";

/** True when the product carries a photo of its own. */
export function hasProductPhoto(image?: string | null) {
  return Boolean((image ?? "").trim());
}

/** The photo to render: the product's own, or the shipped placeholder. */
export function productImageSource(image?: string | null) {
  const value = (image ?? "").trim();
  return value || PRODUCT_PLACEHOLDER_IMAGE;
}
