import "@testing-library/react-native/matchers";

jest.mock("@/lib/haptics", () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
  hapticSuccess: jest.fn(),
  hapticSelection: jest.fn(),
}));

jest.mock("@/lib/location", () => ({
  getCurrentCoordinates: jest.fn(async () => null),
  distanceMeters: jest.fn(() => 0),
}));
