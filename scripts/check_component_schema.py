import sys
import os

# Add the project root to sys.path
sys.path.append(os.getcwd())

from app.db.session import engine
from sqlalchemy import inspect

inspector = inspect(engine)
columns = inspector.get_columns('components')
print("Columns in 'components' table:")
found = False
for column in columns:
    print(f"- {column['name']} ({column['type']})")
    if column['name'] == 'project_id':
        found = True

if found:
    print("\nSUCCESS: project_id column FOUND in components table.")
else:
    print("\nFAILURE: project_id column NOT FOUND in components table.")
