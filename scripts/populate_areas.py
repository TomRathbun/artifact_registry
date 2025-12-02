"""
Script to populate the database with sample areas.
Run this to fix the blank areas page.
"""
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Sample areas to create
SAMPLE_AREAS = [
    {"code": "MCK", "name": "McKinsey", "description": "McKinsey-related requirements and features"},
    {"code": "IT", "name": "Information Technology", "description": "IT infrastructure and systems"},
    {"code": "HR", "name": "Human Resources", "description": "HR processes and employee management"},
    {"code": "FIN", "name": "Finance", "description": "Financial systems and reporting"},
    {"code": "OPS", "name": "Operations", "description": "Operational processes and workflows"},
]

def create_areas():
    """Create sample areas in the database."""
    print("Creating sample areas...")
    
    for area in SAMPLE_AREAS:
        try:
            response = requests.post(
                f"{BASE_URL}/metadata/areas",
                json=area
            )
            if response.status_code == 201:
                print(f"✓ Created area: {area['code']} - {area['name']}")
            elif response.status_code == 400 and "already exists" in response.text:
                print(f"⊙ Area already exists: {area['code']} - {area['name']}")
            else:
                print(f"✗ Failed to create area {area['code']}: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"✗ Error creating area {area['code']}: {e}")
    
    print("\nDone! Check the areas page in your application.")

if __name__ == "__main__":
    create_areas()
