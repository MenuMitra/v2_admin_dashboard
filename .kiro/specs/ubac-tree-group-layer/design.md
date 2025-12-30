# Design Document: UBAC Tree Group Layer

## Overview

This design implements a group layer between Modules and Features in the UBAC (User-Based Access Control) Tree system. The implementation provides enhanced organizational capabilities while maintaining full backward compatibility with existing data structures and functionality.

The design supports three data structure patterns:
1. **New Grouped Structure**: `module.groups[].features[]` with `module.ungrouped_features[]`
2. **Legacy Structure**: `module.features[]` (direct features under modules)
3. **Mixed Structure**: Combination of grouped and legacy features within the same system

## Architecture

### Component Architecture

```
UBACTree Components
├── UBACTree.jsx (Traditional tree view)
├── UBACTreeApexChart.jsx (Visualization tree view)
└── useUbacTree.js (Data fetching hook)
```

### Data Flow

```
API Response → useUbacTree Hook → Component State → Rendering Logic → UI Display
                                      ↓
                              Data Structure Detection
                                      ↓
                         Grouped/Legacy/Mixed Rendering
```

### API Integration

The system integrates with the following API endpoints:

**Existing Endpoints:**
- `GET /admin/ubac_tree` - Fetch tree data
- `POST /admin/create_module` - Create modules
- `POST /admin/create_feature` - Create features (enhanced for groups)
- `POST /admin/create_action` - Create actions
- `PATCH /admin/update_module` - Update modules
- `PATCH /admin/update_feature` - Update features (enhanced for groups)
- `PATCH /admin/update_action` - Update actions
- `DELETE /admin/delete_modules` - Delete modules
- `DELETE /admin/delete_features` - Delete features
- `DELETE /admin/delete_actions` - Delete actions

**New Group Endpoints:**
- `POST /admin/create_group` - Create groups
- `PATCH /admin/update_group` - Update groups
- `DELETE /admin/delete_groups` - Delete groups
- `GET /admin/get_groups?module_id=X` - Fetch groups for module

## Components and Interfaces

### Data Structures

#### API Response Structure
```typescript
interface UBACTreeResponse {
  detail: string;
  total_modules: number;
  total_groups: number;
  total_features: number;
  total_actions: number;
  data: Module[];
}

interface Module {
  module_id: number;
  name: string;
  // New grouped structure
  groups?: Group[];
  ungrouped_features?: Feature[];
  // Legacy structure (fallback)
  features?: Feature[];
}

interface Group {
  group_id: number;
  group_name: string; // Note: API uses group_name, not name
  features: Feature[];
}

interface Feature {
  feature_id: number;
  name: string;
  actions: Action[];
}

interface Action {
  action_id: number;
  name: string;
}
```

#### Component State Structure
```typescript
interface ComponentState {
  // Modal states
  isModalOpen: boolean;
  isEditModalOpen: boolean;
  type: 'module' | 'group' | 'feature' | 'action';
  editType: 'module' | 'group' | 'feature' | 'action';
  
  // Form data
  formName: string;
  selectedModuleId: string;
  selectedGroupId: string;
  selectedFeatureId: string;
  
  // Edit form data
  editId: number | null;
  editFormName: string;
  editSelectedModuleId: string;
  editSelectedGroupId: string;
  editSelectedFeatureId: string;
  
  // Loading states
  loadingSave: boolean;
  editLoadingSave: boolean;
  
  // Data lists
  modulesList: Module[];
  groupsList: Group[];
  featuresList: Feature[];
  
  // UI states
  expandedModules: Record<string, boolean>;
  searchTerm: string;
}
```

### Rendering Functions

#### Group Rendering Function
```typescript
const renderGroups = (groups: Group[], moduleId: number) => {
  // Renders groups with blue styling and hover effects
  // Handles expand/collapse for groups with many features
  // Provides edit/delete buttons with proper validation
}
```

#### Enhanced Feature Rendering
```typescript
const renderFeatures = (features: Feature[], moduleId: number, groupId?: number) => {
  // Enhanced to handle both grouped and ungrouped features
  // Maintains existing expand/collapse functionality
  // Preserves all existing styling and interactions
}
```

