import type { Bookmark } from "./types";

export type BitesSegment = "want_to_try" | "favorites" | "lists";

export const BITES_SEGMENTS: { value: BitesSegment; label: string }[] = [
  { value: "want_to_try", label: "Want To Try" },
  { value: "favorites", label: "Favorites" },
  { value: "lists", label: "Lists" },
];

export type BitesCollections = {
  wantToTry: Bookmark[];
  favorites: Bookmark[];
};

/**
 * Split saved restaurants into Bites collections.
 * Want To Try = not yet visited; Favorites = visited / completed experiences.
 */
export function getBitesCollections(bookmarks: Bookmark[]): BitesCollections {
  const wantToTry = bookmarks
    .filter((b) => b.status === "want_to_try" || b.status === "planned")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const favorites = bookmarks
    .filter((b) => b.status === "visited")
    .sort((a, b) => {
      const aT = a.visitedAt ?? a.updatedAt;
      const bT = b.visitedAt ?? b.updatedAt;
      return new Date(bT).getTime() - new Date(aT).getTime();
    });

  return { wantToTry, favorites };
}

export function bitesCollectionIsEmpty(collections: BitesCollections, listCount: number): boolean {
  return collections.wantToTry.length === 0 && collections.favorites.length === 0 && listCount === 0;
}

export function selectBitesItems(
  collections: BitesCollections,
  segment: BitesSegment,
): Bookmark[] {
  if (segment === "want_to_try") return collections.wantToTry;
  if (segment === "favorites") return collections.favorites;
  return [];
}
