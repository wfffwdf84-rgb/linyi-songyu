import { siteConfig } from "@/lib/site";

export function mapsOpenHref(locale: string, lat = siteConfig.linyi.lat, lng = siteConfig.linyi.lng, query = siteConfig.linyi.query) {
  if (locale === "zh") {
    return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent("临沂松昱")}&src=linyi-songyu&coordinate=gaode&callnative=1`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsEmbedSrc(locale: string, lat = siteConfig.linyi.lat, lng = siteConfig.linyi.lng) {
  if (locale === "zh") {
    return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent("临沂松昱")}&src=linyi-songyu&coordinate=gaode&callnative=0`;
  }
  const padLng = 0.22;
  const padLat = 0.14;
  const bbox = [lng - padLng, lat - padLat, lng + padLng, lat + padLat].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}
