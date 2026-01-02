from sqlalchemy import text
from app.db.base import engine

def list_users():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT aid, username, email, full_name, roles FROM users ORDER BY created_date;"))
        print("Current users in database:")
        print("-" * 80)
        for row in result:
            print(f"Username: {row[1]:<15} Email: {row[2]:<30} Roles: {row[4]}")
        print("-" * 80)

if __name__ == "__main__":
    list_users()
