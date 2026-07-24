/*
  # NZ Locations Table

  1. New Tables
    - `nz_locations`
      - `id` (integer, primary key, auto-increment)
      - `name` (text) — city, town or suburb name
      - `region` (text) — NZ region name
      - `type` (text) — 'city', 'town', or 'suburb'

  2. Indexes
    - Index on `name` for fast prefix/ilike searches

  3. Security
    - Enable RLS
    - Public read-only policy (required so unauthenticated users can search during signup)

  4. Seed Data
    - Comprehensive list of NZ cities, towns and notable localities
*/

CREATE TABLE IF NOT EXISTS nz_locations (
  id serial PRIMARY KEY,
  name text NOT NULL,
  region text NOT NULL,
  type text NOT NULL DEFAULT 'town'
);

CREATE INDEX IF NOT EXISTS nz_locations_name_idx ON nz_locations (name text_pattern_ops);

ALTER TABLE nz_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read nz_locations"
  ON nz_locations FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── SEED DATA ──────────────────────────────────────────────────────────────
INSERT INTO nz_locations (name, region, type) VALUES
-- Auckland Region
('Auckland', 'Auckland', 'city'),
('Manukau', 'Auckland', 'city'),
('North Shore', 'Auckland', 'city'),
('Waitakere', 'Auckland', 'city'),
('Henderson', 'Auckland', 'suburb'),
('Papakura', 'Auckland', 'town'),
('Pukekohe', 'Auckland', 'town'),
('Warkworth', 'Auckland', 'town'),
('Helensville', 'Auckland', 'town'),
('Orewa', 'Auckland', 'town'),
('Silverdale', 'Auckland', 'town'),
('Takapuna', 'Auckland', 'suburb'),
('Birkenhead', 'Auckland', 'suburb'),
('Devonport', 'Auckland', 'suburb'),
('Glenfield', 'Auckland', 'suburb'),
('Albany', 'Auckland', 'suburb'),
('Howick', 'Auckland', 'suburb'),
('Botany Downs', 'Auckland', 'suburb'),
('Flat Bush', 'Auckland', 'suburb'),
('Otahuhu', 'Auckland', 'suburb'),
('Manurewa', 'Auckland', 'suburb'),
('Papatoetoe', 'Auckland', 'suburb'),
('Otara', 'Auckland', 'suburb'),
('Pakuranga', 'Auckland', 'suburb'),
('Mt Eden', 'Auckland', 'suburb'),
('Ponsonby', 'Auckland', 'suburb'),
('Remuera', 'Auckland', 'suburb'),
('Epsom', 'Auckland', 'suburb'),
('Newmarket', 'Auckland', 'suburb'),
('Parnell', 'Auckland', 'suburb'),
('Grey Lynn', 'Auckland', 'suburb'),
('Onehunga', 'Auckland', 'suburb'),
('Mt Roskill', 'Auckland', 'suburb'),
('Avondale', 'Auckland', 'suburb'),
('New Lynn', 'Auckland', 'suburb'),
('Glen Eden', 'Auckland', 'suburb'),
('Titirangi', 'Auckland', 'suburb'),
('Swanson', 'Auckland', 'suburb'),
('Kumeu', 'Auckland', 'town'),
('Whangaparaoa', 'Auckland', 'town'),
('Red Beach', 'Auckland', 'town'),
('Beachlands', 'Auckland', 'town'),
('Clevedon', 'Auckland', 'town'),
('Waiheke Island', 'Auckland', 'town'),

-- Northland Region
('Whangarei', 'Northland', 'city'),
('Kaikohe', 'Northland', 'town'),
('Kerikeri', 'Northland', 'town'),
('Kaitaia', 'Northland', 'town'),
('Dargaville', 'Northland', 'town'),
('Paihia', 'Northland', 'town'),
('Russell', 'Northland', 'town'),
('Rawene', 'Northland', 'town'),
('Ngunguru', 'Northland', 'town'),
('Waipu', 'Northland', 'town'),
('Mangawhai', 'Northland', 'town'),
('Ruakaka', 'Northland', 'town'),
('Hikurangi', 'Northland', 'town'),
('Kawakawa', 'Northland', 'town'),
('Maungaturoto', 'Northland', 'town'),

