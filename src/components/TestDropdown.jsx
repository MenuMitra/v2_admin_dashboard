import React, { useState } from 'react';
import MultiSelectDropdown from './common/MultiSelectDropdown';

// Test component to verify dropdown scrolling with many options
const TestDropdown = () => {
  const [selectedOutlets, setSelectedOutlets] = useState([]);

  // Generate many test outlets to test scrolling
  const testOutlets = Array.from({ length: 50 }, (_, index) => ({
    outlet_name: `Test Outlet ${index + 1} - Long Name to Test Truncation and Scrolling Behavior`,
    outlet_id: `outlet_${index + 1}`,
  }));

  const handleOutletChange = (newOutletIds) => {
    setSelectedOutlets(newOutletIds);
    console.log('Selected outlets:', newOutletIds);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Dropdown Scrolling Test</h2>
      <div className="space-y-4">
        <MultiSelectDropdown
          label="Select Outlets (Test)"
          options={testOutlets}
          selectedValues={selectedOutlets}
          onChange={handleOutletChange}
          displayKey="outlet_name"
          valueKey="outlet_id"
          searchKeys={["outlet_name"]}
          placeholder="Select outlets"
          searchPlaceholder="Search outlets..."
          className="rounded-3xl"
        />
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Selected Outlets:</h3>
          <p>{selectedOutlets.length} outlets selected</p>
          {selectedOutlets.length > 0 && (
            <ul className="mt-2 text-sm">
              {selectedOutlets.map(id => {
                const outlet = testOutlets.find(o => o.outlet_id === id);
                return <li key={id}>• {outlet?.outlet_name}</li>;
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestDropdown;