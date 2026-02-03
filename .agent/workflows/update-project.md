---
description: how to update the project codebase and data
---

// turbo-all
1. Update codebase
```bash
git pull origin main
```

2. Update registry-data
```bash
git -C C:/Users/USER/registry-data pull origin main
```

3. Run database migrations
```bash
uv run alembic upgrade head
```

4. Sync images to database
```bash
uv run python scripts/migrate_images_to_db.py
```
