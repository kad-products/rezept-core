-- Normalize existing source values: strip protocol (https:// or http://) and trailing slashes.
-- First delete any duplicates that would collide after normalization, keeping the most recently created row.
DELETE FROM recipes
WHERE source IS NOT NULL
  AND id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY
          RTRIM(
            CASE
              WHEN source LIKE 'https://%' THEN SUBSTR(source, 9)
              WHEN source LIKE 'http://%'  THEN SUBSTR(source, 8)
              ELSE source
            END,
            '/'
          )
        ORDER BY created_at DESC
      ) AS rn
      FROM recipes
      WHERE source IS NOT NULL
    ) ranked
    WHERE rn = 1
  );--> statement-breakpoint

-- Apply normalization to all remaining rows.
UPDATE recipes
SET source =
  RTRIM(
    CASE
      WHEN source LIKE 'https://%' THEN SUBSTR(source, 9)
      WHEN source LIKE 'http://%'  THEN SUBSTR(source, 8)
      ELSE source
    END,
    '/'
  )
WHERE source IS NOT NULL;
