# Requirements Document

## Introduction

This specification defines the implementation of a group layer between Modules and Features in the UBAC (User-Based Access Control) Tree system. The group layer provides better organization and hierarchy for managing permissions and access control by introducing an intermediate grouping mechanism.

## Glossary

- **UBAC_System**: The User-Based Access Control system that manages permissions through a hierarchical tree structure
- **Module**: Top-level organizational unit in the UBAC hierarchy
- **Group**: Intermediate organizational unit that sits between modules and features
- **Feature**: Functional capability within a group or module
- **Action**: Specific operation that can be performed within a feature
- **Legacy_Structure**: The existing module → feature → action hierarchy without groups
- **New_Structure**: The enhanced module → group → feature → action hierarchy
- **Ungrouped_Features**: Features that exist directly under a module without being assigned to a group

## Requirements

### Requirement 1: Data Structure Support

**User Story:** As a system architect, I want the UBAC tree to support both new grouped and legacy ungrouped data structures, so that existing implementations continue to work while new implementations can benefit from improved organization.

#### Acceptance Criteria

1. WHEN the API returns data with `module.groups[]` structure, THE UBAC_System SHALL render the hierarchical tree with groups between modules and features
2. WHEN the API returns data with legacy `module.features[]` structure, THE UBAC_System SHALL render the tree using the original module → feature → action hierarchy
3. WHEN the API returns data with both `module.groups[]` and `module.ungrouped_features[]`, THE UBAC_System SHALL render both grouped and ungrouped features appropriately
4. THE UBAC_System SHALL handle the `group_name` field from API responses correctly
5. WHEN API response includes totals (`total_modules`, `total_groups`, `total_features`, `total_actions`), THE UBAC_System SHALL use these values for statistics display

### Requirement 2: Group Management Operations

**User Story:** As an administrator, I want to create, edit, and delete groups within modules, so that I can organize features into logical groupings.

#### Acceptance Criteria

1. WHEN creating a new group, THE UBAC_System SHALL send POST request to `/admin/create_group` with `{module_id, name}` payload
2. WHEN updating a group, THE UBAC_System SHALL send PATCH request to `/admin/update_group` with `{group_id, name, module_id?}` payload
3. WHEN deleting groups, THE UBAC_System SHALL send DELETE request to `/admin/delete_groups` with `{group_ids: [...]}` payload
4. WHEN a group has assigned features, THE UBAC_System SHALL prevent group deletion and display appropriate warning
5. WHEN group operations complete successfully, THE UBAC_System SHALL refresh the tree data and display success notification

### Requirement 3: User Interface Enhancements

**User Story:** As a user, I want to see groups visually distinguished in the UBAC tree interface, so that I can easily understand the organizational hierarchy.

#### Acceptance Criteria

1. WHEN displaying groups in the tree view, THE UBAC_System SHALL render group nodes with blue styling (`bg-blue-50`, `border-blue-200`, `text-blue-800`)
2. WHEN hovering over group nodes, THE UBAC_System SHALL apply hover effects (`hover:bg-blue-100`, `hover:border-blue-300`, `hover:text-blue-900`)
3. WHEN group names are long, THE UBAC_System SHALL display truncated text with full name in tooltip
4. THE UBAC_System SHALL maintain visual hierarchy with proper connectors between modules, groups, features, and actions
5. WHEN displaying the tree, THE UBAC_System SHALL show expand/collapse functionality for groups with many features

### Requirement 4: Modal and Form Integration

**User Story:** As an administrator, I want to select groups when creating or editing features, so that I can organize features within appropriate groups.

#### Acceptance Criteria

1. WHEN opening the create modal, THE UBAC_System SHALL include "Group" as an option in the type selector
2. WHEN creating a group, THE UBAC_System SHALL require module selection and validate the form accordingly
3. WHEN creating a feature, THE UBAC_System SHALL provide optional group selection dropdown populated with groups from the selected module
4. WHEN editing a group, THE UBAC_System SHALL pre-populate the form with current group name and module selection
5. WHEN no group is selected for a feature, THE UBAC_System SHALL create the feature as an ungrouped feature under the module

### Requirement 5: Statistics and Search Enhancement

**User Story:** As a user, I want to see accurate statistics including group counts and be able to search across all hierarchy levels, so that I can quickly find and understand the system structure.

#### Acceptance Criteria

1. WHEN displaying statistics, THE UBAC_System SHALL show counts for modules, groups, features, and actions
2. WHEN API provides total counts, THE UBAC_System SHALL use API totals; otherwise calculate from data
3. WHEN searching, THE UBAC_System SHALL include group names in search functionality
4. WHEN search matches a group name, THE UBAC_System SHALL display the matching module and group in results
5. THE UBAC_System SHALL update search placeholder text to include "groups" in the searchable items list

### Requirement 6: Backward Compatibility

**User Story:** As a system maintainer, I want existing UBAC tree functionality to continue working unchanged, so that current users experience no disruption during the upgrade.

#### Acceptance Criteria

1. WHEN processing legacy data structure (`module.features[]`), THE UBAC_System SHALL render the tree exactly as before
2. WHEN legacy data is present, THE UBAC_System SHALL maintain all existing CRUD operations for modules, features, and actions
3. WHEN mixed data structures are present, THE UBAC_System SHALL handle both grouped and legacy features within the same module
4. THE UBAC_System SHALL preserve all existing keyboard shortcuts, UI interactions, and visual styling for non-group elements
5. WHEN API endpoints return legacy responses, THE UBAC_System SHALL continue to function without errors

### Requirement 7: ApexTree Visualization Support

**User Story:** As a user, I want the ApexTree visualization to display groups with appropriate styling and interactions, so that I can visualize the hierarchical structure in the tree chart view.

#### Acceptance Criteria

1. WHEN rendering the ApexTree visualization, THE UBAC_System SHALL include group nodes between modules and features
2. WHEN displaying group nodes in ApexTree, THE UBAC_System SHALL apply blue background color (`#3b82f6`) to distinguish groups
3. WHEN group nodes are clicked, THE UBAC_System SHALL provide edit and delete options where appropriate
4. THE UBAC_System SHALL maintain proper node spacing and hierarchy visualization in the ApexTree layout
5. WHEN filtering the tree view, THE UBAC_System SHALL include groups in the filter logic and maintain visual hierarchy

### Requirement 8: Error Handling and Validation

**User Story:** As an administrator, I want clear error messages and validation when working with groups, so that I can quickly resolve any issues.

#### Acceptance Criteria

1. WHEN group creation fails, THE UBAC_System SHALL display specific error message from API response
2. WHEN attempting to delete a group with features, THE UBAC_System SHALL prevent deletion and show warning message
3. WHEN form validation fails, THE UBAC_System SHALL highlight invalid fields and show validation messages
4. WHEN API requests timeout or fail, THE UBAC_System SHALL show appropriate error notifications
5. THE UBAC_System SHALL validate required fields (module selection for groups, name fields) before allowing form submission

## Notes

- This implementation maintains full backward compatibility with existing UBAC tree functionality
- The group layer is optional - features can exist directly under modules (ungrouped) or within groups
- All existing API endpoints for modules, features, and actions remain unchanged
- New group-related API endpoints follow the established patterns and conventions