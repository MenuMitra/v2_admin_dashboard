# MenuMitra Admin Dashboard - Cursor IDE Rules

## Project Structure
```
menumitra_v2_admin_dashboard/
├── .cursor/                  # Cursor IDE specific configurations
│   ├── rules.md             # This file
│   └── settings.json        # Cursor settings
├── src/
│   ├── assets/              # Static assets (images, fonts, etc.)
│   ├── components/          # React components
│   ├── contexts/            # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Library configurations
│   │   └── react-query/    # React Query configurations
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles
└── public/                 # Public assets
```

## Critical Rules ⚠️

### 1. API Authentication
```javascript
// ❌ WRONG - Don't add 'Bearer' prefix
headers: {
  Authorization: `Bearer ${getToken()}`  // Creates "Bearer Bearer token..."
}

// ✅ CORRECT - getToken() already includes 'Bearer'
headers: {
  Authorization: getToken()  // Correctly formatted "Bearer token..."
}
```

### 2. API Response Handling
```javascript
// ✅ CORRECT Pattern
try {
  const response = await api.post('/endpoint', data);
  toastController.success(response.data.detail);
} catch (error) {
  toastController.error(error.response?.data?.detail || 'Operation failed');
}
```

### 3. Data Table Selection
```javascript
// ✅ CORRECT Pattern
const normalizedData = useMemo(() => {
  return data.map(item => ({
    ...item,
    id: item.entity_id  // Normalize ID field for selection
  }));
}, [data]);
```

## Code Style Guidelines

### Component Structure
```javascript
// ✅ CORRECT Import Order
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Third-party libraries
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Components
import DataTable from '../common/DataTable';
// Hooks
import { useAuth } from '../../hooks/useAuth';
// Utils
import { toastController } from '../../utils/toastController';
```

### Hook Usage
```javascript
// ✅ CORRECT Custom Hook Pattern
const { data, isLoading, error, mutate } = useCustomHook({
  onSuccess: () => {
    toastController.success('Operation successful');
  },
  onError: (err) => {
    toastController.error(err.response?.data?.detail || 'Operation failed');
  }
});
```

## Common Patterns

### 1. Data Table Implementation
```javascript
<DataTable
  data={normalizedData}
  idField="id"
  enableSelection={true}
  onSelectionChange={setSelectedItems}
  selectedItems={selectedItems}
  onBulkAction={handleBulkAction}
/>
```

### 2. Form Handling
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    await submitData(formData);
    resetForm();
    toastController.success('Form submitted successfully');
  } catch (error) {
    toastController.error(error.response?.data?.detail);
  } finally {
    setIsLoading(false);
  }
};
```

### 3. API Integration
```javascript
const customHook = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        'https://men4u.xyz/v2/endpoint',
        payload,
        {
          headers: {
            Authorization: getToken()  // ✅ CORRECT
          }
        }
      );
      return response.data;
    }
  });
};
```

## Best Practices

### 1. State Management
- Use React Query for server state
- Use Context for global UI state
- Use local state for component-specific state

### 2. Error Handling
- Always use try-catch for async operations
- Use error boundaries for component errors
- Implement proper loading states

### 3. Performance
- Implement proper memoization with useMemo and useCallback
- Use virtualization for long lists
- Optimize re-renders

### 4. Security
- Never expose sensitive data in logs
- Use environment variables for sensitive values
- Implement proper role-based access control

## Cursor IDE Specific

### 1. Snippets
Use these common snippets in Cursor:

```javascript
// Component Template
const Component = () => {
  return (
    <div>
      Component
    </div>
  );
};

// Hook Template
const useCustomHook = () => {
  return {
    data: null,
    isLoading: false,
    error: null
  };
};
```

### 2. Recommended Extensions
- ESLint
- Prettier
- TailwindCSS IntelliSense

### 3. File Naming
- Components: PascalCase.jsx
- Hooks: useCustomHook.js
- Utils: camelCase.js

## Troubleshooting

### Common Issues
1. Token Issues
   - Check if token is properly formatted
   - Verify token expiration
   - Don't add 'Bearer' prefix manually

2. API Errors
   - Check network tab for request/response
   - Verify payload structure
   - Check authorization headers

3. Component Issues
   - Check prop types
   - Verify data structure
   - Check loading states

## Updates
Last Updated: 2024-03-20
Version: 1.0.0

Note: Keep this file updated with new patterns and rules as they are established. 