from sqlalchemy import text
from app.db.base import engine
from app.core.roles import Role

def sanitize_roles():
    with engine.connect() as conn:
        print("Sanitizing user roles in database...")
        try:
            # Fix Role.ADMIN -> admin
            conn.execute(text(f"UPDATE users SET role = '{Role.ADMIN.value}' WHERE role = 'Role.ADMIN';"))
            # Fix any other potential enum string matches
            for role in Role:
                conn.execute(text(f"UPDATE users SET role = '{role.value}' WHERE role = 'Role.{role.name}';"))
            
            conn.commit()
            print("Successfully sanitized roles.")
            
            # Verify admin
            result = conn.execute(text("SELECT role FROM users WHERE username = 'admin';"))
            print(f"Verified Admin Role: {result.scalar()}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    sanitize_roles()
