# Resizable Column Widths Feature

## Overview
Add drag-to-resize functionality for list view columns with persistent widths stored in sessionStorage.

## Requirements
1. Users can drag column dividers to resize columns
2. Column widths are remembered per artifact type
3. Visual feedback during resize (cursor change, divider highlight)
4. Minimum column widths to prevent columns from becoming too narrow
5. Reset to defaults option

## Implementation Steps

### 1. State Management
```typescript
// Add to ArtifactListView component state
const getDefaultColumnWidths = (): Record<string, number> => {
    const base = {
        checkbox: 40,
        aid: 180,
        title: 200,
        status: 100,
        actions: 100
    };
    
    if (artifactType === 'vision' || artifactType === 'document') {
        return { ...base, description: 400 };
    }
    return { ...base, area: 80, description: 300 };
};

const [columnWidths, setColumnWidths] = useState<Record<string, number>>(getDefaultColumnWidths());
const [resizingColumn, setResizingColumn] = useState<string | null>(null);
```

### 2. Load/Save from sessionStorage
```typescript
// Load widths on mount
useEffect(() => {
    if (!projectId || !artifactType) return;
    
    try {
        const key = `column-widths-${projectId}-${artifactType}`;
        const stored = sessionStorage.getItem(key);
        if (stored) {
            setColumnWidths(JSON.parse(stored));
        }
    } catch (e) {
        console.error('Failed to load column widths:', e);
    }
}, [projectId, artifactType]);

// Save widths on change
useEffect(() => {
    if (!projectId || !artifactType) return;
    
    try {
        const key = `column-widths-${projectId}-${artifactType}`;
        sessionStorage.setItem(key, JSON.stringify(columnWidths));
    } catch (e) {
        console.error('Failed to save column widths:', e);
    }
}, [columnWidths, projectId, artifactType]);
```

### 3. Resize Handlers
```typescript
const handleResizeStart = (columnKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingColumn(columnKey);
    setResizeStartX(e.clientX);
    setResizeStartWidth(columnWidths[columnKey]);
};

const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingColumn) return;
    
    const delta = e.clientX - resizeStartX;
    const newWidth = Math.max(50, resizeStartWidth + delta); // Min 50px
    
    setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth
    }));
}, [resizingColumn, resizeStartX, resizeStartWidth]);

const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
}, []);

// Add global mouse event listeners
useEffect(() => {
    if (resizingColumn) {
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
        };
    }
}, [resizingColumn, handleResizeMove, handleResizeEnd]);
```

### 4. Update Grid Template
```typescript
// Convert column widths to grid template
const getGridTemplate = () => {
    const cols = [];
    cols.push(`${columnWidths.checkbox}px`);
    if (artifactType !== 'vision' && artifactType !== 'document') {
        cols.push(`${columnWidths.area}px`);
    }
    cols.push(`${columnWidths.aid}px`);
    cols.push(`${columnWidths.title}px`);
    cols.push(`${columnWidths.description}px`);
    cols.push(`${columnWidths.status}px`);
    cols.push(`${columnWidths.actions}px`);
    return cols.join(' ');
};

// Use in grid style
<div style={{ gridTemplateColumns: getGridTemplate() }}>
```

### 5. Resize Handle Component
```tsx
const ResizeHandle = ({ columnKey }: { columnKey: string }) => (
    <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 group"
        onMouseDown={(e) => handleResizeStart(columnKey, e)}
    >
        <div className="absolute inset-y-0 -left-1 -right-1" /> {/* Wider hit area */}
    </div>
);

// Add to each column header
<div className="relative">
    {col.label}
    <ResizeHandle columnKey={col.key} />
</div>
```

### 6. Reset to Defaults
```typescript
const resetColumnWidths = () => {
    setColumnWidths(getDefaultColumnWidths());
};

// Add button in UI
<button onClick={resetColumnWidths}>
    Reset Column Widths
</button>
```

## Files to Modify
- `frontend/src/components/ArtifactListView.tsx`

## Testing Checklist
- [ ] Columns can be resized by dragging dividers
- [ ] Widths persist across page refreshes
- [ ] Each artifact type has independent column widths
- [ ] Minimum width prevents columns from disappearing
- [ ] Cursor changes to col-resize on hover
- [ ] Reset button restores defaults
- [ ] Works for all artifact types (needs, use_cases, requirements, etc.)

## Future Enhancements
- Double-click divider to auto-fit column to content
- Shift+drag to resize all columns proportionally
- Column reordering (drag column headers)
