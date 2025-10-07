import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRotate } from "@fortawesome/free-solid-svg-icons";
import useUbacTree from "../../lib/react-query/hooks/useUbacTree";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";
import Modal from "../common/Modal";
import { toastController } from "../../utils/toastController";

const UBACTree = () => {
  const { data, isLoading, refetchUbacTree } = useUbacTree();
  const { getToken } = useAuth();
  const { BASE_URL } = API_CONFIG;

  // Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newActionName, setNewActionName] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] = useState("");
  const [addLoadingSave, setAddLoadingSave] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editType] = useState("module"); // module | feature | action
  const [editId, setEditId] = useState(null);
  const [editFormName, setEditFormName] = useState("");
  const [editSelectedModuleId, setEditSelectedModuleId] = useState("");
  const [editSelectedFeatureId, setEditSelectedFeatureId] = useState("");
  const [editLoadingSave, setEditLoadingSave] = useState(false);

  // Helper function to safely get modules array
  const getModulesArray = () => {
    const modules = data?.data || [];
    return Array.isArray(modules) ? modules : [];
  };


  // API functions for CRUD operations
  const deleteItem = async (type, id) => {
    try {
      const token = getToken() || localStorage.getItem("token");
      const headers = token
        ? { Authorization: token, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };

      await fetch(`${BASE_URL}/admin/${type}/${id}`, {
        method: "DELETE",
        headers,
      });

      await refetchUbacTree();
      toastController.showSuccessToast(`${type} deleted successfully!`);
    } catch (err) {
      toastController.showErrorToast(`Failed to delete ${type}.`);
      console.error(`Error deleting ${type}:`, err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoadingSave(true);
    try {
      const token = getToken() || localStorage.getItem("token");
      const headers = token
        ? { Authorization: token, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };

      let endpoint = "";
      let payload = {};

      if (newModuleName) {
        endpoint = `${BASE_URL}/admin/module`;
        payload = { name: newModuleName };
      } else if (selectedModuleId && newFeatureName) {
        endpoint = `${BASE_URL}/admin/feature`;
        payload = { name: newFeatureName, module_id: selectedModuleId };
      } else if (selectedFeatureId && newActionName) {
        endpoint = `${BASE_URL}/admin/action`;
        payload = { name: newActionName, feature_id: selectedFeatureId };
      } else {
        toastController.showErrorToast("Please fill in the required fields.");
        setAddLoadingSave(false);
        return;
      }

      await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      toastController.showSuccessToast("Item added successfully!");
      refetchUbacTree();
      setIsModalOpen(false);
      setNewModuleName("");
      setNewFeatureName("");
      setNewActionName("");
      setSelectedModuleId("");
      setSelectedFeatureId("");
    } catch (err) {
      toastController.showErrorToast("Failed to add item.");
      console.error("Error adding item:", err);
    } finally {
      setAddLoadingSave(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoadingSave(true);
    try {
      const token = getToken() || localStorage.getItem("token");
      const headers = token
        ? { Authorization: token, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };

      let endpoint = `${BASE_URL}/admin/${editType}/${editId}`;
      let payload = { name: editFormName };

      if (editType === 'feature' && editSelectedModuleId) {
        payload.module_id = editSelectedModuleId;
      } else if (editType === 'action' && editSelectedFeatureId) {
        payload.feature_id = editSelectedFeatureId;
      }

      await fetch(endpoint, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      toastController.showSuccessToast("Item updated successfully!");
      refetchUbacTree();
      setIsEditModalOpen(false);
      setEditFormName("");
      setEditId(null);
      setEditSelectedModuleId("");
      setEditSelectedFeatureId("");
    } catch (err) {
      toastController.showErrorToast("Failed to update item.");
      console.error("Error updating item:", err);
    } finally {
      setEditLoadingSave(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">UBAC Tree (API Only)</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={refetchUbacTree}
            disabled={isLoading}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reload data"
          >
            <FontAwesomeIcon
              icon={faRotate}
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
            Add Item
          </button>
        </div>
      </div>

      {/* API Response Data */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">API Response</h3>
        <div className="bg-white p-3 rounded border text-sm">
          <pre className="whitespace-pre-wrap text-gray-600">
            {isLoading
              ? "Loading..."
              : JSON.stringify(data, null, 2)
            }
          </pre>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Item"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label htmlFor="newModuleName" className="block text-sm font-medium text-gray-700">
              Module Name
            </label>
            <input
              type="text"
              id="newModuleName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={newModuleName}
              onChange={(e) => {
                setNewModuleName(e.target.value);
                setNewFeatureName("");
                setNewActionName("");
                setSelectedModuleId("");
                setSelectedFeatureId("");
              }}
              disabled={!!selectedModuleId || !!selectedFeatureId}
            />
          </div>
          <div className="flex items-center justify-center text-gray-500">
            — OR —
          </div>
          <div>
            <label htmlFor="selectModuleForFeature" className="block text-sm font-medium text-gray-700">
              Select Module (for Feature)
            </label>
            <select
              id="selectModuleForFeature"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={selectedModuleId}
              onChange={(e) => {
                setSelectedModuleId(e.target.value);
                setNewModuleName("");
                setNewFeatureName("");
                setNewActionName("");
                setSelectedFeatureId("");
              }}
              disabled={!!newModuleName}
            >
              <option value="">Select a Module</option>
              {getModulesArray().map((module) => (
                <option key={module.module_id} value={module.module_id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>
          {selectedModuleId && (
            <div>
              <label htmlFor="newFeatureName" className="block text-sm font-medium text-gray-700">
                Feature Name
              </label>
              <input
                type="text"
                id="newFeatureName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={newFeatureName}
                onChange={(e) => {
                  setNewFeatureName(e.target.value);
                  setNewActionName("");
                  setSelectedFeatureId("");
                }}
                disabled={!!newModuleName}
              />
            </div>
          )}
          {selectedModuleId && newFeatureName && (
            <div className="flex items-center justify-center text-gray-500">
              — OR —
            </div>
          )}
          {selectedModuleId && newFeatureName && (
            <div>
              <label htmlFor="selectFeatureForAction" className="block text-sm font-medium text-gray-700">
                Select Feature (for Action)
              </label>
              <select
                id="selectFeatureForAction"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={selectedFeatureId}
                onChange={(e) => {
                  setSelectedFeatureId(e.target.value);
                  setNewActionName("");
                }}
              >
                <option value="">Select a Feature</option>
                {getModulesArray()
                  .find((m) => m.module_id === selectedModuleId)
                  ?.features.map((feature) => (
                    <option key={feature.feature_id} value={feature.feature_id}>
                      {feature.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
          {selectedFeatureId && (
            <div>
              <label htmlFor="newActionName" className="block text-sm font-medium text-gray-700">
                Action Name
              </label>
              <input
                type="text"
                id="newActionName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={newActionName}
                onChange={(e) => setNewActionName(e.target.value)}
              />
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={addLoadingSave}
            >
              {addLoadingSave ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit ${editType.charAt(0).toUpperCase() + editType.slice(1)}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label htmlFor="editFormName" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="editFormName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={editFormName}
              onChange={(e) => setEditFormName(e.target.value)}
            />
          </div>
          {editType === 'feature' && (
            <div>
              <label htmlFor="editSelectedModuleId" className="block text-sm font-medium text-gray-700">
                Parent Module
              </label>
              <select
                id="editSelectedModuleId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={editSelectedModuleId}
                onChange={(e) => setEditSelectedModuleId(e.target.value)}
              >
                <option value="">Select a Module</option>
                {getModulesArray().map((module) => (
                  <option key={module.module_id} value={module.module_id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {editType === 'action' && (
            <div>
              <label htmlFor="editSelectedFeatureId" className="block text-sm font-medium text-gray-700">
                Parent Feature
              </label>
              <select
                id="editSelectedFeatureId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={editSelectedFeatureId}
                onChange={(e) => setEditSelectedFeatureId(e.target.value)}
              >
                <option value="">Select a Feature</option>
                {getModulesArray().flatMap(module =>
                  module.features.map(feature => (
                    <option key={feature.feature_id} value={feature.feature_id}>
                      {feature.name} (Module: {module.name})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={editLoadingSave}
            >
              {editLoadingSave ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Button (for testing) */}
      <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
        <h3 className="font-medium text-red-800 mb-2">Test Delete Operations</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const id = prompt("Enter Module ID to delete:");
              if (id) deleteItem('module', id);
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete Module
          </button>
          <button
            onClick={() => {
              const id = prompt("Enter Feature ID to delete:");
              if (id) deleteItem('feature', id);
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete Feature
          </button>
          <button
            onClick={() => {
              const id = prompt("Enter Action ID to delete:");
              if (id) deleteItem('action', id);
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default UBACTree;
