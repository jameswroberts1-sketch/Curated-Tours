# Curated-Tours

Static prototype for Curated Tours.

## Local content QA

Run this before UAT sessions or after editing `Collections.json`:

```bash
node tools/qa-content.mjs
```

The script checks for duplicate IDs, missing coordinates, missing city/collection fields, missing summaries, and missing or unusually sized audio bios.
