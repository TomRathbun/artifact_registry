# Apply Management View Improvements to Sites, Components, and Diagrams

## Overview
Apply the same improvements made to People and Areas management views to Sites, Components, and Diagrams.

## Improvements to Apply

### 1. Modal Edit Dialog
- Convert inline edit forms to modal dialogs
- Prevents scrolling issues
- Better focus and UX
- Click backdrop or Cancel to close

### 2. Column Filters
Add filter dropdowns to all relevant columns:
- **Sites**: Name, Description
- **Components**: Name, Type, Description  
- **Diagrams**: Name, Type, Description

### 3. Sorting
Add click-to-sort functionality on all filterable columns

### 4. Clear All Filters Button
- Appears when filters or sorting are active
- Clears all filters and sorting with one click
- Uses slate color for consistency

### 5. Click-Outside to Close
- Filter dropdowns close when clicking outside
- Dropdowns don't close when clicking checkboxes inside

## Implementation Steps

### For Each View (Sites, Components, Diagrams):

1. **Add useEffect for click-outside handler** (if not already present)
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

2. **Add clearAllFilters function**
```typescript
const clearAllFilters = () => {
    setColumnFilters({});
    setSortConfig({ key: null, direction: null });
};
```

3. **Update getFilteredAndSortedItems** to handle any special fields (like arrays)

4. **Update getUniqueValuesForColumn** to handle special field types

5. **Convert edit form to modal**
Replace:
```tsx
{(isCreating || isEditing) && renderForm()}
```

With:
```tsx
{(isCreating || isEditing) && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
         onClick={() => { setIsCreating(false); setIsEditing(null); setFormData({}); }}>
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" 
             onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4">
                <h3 className="text-lg font-semibold">
                    {isCreating ? `Add ${type}` : `Edit ${type}`}
                </h3>
            </div>
            <div className="p-6">
                {renderForm()}
            </div>
        </div>
    </div>
)}
```

6. **Add Clear All Filters button to action bar**
```tsx
{(sortConfig.key || Object.keys(columnFilters).length > 0) && (
    <button
        onClick={clearAllFilters}
        className="px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-2"
        title="Clear all filters and sorting"
    >
        <Filter className="w-4 h-4" />
        Clear Filters
    </button>
)}
```

7. **Convert table/list headers to filterable columns**

For each column, use this pattern:
```tsx
<div className="flex items-center gap-1 select-none relative">
    <div
        className="flex items-center gap-1 cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded"
        onClick={(e) => {
            e.stopPropagation();
            setActiveFilterDropdown(activeFilterDropdown === 'columnKey' ? null : 'columnKey');
        }}
    >
        <Filter className={`w-3 h-3 ${columnFilters['columnKey']?.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
        {columnFilters['columnKey']?.length > 0 && (
            <span className="text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {columnFilters['columnKey'].length}
            </span>
        )}
    </div>
    <div className="cursor-pointer hover:bg-slate-100 flex-1 flex items-center gap-1" onClick={() => handleSort('columnKey')}>
        Column Label
        {sortConfig.key === 'columnKey' && (
            <span className="text-slate-400">
                {sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            </span>
        )}
    </div>
    
    {/* Filter Dropdown */}
    {activeFilterDropdown === 'columnKey' && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto" 
             onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-50 p-2 border-b flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">Filter by Column Label</span>
                {columnFilters['columnKey']?.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            clearColumnFilter('columnKey');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                    >
                        Clear
                    </button>
                )}
            </div>
            <div className="p-1">
                {getUniqueValuesForColumn('columnKey').map((value: string) => (
                    <label key={value} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 cursor-pointer rounded">
                        <input
                            type="checkbox"
                            checked={columnFilters['columnKey']?.includes(value) || false}
                            onChange={() => toggleFilter('columnKey', value)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm truncate">{value}</span>
                    </label>
                ))}
            </div>
        </div>
    )}
</div>
```

## Files to Modify

- `frontend/src/components/SiteManagementView.tsx` (if exists, or create)
- `frontend/src/components/ComponentManagementView.tsx` (if exists, or create)
- `frontend/src/components/DiagramManagementView.tsx` (if exists, or create)

Or update the existing views if they're in different files.

## Testing Checklist

For each view:
- [ ] Modal opens for create/edit
- [ ] Modal closes on backdrop click or Cancel
- [ ] All columns have filter icons
- [ ] Filter dropdowns stay open when clicking checkboxes
- [ ] Filter dropdowns close when clicking outside
- [ ] Sorting works on all columns
- [ ] Clear All Filters button appears when needed
- [ ] Clear All Filters resets everything
- [ ] Bulk delete works with checkboxes
- [ ] Filtered items can be selected and deleted

## Reference Implementation

See `ManagementView.tsx` for the complete People implementation with all features.
