# migrations/env.py
from logging.config import fileConfig

from alembic import context

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# -------------------------------------------------
#  IMPORT YOUR MODELS (so autogenerate sees them)
# -------------------------------------------------
from app.db.base import Base
# Import package so all models register on Base.metadata for autogenerate
import app.db.base  # noqa: F401 — loads models via base.py side effects
target_metadata = Base.metadata

# -------------------------------------------------
#  USE YOUR EXISTING ENGINE (from app.db.session)
# -------------------------------------------------
from app.db.base import engine
connectable = engine

from app.core.config import settings

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = settings.DATABASE_URL
    context.configure(
        url=url, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"}
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()