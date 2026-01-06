# scripts/add_admin.py
import sys
import os

# Add the project root to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.db.models.user import User
from app.core.security import get_password_hash
from app.core.roles import Role

def add_admin(username, email, password, full_name=None):
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            print(f"User with username '{username}' or email '{email}' already exists.")
            return

        hashed_password = get_password_hash(password)
        new_user = User(
            aid=username,
            username=username,
            email=email,
            full_name=full_name,
            roles=[Role.ADMIN.value],
            hashed_password=hashed_password,
            is_active=True,
            password_expired=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"Successfully added admin user: {username}")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Add an admin user to the database.")
    parser.add_argument("--username", help="Username for the new admin")
    parser.add_argument("--email", help="Email for the new admin")
    parser.add_argument("--password", help="Password for the new admin")
    parser.add_argument("--full-name", help="Full name for the new admin (optional)")

    args = parser.parse_args()

    # If no arguments provided, and we are in an interactive session, prompt for them.
    # Note: In this environment, we might not be able to do 'input' if not interactive.
    # But for the USER it will work when they run it.
    
    if not args.username or not args.email or not args.password:
        print("Missing arguments. Usage: python scripts/add_admin.py --username admin --email admin@example.com --password secret")
        print("Or if running interactively, providing them via input (if supported).")
        try:
            username = args.username or input("Enter username: ")
            email = args.email or input("Enter email: ")
            password = args.password or input("Enter password: ")
            full_name = args.full_name or input("Enter full name (optional): ")
            add_admin(username, email, password, full_name if full_name else None)
        except EOFError:
            print("\nError: Could not read from stdin. Please provide arguments.")
    else:
        add_admin(args.username, args.email, args.password, args.full_name)
