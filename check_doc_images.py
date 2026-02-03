import psycopg2
conn = psycopg2.connect('postgresql://admin@localhost:5433/registry')
cur = conn.cursor()
cur.execute("SELECT aid, title, content_text FROM documents LIMIT 20;")
results = cur.fetchall()
import re
image_regex = r"!\[([^\]]*)\]\(([^)]+)\)"
for row in results:
    content = row[2] if row[2] is not None else ""
    matches = re.findall(image_regex, content)
    if matches:
        print(f"AID: {row[0]}")
        print(f"Title: {row[1]}")
        for alt, src in matches:
            print(f"  - Image: {src} (alt: {alt})")
        print("-" * 50)
cur.close()
conn.close()
