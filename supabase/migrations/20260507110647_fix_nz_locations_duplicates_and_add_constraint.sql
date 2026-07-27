/*
  # Fix duplicate nz_locations rows and add unique constraint

  1. Removes duplicate rows keeping only the lowest id per (name, region) pair
  2. Adds a UNIQUE constraint on (name, region) to prevent future duplicates
*/

DELETE FROM nz_locations
WHERE id NOT IN (
  SELECT MIN(id)
  FROM nz_locations
  GROUP BY name, region
);

ALTER TABLE nz_locations ADD CONSTRAINT nz_locations_name_region_unique UNIQUE (name, region);
