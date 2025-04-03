---
"create-studiocms": patch
---

Fixes bug in the Turso authentication process where the token was being passed as `undefined` to the turso config set token command
