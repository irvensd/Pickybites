-- Savr Seed Data — run AFTER schema.sql (safe to re-run)

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM restaurants LIMIT 1) THEN
    RAISE NOTICE 'Restaurants already seeded, skipping.';
    RETURN;
  END IF;

  INSERT INTO restaurants (name, address, city, cuisine, price_level, image_url) VALUES
  ('Nori House', '123 Sunset Blvd', 'Los Angeles', 'Japanese', 3, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80'),
  ('Luna Trattoria', '45 Mulberry St', 'New York', 'Italian', 2, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80'),
  ('Taco Libre', '789 Mission St', 'Los Angeles', 'Mexican', 1, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80'),
  ('Saffron Garden', '22 Devon Ave', 'Chicago', 'Indian', 2, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80'),
  ('Island Spice', '88 Ocean Dr', 'Miami', 'Caribbean', 2, 'https://images.unsplash.com/photo-1608039756161-2460f4a6f986?w=800&q=80'),
  ('Green Bowl', '501 Vegan Way', 'Los Angeles', 'Mediterranean', 2, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80'),
  ('Bangkok Street', '312 Congress Ave', 'Austin', 'Thai', 1, 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80'),
  ('Seoul Kitchen', '901 Market St', 'San Francisco', 'Korean', 2, 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&q=80'),
  ('Le Petit Bistro', '14 Rue Imaginary', 'New York', 'French', 4, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'),
  ('Smash & Sauce', '220 Main St', 'Austin', 'American', 2, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80'),
  ('Golden Dragon', '55 Grant Ave', 'San Francisco', 'Chinese', 2, 'https://images.unsplash.com/photo-1526318896985-4d5495bdd9c7?w=800&q=80'),
  ('Pho Real', '77 Sunset Strip', 'Los Angeles', 'Vietnamese', 1, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80'),
  ('Olive & Thyme', '3 Harbor View', 'Miami', 'Greek', 2, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80'),
  ('Ramen Lab', '404 Valencia St', 'San Francisco', 'Japanese', 2, 'https://images.unsplash.com/photo-1569718212165-3a8278dfe5bf?w=800&q=80'),
    ('Tapas y Vino', '18 La Rambla', 'Miami', 'Spanish', 3, 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800&q=80');
END $$;
