-- This is an empty migration.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ 
DECLARE temprow RECORD;

BEGIN FOR temprow IN
SELECT
  unnest(guests) as guest,
  id
from
  "Reservation" LOOP
INSERT INTO
  "Guest"(id, name, "reservationId")
VALUES
  (gen_random_uuid(), temprow.guest, temprow.id);

END LOOP;

END $$