-- Waikato Region
('Hamilton', 'Waikato', 'city'),
('Cambridge', 'Waikato', 'town'),
('Te Awamutu', 'Waikato', 'town'),
('Huntly', 'Waikato', 'town'),
('Ngaruawahia', 'Waikato', 'town'),
('Raglan', 'Waikato', 'town'),
('Tokoroa', 'Waikato', 'town'),
('Matamata', 'Waikato', 'town'),
('Morrinsville', 'Waikato', 'town'),
('Paeroa', 'Waikato', 'town'),
('Whangamata', 'Waikato', 'town'),
('Thames', 'Waikato', 'town'),
('Coromandel', 'Waikato', 'town'),
('Whitianga', 'Waikato', 'town'),
('Tairua', 'Waikato', 'town'),
('Waihi', 'Waikato', 'town'),
('Putaruru', 'Waikato', 'town'),
('Otorohanga', 'Waikato', 'town'),
('Te Kuiti', 'Waikato', 'town'),
('Taumarunui', 'Waikato', 'town'),

-- Bay of Plenty Region
('Tauranga', 'Bay of Plenty', 'city'),
('Rotorua', 'Bay of Plenty', 'city'),
('Whakatane', 'Bay of Plenty', 'town'),
('Katikati', 'Bay of Plenty', 'town'),
('Te Puke', 'Bay of Plenty', 'town'),
('Opotiki', 'Bay of Plenty', 'town'),
('Kawerau', 'Bay of Plenty', 'town'),
('Edgecumbe', 'Bay of Plenty', 'town'),
('Mount Maunganui', 'Bay of Plenty', 'suburb'),
('Papamoa', 'Bay of Plenty', 'suburb'),
('Murupara', 'Bay of Plenty', 'town'),

-- Gisborne Region
('Gisborne', 'Gisborne', 'city'),
('Ruatoria', 'Gisborne', 'town'),
('Tolaga Bay', 'Gisborne', 'town'),
('Tokomaru Bay', 'Gisborne', 'town'),

-- Hawke''s Bay Region
('Napier', 'Hawke''s Bay', 'city'),
('Hastings', 'Hawke''s Bay', 'city'),
('Havelock North', 'Hawke''s Bay', 'town'),
('Waipawa', 'Hawke''s Bay', 'town'),
('Waipukurau', 'Hawke''s Bay', 'town'),
('Wairoa', 'Hawke''s Bay', 'town'),

-- Taranaki Region
('New Plymouth', 'Taranaki', 'city'),
('Stratford', 'Taranaki', 'town'),
('Hawera', 'Taranaki', 'town'),
('Inglewood', 'Taranaki', 'town'),
('Waitara', 'Taranaki', 'town'),
('Opunake', 'Taranaki', 'town'),
('Eltham', 'Taranaki', 'town'),

-- Manawatu-Whanganui Region
('Palmerston North', 'Manawatu-Whanganui', 'city'),
('Whanganui', 'Manawatu-Whanganui', 'city'),
('Feilding', 'Manawatu-Whanganui', 'town'),
('Levin', 'Manawatu-Whanganui', 'town'),
('Foxton', 'Manawatu-Whanganui', 'town'),
('Marton', 'Manawatu-Whanganui', 'town'),
('Bulls', 'Manawatu-Whanganui', 'town'),
('Ohakune', 'Manawatu-Whanganui', 'town'),
('Taumarunui', 'Manawatu-Whanganui', 'town'),
('Taihape', 'Manawatu-Whanganui', 'town'),
('Dannevirke', 'Manawatu-Whanganui', 'town'),

