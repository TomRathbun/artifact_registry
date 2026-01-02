from sqlalchemy import text
from app.db.base import engine

def delete_user(username: str):
    with engine.connect() as conn:
        print(f"Deleting user: {username}")
        result = conn.execute(text(f"DELETE FROM users WHERE username = '{username}';"))
        conn.commit()
        if result.rowcount > 0:
            print(f"Successfully deleted user '{username}'")
        else:
            print(f"User '{username}' not found")

if __name__ == "__main__":
    delete_user("rathbun")
