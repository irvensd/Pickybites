import {
  bitesCollectionIsEmpty,
  getBitesCollections,
  selectBitesItems,
} from "@/lib/bites";
import type { Bookmark } from "@/lib/types";

function makeBookmark(overrides: Partial<Bookmark>): Bookmark {
  return {
    id: "b1",
    userId: "user-1",
    restaurantId: "r1",
    googlePlaceId: "g1",
    placeName: "Taco Spot",
    placeAddress: "1 Main St",
    placeCity: "Los Angeles",
    placeCuisine: "Mexican",
    placePriceLevel: 2,
    placeImageUrl: null,
    latitude: 34.05,
    longitude: -118.24,
    status: "want_to_try",
    reasonSaved: "Heard great things",
    plannedAt: null,
    visitedAt: null,
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
    ...overrides,
  };
}

describe("bites collection selection", () => {
  const want = makeBookmark({ id: "want", status: "want_to_try", placeName: "Want Spot" });
  const planned = makeBookmark({ id: "planned", status: "planned", placeName: "Planned Spot" });
  const favorite = makeBookmark({
    id: "fav",
    status: "visited",
    placeName: "Favorite Spot",
    visitedAt: "2024-07-01T00:00:00Z",
  });

  it("puts unvisited saves in Want To Try and visited in Favorites", () => {
    const collections = getBitesCollections([want, planned, favorite]);
    expect(collections.wantToTry.map((b) => b.id)).toEqual(["want", "planned"]);
    expect(collections.favorites.map((b) => b.id)).toEqual(["fav"]);
  });

  it("selects the correct segment items", () => {
    const collections = getBitesCollections([want, favorite]);
    expect(selectBitesItems(collections, "want_to_try")).toHaveLength(1);
    expect(selectBitesItems(collections, "favorites")[0]?.placeName).toBe("Favorite Spot");
    expect(selectBitesItems(collections, "lists")).toEqual([]);
  });

  it("treats Bites as empty only when bookmarks and lists are empty", () => {
    expect(bitesCollectionIsEmpty(getBitesCollections([]), 0)).toBe(true);
    expect(bitesCollectionIsEmpty(getBitesCollections([want]), 0)).toBe(false);
    expect(bitesCollectionIsEmpty(getBitesCollections([]), 2)).toBe(false);
  });
});