-- Wellington Region
('Wellington', 'Wellington', 'city'),
('Lower Hutt', 'Wellington', 'city'),
('Upper Hutt', 'Wellington', 'city'),
('Porirua', 'Wellington', 'city'),
('Petone', 'Wellington', 'suburb'),
('Eastbourne', 'Wellington', 'suburb'),
('Johnsonville', 'Wellington', 'suburb'),
('Tawa', 'Wellington', 'suburb'),
('Paraparaumu', 'Wellington', 'town'),
('Waikanae', 'Wellington', 'town'),
('Otaki', 'Wellington', 'town'),
('Masterton', 'Wellington', 'city'),
('Carterton', 'Wellington', 'town'),
('Greytown', 'Wellington', 'town'),
('Featherston', 'Wellington', 'town'),
('Martinborough', 'Wellington', 'town'),

-- Tasman Region
('Richmond', 'Tasman', 'town'),
('Motueka', 'Tasman', 'town'),
('Takaka', 'Tasman', 'town'),
('Murchison', 'Tasman', 'town'),
('Wakefield', 'Tasman', 'town'),

-- Nelson Region
('Nelson', 'Nelson', 'city'),
('Stoke', 'Nelson', 'suburb'),
('Brightwater', 'Nelson', 'town'),

-- Marlborough Region
('Blenheim', 'Marlborough', 'city'),
('Picton', 'Marlborough', 'town'),
('Havelock', 'Marlborough', 'town'),
('Renwick', 'Marlborough', 'town'),
('Seddon', 'Marlborough', 'town'),

-- West Coast Region
('Greymouth', 'West Coast', 'city'),
('Westport', 'West Coast', 'town'),
('Hokitika', 'West Coast', 'town'),
('Reefton', 'West Coast', 'town'),
('Karamea', 'West Coast', 'town'),
('Ross', 'West Coast', 'town'),
('Haast', 'West Coast', 'town'),

-- Canterbury Region
('Christchurch', 'Canterbury', 'city'),
('Rolleston', 'Canterbury', 'town'),
('Rangiora', 'Canterbury', 'town'),
('Kaiapoi', 'Canterbury', 'town'),
('Lincoln', 'Canterbury', 'town'),
('Darfield', 'Canterbury', 'town'),
('Ashburton', 'Canterbury', 'city'),
('Timaru', 'Canterbury', 'city'),
('Temuka', 'Canterbury', 'town'),
('Pleasant Point', 'Canterbury', 'town'),
('Methven', 'Canterbury', 'town'),
('Oxford', 'Canterbury', 'town'),
('Amberley', 'Canterbury', 'town'),
('Hanmer Springs', 'Canterbury', 'town'),
('Kaikoura', 'Canterbury', 'town'),
('Geraldine', 'Canterbury', 'town'),

-- Otago Region
('Dunedin', 'Otago', 'city'),
('Queenstown', 'Otago', 'city'),
('Wanaka', 'Otago', 'town'),
('Oamaru', 'Otago', 'city'),
('Alexandra', 'Otago', 'town'),
('Cromwell', 'Otago', 'town'),
('Clyde', 'Otago', 'town'),
('Ranfurly', 'Otago', 'town'),
('Palmerston', 'Otago', 'town'),
('Milton', 'Otago', 'town'),
('Mosgiel', 'Otago', 'suburb'),
('Port Chalmers', 'Otago', 'suburb'),
('Arrowtown', 'Otago', 'town'),
('Roxburgh', 'Otago', 'town'),
('Lawrence', 'Otago', 'town'),

-- Southland Region
('Invercargill', 'Southland', 'city'),
('Gore', 'Southland', 'town'),
('Winton', 'Southland', 'town'),
('Lumsden', 'Southland', 'town'),
('Riverton', 'Southland', 'town'),
('Bluff', 'Southland', 'town'),
('Te Anau', 'Southland', 'town'),
('Tuatapere', 'Southland', 'town'),
('Otautau', 'Southland', 'town'),

-- Wairarapa (part of Wellington region)
('Eketahuna', 'Wellington', 'town'),
('Pahiatua', 'Manawatu-Whanganui', 'town'),
('Woodville', 'Manawatu-Whanganui', 'town'),

-- Additional notable localities
('Tokoroa', 'Waikato', 'town'),
('Taupo', 'Waikato', 'city'),
('Turangi', 'Waikato', 'town'),
('Mangakino', 'Waikato', 'town'),
('Putaruru', 'Waikato', 'town');
