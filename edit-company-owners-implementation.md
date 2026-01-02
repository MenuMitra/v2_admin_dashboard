# Edit Company Owners & Super Owners Implementation

## Summary
Successfully implemented owners and super owners dropdowns in EditCompany.jsx component as requested. The implementation fetches owners using the `listview_owner` API and super owners using the `listview_super_owner` API, loads existing selections from the company data, and includes the updated selections in the update company API payload.

## Changes Made

### 1. Added Imports and Dependencies
- Added `MultiSelectDropdown` component import for the dropdown functionality

### 2. Added State Management
- Added `allOwners` state to store fetched owners
- Added `allSuperOwners` state to store fetched super owners
- Added `selected_owners` field to `companyData` state
- Added `selected_super_owners` field to `companyData` state

### 3. Added API Integration Functions
- Created `fetchOwners()` function that calls `/common/listview_owner/{user_id}` API
- Created `fetchSuperOwners()` function that calls `/admin/listview_super_owner` API
- Both functions use `useCallback` for optimization and include proper error handling
- Updated `fetchCompanyDetails()` to load existing selected owners/super owners from company data

### 4. Updated Data Loading
- Modified `useEffect` to fetch owners and superowners when component mounts
- Updated `fetchCompanyDetails()` to include `selected_owners` and `selected_super_owners` from API response
- Added dependency array to ensure data is fetched when `adminData.user_id` is available

### 5. Added Dropdown Components
- Added "Assign Owners & Super Owners" section between document fields and company contacts
- Implemented two `MultiSelectDropdown` components:
  - **Owners Dropdown**: 
    - `displayKey: "name"`
    - `valueKey: "user_id"`
    - `searchKeys: ["name", "mobile", "email"]`
  - **Super Owners Dropdown**:
    - `displayKey: "name"`
    - `valueKey: "super_owner_id"`
    - `searchKeys: ["name", "mobile", "email"]`
- Both dropdowns support multi-selection and search functionality
- Pre-populate dropdowns with existing selections from company data

### 6. Updated API Payload
- Added `selected_owners` array to update company payload
- Added `selected_super_owners` array to update company payload
- Maintains existing payload structure while adding new fields

## API Integration Details

### View Company API
- **Endpoint**: `POST /admin/view_company`
- **Payload**: `{ company_id: Number, user_id: 440 }`
- **Response**: Company data including existing `selected_owners` and `selected_super_owners`
- **Usage**: Loads existing company data and pre-selected owners/super owners

### List Owners API
- **Endpoint**: `GET /common/listview_owner/{user_id}`
- **Parameters**: Uses `adminData.user_id` in URL path
- **Response**: Array of owner objects with `user_id`, `name`, `mobile`, `email` fields
- **Usage**: Fetched on component mount to populate owners dropdown

### List Super Owners API
- **Endpoint**: `POST /admin/listview_super_owner`
- **Payload**: `{ user_id: adminData.user_id, app_source: 'admin_app' }`
- **Response**: `{ super_owners: [...] }` with array of super owner objects
- **Usage**: Fetched on component mount to populate super owners dropdown

### Update Company API
- **Existing Endpoint**: `POST /admin/update_company`
- **New Fields Added**: 
  - `selected_owners: [array of owner user_ids]`
  - `selected_super_owners: [array of super_owner_ids]`
- **Integration**: Selected IDs from dropdowns are included in payload

## Component Structure
```
Edit Company Form:
├── Company Information
├── Document Fields
├── Assign Owners & Super Owners ← NEW SECTION
│   ├── Select Owners (MultiSelectDropdown)
│   └── Select Super Owners (MultiSelectDropdown)
├── Company Contacts
└── Company Owners
```

## Data Flow
1. **Component Mount**: 
   - Fetch company details (including existing selections)
   - Fetch available owners list
   - Fetch available super owners list

2. **Data Loading**:
   - Pre-populate dropdowns with existing selections
   - Display available options for selection

3. **User Interaction**:
   - User can add/remove owners and super owners
   - Changes are tracked in component state

4. **Form Submission**:
   - Updated selections are included in API payload
   - Company is updated with new owner/super owner assignments

## Files Modified
1. `src/components/Companies/EditCompany.jsx` - Main implementation

## Files Created
1. `test-edit-company-owners.html` - Test file for verification
2. `edit-company-owners-implementation.md` - This documentation

## Testing
- No syntax errors detected
- Component imports correctly
- API payload structure updated correctly
- Dropdowns support multi-selection and search
- Existing selections are preserved and displayed

## Key Features
- **Preserve Existing Data**: Loads and displays currently assigned owners/super owners
- **Multi-Selection**: Users can select multiple owners and super owners
- **Search Functionality**: Both dropdowns include search by name, mobile, and email
- **Real-time Updates**: Changes are immediately reflected in component state
- **Consistent Styling**: Matches existing form components and layout
- **Error Handling**: Proper error handling for API failures

## Usage Flow
1. User opens Edit Company form for existing company
2. System loads company data including existing owner/super owner assignments
3. Owners and super owners dropdowns populate with available options
4. Existing selections are pre-selected in the dropdowns
5. User can modify selections (add/remove owners and super owners)
6. User saves changes
7. Updated owner and super owner assignments are sent to update company API
8. Company is updated with new assignments

The implementation maintains backward compatibility while adding the new functionality as requested. The dropdowns use the same styling and behavior as other multi-select components in the application, and existing company data is preserved during the editing process.