#### Module Rendering Enhancement
```typescript
const renderModules = (modules: Module[]) => {
  // Detects data structure (grouped/legacy/mixed)
  // Renders appropriate hierarchy based on structure
  // Maintains backward compatibility for legacy data
}
```

## Data Models

### Data Structure Detection Logic

```typescript
const detectDataStructure = (module: Module) => {
  const hasGroups = module.groups && Array.isArray(module.groups) && module.groups.length > 0;
  const hasLegacyFeatures = !hasGroups && module.features && Array.isArray(module.features) && module.features.length > 0;
  const hasUngroupedFeatures = module.ungrouped_features && Array.isArray(module.ungrouped_features) && module.ungrouped_features.length > 0;
  
  return { hasGroups, hasLegacyFeatures, hasUngroupedFeatures };
};
```

### Statistics Calculation

```typescript
const calculateStatistics = (data: Module[], apiTotals?: Partial<UBACTreeResponse>) => {
  return {
    modules: apiTotals?.total_modules || data.length,
    groups: apiTotals?.total_groups || calculateGroupsCount(data),
    features: apiTotals?.total_features || calculateFeaturesCount(data),
    actions: apiTotals?.total_actions || calculateActionsCount(data)
  };
};
```

### ApexTree Data Transformation

```typescript
const transformUbacDataToTree = (apiResponse: UBACTreeResponse) => {
  // Transforms API data to ApexTree format
  // Handles grouped, ungrouped, and legacy structures
  // Applies appropriate styling for each node type
  // Maintains proper hierarchy and relationships
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Data Structure Rendering Consistency
*For any* API response with `module.groups[]` structure, the rendered tree should display groups between modules and features in the correct hierarchical order
**Validates: Requirements 1.1**

### Property 2: Legacy Structure Compatibility
*For any* API response with legacy `module.features[]` structure, the rendered tree should maintain the original module → feature → action hierarchy without groups
**Validates: Requirements 1.2, 6.1**

### Property 3: Mixed Structure Handling
*For any* module containing both `groups[]` and `ungrouped_features[]`, both grouped and ungrouped features should be rendered appropriately within the same module
**Validates: Requirements 1.3, 6.3**

### Property 4: Group Name Field Mapping
*For any* group data containing `group_name` field, the display should correctly show the group name in the UI
**Validates: Requirements 1.4**

### Property 5: API Totals Usage
*For any* API response containing total counts, the statistics display should use API-provided totals instead of calculated values
**Validates: Requirements 1.5, 5.2**

### Property 6: Group CRUD Operations
*For any* group management operation (create/update/delete), the system should send the correct HTTP request to the appropriate endpoint with proper payload structure
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 7: Group Deletion Validation
*For any* group that has assigned features, deletion attempts should be prevented and appropriate warnings should be displayed
**Validates: Requirements 2.4, 8.2**

### Property 8: Post-Operation Refresh
*For any* successful group operation, the system should refresh tree data and display success notifications
**Validates: Requirements 2.5**

### Property 9: Group Visual Styling
*For any* rendered group node, the element should have blue styling classes (`bg-blue-50`, `border-blue-200`, `text-blue-800`) applied
**Validates: Requirements 3.1**

### Property 10: Group Hover Effects
*For any* group node interaction, hovering should apply hover effect classes (`hover:bg-blue-100`, `hover:border-blue-300`, `hover:text-blue-900`)
**Validates: Requirements 3.2**

### Property 11: Long Group Name Handling
*For any* group with a name longer than the display width, the text should be truncated and full name should be available in tooltip
**Validates: Requirements 3.3**

### Property 12: Visual Hierarchy Maintenance
*For any* rendered tree structure, proper visual connectors should be present between modules, groups, features, and actions
**Validates: Requirements 3.4**

### Property 13: Group Expand/Collapse Functionality
*For any* group containing more than 3 features, expand/collapse functionality should be available and functional
**Validates: Requirements 3.5**

### Property 14: Modal Group Option Availability
*For any* create modal opening, the type selector should include "Group" as a selectable option
**Validates: Requirements 4.1**

### Property 15: Group Creation Form Validation
*For any* group creation attempt without module selection, form validation should prevent submission and show validation messages
**Validates: Requirements 4.2, 8.5**

### Property 16: Feature Group Selection
*For any* feature creation form, an optional group selection dropdown should be available and populated with groups from the selected module
**Validates: Requirements 4.3**

### Property 17: Group Edit Form Pre-population
*For any* group edit operation, the form should be pre-populated with the current group name and module selection
**Validates: Requirements 4.4**

### Property 18: Ungrouped Feature Creation
*For any* feature created without group selection, the feature should be created as an ungrouped feature under the selected module
**Validates: Requirements 4.5**

### Property 19: Statistics Display Completeness
*For any* statistics display, counts for modules, groups, features, and actions should all be visible
**Validates: Requirements 5.1**

### Property 20: Group Search Inclusion
*For any* search operation, group names should be included in the search logic and matching groups should appear in results
**Validates: Requirements 5.3, 5.4**

### Property 21: Search Placeholder Update
*For any* search input field, the placeholder text should include "groups" in the list of searchable items
**Validates: Requirements 5.5**

### Property 22: Legacy CRUD Operation Preservation
*For any* CRUD operation on legacy data structures, the operation should function exactly as it did before group implementation
**Validates: Requirements 6.2, 6.5**

### Property 23: Non-Group Element Styling Preservation
*For any* non-group UI element, existing styling and interactions should remain unchanged from the original implementation
**Validates: Requirements 6.4**

### Property 24: ApexTree Group Node Integration
*For any* ApexTree visualization rendering, group nodes should appear between modules and features with blue background color (`#3b82f6`)
**Validates: Requirements 7.1, 7.2**

