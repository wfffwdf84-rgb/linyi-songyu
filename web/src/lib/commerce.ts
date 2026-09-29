export const PRODUCT_MOQ = 1;
export const QUOTE_QTY_MAX = 9999;

export function productMoq(_product?: { categorySlug?: string; moq?: number }): number {
  return 1;
}
