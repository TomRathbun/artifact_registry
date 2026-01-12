"""
Test script for the Requirements Classifier API
"""
import requests
import json

# Test the health endpoint
print("Testing classifier health endpoint...")
try:
    response = requests.get("http://localhost:8000/api/v1/classifier/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

# Test the classify endpoint
print("Testing classifier classify endpoint...")
test_requirements = [
    "The system shall be fast and user-friendly",
    "The system shall process user requests within 2 seconds with 99.9% uptime",
    "The login page must validate user credentials against the database and display appropriate error messages if authentication fails"
]

for req_text in test_requirements:
    print(f"\nTesting requirement: '{req_text}'")
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/classifier/classify",
            json={"text": req_text}
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Classifications:")
            for category, prob in data['classifications'].items():
                flag = "⚠️" if data['predictions'][category] else "✓"
                print(f"  {flag} {category}: {prob*100:.1f}%")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
