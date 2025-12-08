# Component Manager Update Plan

## Special Requirements

### Two Separate Modals:
1. **Component Edit/Create Modal**
   - Should close on Save (like other views)
   - Standard modal behavior
   
2. **Link Management Modal**
   - Should have a separate Close button
   - Does NOT close on Save (user may add multiple links)
   - Only closes when user clicks Close button

### Icon Consistency:
- Keep `Pencil` icon for edit button (not `Edit` or `Edit2`)

## Current State Analysis

### State Variables:
- `isCreating` - for component create/edit
- `editingId` - which component is being edited
- `managingLinksId` - which component's links are being managed
- `formData` - component form data
- `linkData` - link form data
- Filter states: `filterName`, `filterType`, `filterLifecycle`

### Features to Add:

1. **Column Filters** (like People/Areas/Sites)
   - Name filter
   - Type filter  
   - Description filter
   - Lifecycle filter

2. **Sorting** on all columns

3. **Clear All Filters** button

4. **Bulk Selection** with checkboxes

5. **Bulk Delete** functionality

6. **Modal Dialogs**:
   - Component Edit/Create modal (closes on save)
   - Link Management modal (separate close button, doesn't close on save)

7. **Click-outside to close** filter dropdowns

8. **Confirmation Modal** for deletes

9. **Grid Layout** (instead of table)

## Implementation Steps

### 1. Add Missing Imports
```typescript
import { useState, useEffect, useMemo } from 'react';
import { ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
```

### 2. Add New State Variables
```typescript
const [selectedItems, setSelectedItems] = useState<string[]>([]);
const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ 
    key: null, direction: null 
});
const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: false
});
```

### 3. Replace Simple Filters with Column Filters
Convert `filterName`, `filterType`, `filterLifecycle` to use the `columnFilters` state object.

### 4. Add Helper Functions
- `getFilteredAndSortedItems()`
- `getUniqueValuesForColumn(key)`
- `toggleFilter(key, value)`
- `clearColumnFilter(key)`
- `clearAllFilters()`
- `handleSort(key)`
- `handleBulkDelete()`

### 5. Add Click-Outside Handler
```typescript
useEffect(() => {
    const handleClickOutside = () => {
        if (activeFilterDropdown) {
            setActiveFilterDropdown(null);
        }
    };
    if (activeFilterDropdown) {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }
}, [activeFilterDropdown]);
```

### 6. Update Component Edit Modal
- Wrap in modal dialog
- Closes on save (add `setIsCreating(false)` to mutation success)
- Standard cancel button

### 7. Update Link Management Modal
- Wrap in modal dialog
- **Does NOT close on save** (remove any close logic from link creation success)
- Add explicit Close button at bottom
- Close button sets `setManagingLinksId(null)`

### 8. Convert to Grid Layout
Replace table with grid layout similar to People/Areas/Sites:
```tsx
<div className="grid gap-2 p-3" style={{ gridTemplateColumns: 'auto 200px 150px 1fr 120px 100px' }}>
    {/* Checkbox, Name, Type, Description, Lifecycle, Actions */}
</div>
```

### 9. Add Filter Columns
Each column header should have:
- Filter icon with badge
- Sort icon
- Filter dropdown (click-outside to close)

### 10. Add Action Bar
```tsx
<div className="flex gap-2">
    {/* Clear All Filters */}
    {/* Bulk Delete */}
    {/* Add Component */}
</div>
```

## Link Management Modal Structure

```tsx
{managingLinksId && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" 
             onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4">
                <h3 className="text-lg font-semibold">Manage Component Links</h3>
            </div>
            <div className="p-6">
                {/* Link form - does NOT close on save */}
                {/* Existing links list */}
                
                {/* Close button at bottom */}
                <div className="flex justify-end pt-4 border-t mt-4">
                    <button
                        onClick={() => setManagingLinksId(null)}
                        className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
)}
```

## Testing Checklist

- [ ] Component create modal opens and closes on save
- [ ] Component edit modal opens and closes on save
- [ ] Link management modal opens
- [ ] Link management modal does NOT close on adding link
- [ ] Link management modal closes on Close button
- [ ] All column filters work
- [ ] Sorting works on all columns
- [ ] Clear All Filters works
- [ ] Bulk selection works
- [ ] Bulk delete works with confirmation
- [ ] Pencil icon is used for edit
- [ ] Filter dropdowns close on outside click
- [ ] Filter dropdowns stay open when clicking checkboxes

## Notes

- Keep `Pencil` icon (not `Edit`)
- Link modal is special - doesn't auto-close
- Component has more columns than other views
- May need wider grid template