### Property 25: ApexTree Group Interactions
*For any* group node in ApexTree, clicking should provide appropriate edit and delete options based on group state
**Validates: Requirements 7.3**

### Property 26: ApexTree Layout Preservation
*For any* ApexTree rendering, proper node spacing and hierarchy visualization should be maintained with group nodes included
**Validates: Requirements 7.4**

### Property 27: ApexTree Filter Group Inclusion
*For any* ApexTree filter operation, groups should be included in the filter logic and results
**Validates: Requirements 7.5**

### Property 28: API Error Message Display
*For any* failed group operation, specific error messages from API responses should be displayed to the user
**Validates: Requirements 8.1, 8.4**

### Property 29: Form Validation UI Feedback
*For any* form validation failure, invalid fields should be highlighted and validation messages should be displayed
**Validates: Requirements 8.3**

## Error Handling

### API Error Handling
- Network timeouts and failures display appropriate error notifications
- API error responses are parsed and specific error messages are shown
- Failed operations do not leave the UI in an inconsistent state

### Form Validation
- Required field validation prevents form submission
- Invalid field highlighting provides clear visual feedback
- Validation messages are specific and actionable

### Data Structure Error Handling
- Malformed API responses are handled gracefully
- Missing or invalid data fields have fallback values
- Mixed data structures are processed without errors

## Testing Strategy

### Dual Testing Approach
The implementation uses both unit testing and property-based testing for comprehensive coverage:

**Unit Tests:**
- Specific examples of data structure handling
- Edge cases for form validation
- Error condition scenarios
- Integration points between components

**Property-Based Tests:**
- Universal properties across all data structures
- CRUD operation correctness across all inputs
- UI rendering consistency for all data combinations
- Search and filter functionality across all content types

### Property-Based Testing Configuration
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: **Feature: ubac-tree-group-layer, Property {number}: {property_text}**
- Tests use React Testing Library with property-based testing library (fast-check)

### Test Coverage Areas
1. **Data Structure Handling**: Tests for grouped, legacy, and mixed structures
2. **CRUD Operations**: Tests for all group management operations
3. **UI Rendering**: Tests for visual styling and hierarchy
4. **Form Interactions**: Tests for modal and form functionality
5. **Search and Statistics**: Tests for enhanced search and statistics
6. **Backward Compatibility**: Tests ensuring legacy functionality preservation
7. **Error Handling**: Tests for validation and error scenarios

The testing strategy ensures that both specific examples work correctly (unit tests) and that universal properties hold across all possible inputs (property tests), providing confidence in the system's correctness and reliability.