from sqlalchemy import text
from app.db.base import engine

# Correct hash for 'seclpass'
SECL_PASS_HASH = "$argon2id$v=19$m=65536,t=3,p=4$FSh3SKDmtXDxHTXC93snCA$5LaMcoAwxs4G5YFdT+/qbkI1sZaKLAzTLEr0iF4SWYM"

def reset_admin_password():
    with engine.connect() as conn:
        print("Resetting admin password hash to correct Argon2 hash...")
        try:
            result = conn.execute(text(f"UPDATE users SET hashed_password = '{SECL_PASS_HASH}' WHERE username = 'admin';"))
            conn.commit()
            if result.rowcount > 0:
                print("Successfully reset admin password to 'seclpass'!")
            else:
                print("Admin user not found.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    reset_admin_password()
