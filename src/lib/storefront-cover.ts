export type StorefrontCoverSource = { color: string | null; image: string | null | undefined };

export const STOREFRONT_COVER_VERSION_PATH = "/covers-v9/";

export function storefrontCoverSources(sources: StorefrontCoverSource[]) {
  const byColor = new Map<string, { color: string; image: string }>();
  const withoutColor = new Map<string, { color: string; image: string }>();

  for (const source of sources) {
    const image = source.image?.trim();
    if (!image) continue;
    const color = source.color?.trim() || "";
    const key = color.toLocaleLowerCase("pt-BR");

    if (key) {
      if (!byColor.has(key)) byColor.set(key, { color, image });
    } else if (!withoutColor.has(image)) {
      withoutColor.set(image, { color: "Sem cor informada", image });
    }
  }

  return [...byColor.values(), ...withoutColor.values()].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.image === item.image) === index,
  );
}

export function storefrontCoverNeedsGeneration(
  currentCover: string | null | undefined,
  sources: StorefrontCoverSource[],
) {
  const items = storefrontCoverSources(sources);
  if (items.length < 2) return false;

  const cover = currentCover?.trim();
  if (!cover) return true;
  if (items.some((item) => item.image === cover)) return true;

  return !cover.includes(STOREFRONT_COVER_VERSION_PATH);
}
