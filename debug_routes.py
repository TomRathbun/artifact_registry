from artifact_registry import app
for route in app.routes:
    if hasattr(route, "methods"):
        print(f"{route.path} {route.methods}")
    else:
        print(f"{route.path}")
