# Component Enhancement: Tags, Lifecycle, and Project Association

## Overview
Implemented Option 4 (Hybrid Approach) for component management, adding flexible tagging, lifecycle tracking, and optional project association.

## New Fields

### 1. **Tags** (List of strings)
- **Purpose**: Flexible categorization using multiple tags
- **Storage**: JSON array stored as string in database
- **Examples**: `["TR2", "networking", "critical"]`, `["ADGE-T", "legacy", "hardware"]`
- **Use Cases**:
  - Project association: `TR2`, `ADGE-T`, `TR1`
  - Categories: `networking`, `storage`, `compute`
  - Priority: `critical`, `important`, `optional`
  - Technology: `cloud-ready`, `on-prem`, `hybrid`

### 2. **Lifecycle** (String enum)
- **Purpose**: Track component lifecycle stage
- **Values**: `Active`, `Legacy`, `Planned`, `Deprecated`
- **Default**: `Active`
- **Use Cases**:
  - `Active`: Currently deployed and in use
  - `Legacy`: Still in use but being phased out
  - `Planned`: Future component not yet deployed
  - `Deprecated`: No longer in use

### 3. **Project ID** (Optional string)
- **Purpose**: Associate component with a specific project
- **Type**: Foreign key to projects table
- **Use Cases**:
  - Project-specific components
  - Track component ownership
  - Filter components by project

## Implementation Details

### Backend Changes

#### Database Model (`app/db/models/component.py`)
```python
tags = Column(String, nullable=True)  # JSON array
lifecycle = Column(String, nullable=True, default='Active')
project_id = Column(String, ForeignKey('projects.id'), nullable=True)
```

#### Schemas (`app/schemas/component.py`)
- `ComponentCreate`: Added tags, lifecycle, project_id
- `ComponentUpdate`: Added tags, lifecycle, project_id
- `ComponentOut`: Added tags, lifecycle, project_id

#### API Endpoints (`app/api/v1/endpoints/component.py`)
- JSON serialization/deserialization for tags
- Proper handling of lifecycle and project_id in CRUD operations

### Migration
- Script: `migrate_add_component_tags_lifecycle.py`
- Adds three new columns to components table
- Sets default values for existing rows

## Usage Examples

### Creating a Component with Tags
```json
{
  "name": "CRC",
  "type": "Hardware",
  "description": "Central Router Component",
  "tags": ["TR2", "networking", "critical"],
  "lifecycle": "Active",
  "project_id": "project-uuid-here"
}
```

### Tracking Component Evolution
Instead of creating:
- `CRC - ADGE-T`
- `CRC - TR1`
- `CRC - TR2`

Now create one component:
```json
{
  "name": "CRC",
  "type": "Hardware",
  "tags": ["TR2", "current"],
  "lifecycle": "Active"
}
```

And mark the old version:
```json
{
  "name": "CRC",
  "type": "Hardware",
  "tags": ["TR1", "legacy"],
  "lifecycle": "Legacy"
}
```

## Next Steps (Frontend)
1. Add tag input with autocomplete (Jira-style)
2. Add lifecycle dropdown selector
3. Add project selector (optional)
4. Implement tag-based filtering
5. Add tag badges in component list
6. Show lifecycle status with color coding

## Benefits
- **Flexibility**: Tag components any way you want
- **Clarity**: Clear lifecycle stages without confusion with artifact status
- **Traceability**: Track component evolution across projects
- **Filtering**: Easy to filter by tags, lifecycle, or project
- **No Duplication**: Single component with tags instead of multiple entries
