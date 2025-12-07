#!/usr/bin/env python3
"""
Simple script to fix the JSX structure in ArtifactPresentation.tsx
The issue: Comment panel is outside the grid container, needs to be inside
"""

# Read the file
with open('frontend/src/components/ArtifactPresentation.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the key lines
grid_start = None
main_content_start = None
main_content_end = None
comment_panel_start = None
comment_panel_end = None

for i, line in enumerate(lines):
    if 'grid grid-cols-[1fr_400px]' in line:
        grid_start = i
    elif '{/* Main Content Column */}' in line:
        main_content_start = i + 1  # The div is on the next line
    elif '{/* Comment Panel Column */}' in line:
        comment_panel_start = i
    elif i > 1000 and '</div>' in line and comment_panel_start and not comment_panel_end:
        if i > comment_panel_start + 5:  # Comment panel div closes
            comment_panel_end = i
            break

print(f"Grid starts at line: {grid_start}")
print(f"Main content starts at line: {main_content_start}")
print(f"Comment panel starts at line: {comment_panel_start}")
print(f"Comment panel ends at line: {comment_panel_end}")

# Check if comment panel is outside grid
if comment_panel_start:
    # Find where main content column closes
    indent_count = 0
    for i in range(main_content_start, len(lines)):
        if '<div' in lines[i]:
            indent_count += 1
        if '</div>' in lines[i]:
            if indent_count == 0:
                main_content_end = i
                print(f"Main content ends at line: {main_content_end}")
                break
            indent_count -= 1
    
    if main_content_end and comment_panel_start > main_content_end:
        print("\n❌ PROBLEM: Comment panel is OUTSIDE the grid container!")
        print(f"   Main content closes at line {main_content_end}")
        print(f"   Comment panel starts at line {comment_panel_start}")
        print("\n✅ FIX: Move comment panel to BEFORE line {main_content_end}")
    else:
        print("\n✅ Comment panel is correctly positioned inside grid")
