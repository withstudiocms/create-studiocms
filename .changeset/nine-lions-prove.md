---
"create-studiocms": patch
---

Fix CLI interactive environment builder with two important changes:
1. Fixed token validation in Turso authentication to properly handle empty or undefined tokens
2. Improved environment variable generation to only include OAuth providers actually selected by the user
