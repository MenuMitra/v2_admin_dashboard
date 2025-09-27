import React, { useState, useEffect } from "react";
import TablesViewHeader from "../common/TablesViewHeader";
import Breadcrumb from "../Breadcrumb";
import useUbacTree from "../../lib/react-query/hooks/useUbacTree";
import { useAuth } from "../../hooks/useAuth";

const UBACTree = () => {
  const { data, isLoading, refetchUbacTree } = useUbacTree();
  const { getToken } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState("module"); // module | feature | action
  const [modulesList, setModulesList] = useState([]);
  const [featuresList, setFeaturesList] = useState([]);
  const [formName, setFormName] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] = useState("");
  const [loadingSave, setLoadingSave] = useState(false);

  // load modules on mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = getToken() || localStorage.getItem("token");
        const headers = token
          ? { Authorization: token, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" };

        // DEBUG: show token and headers for troubleshooting auth
        console.log("UBAC: fetchModules getToken() =>", getToken());
        console.log("UBAC: fetchModules headers =>", headers);

        const res = await fetch("https://men4u.xyz/v2/admin/get_modules", {
          method: "GET",
          headers,
        });

        if (res.status === 401 || res.status === 403) {
          console.warn("Unauthorized when fetching modules", res.status);
          setModulesList([]);
          return;
        }

        const json = await res.json();
        const data = json.data || json || [];
        setModulesList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load modules", err);
        setModulesList([]);
      }
    };

    fetchModules();
  }, []);

  // load features when module is selected
  useEffect(() => {
    if (!selectedModuleId) {
      setFeaturesList([]);
      return;
    }

    const fetchFeatures = async () => {
      try {
        const token = getToken() || localStorage.getItem("token");
        const body = {
          outlet_id: 6473,
          app_source: "pos_app",
          module_id: Number(selectedModuleId),
        };

        const headers = token
          ? { Authorization: token, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" };

        // DEBUG: show token and headers for troubleshooting auth
        console.log("UBAC: fetchFeatures getToken() =>", getToken());
        console.log("UBAC: fetchFeatures headers =>", headers);

        const res = await fetch("https://men4u.xyz/v2/admin/list_features", {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        if (res.status === 401 || res.status === 403) {
          console.warn("Unauthorized when fetching features", res.status);
          setFeaturesList([]);
          return;
        }

        const json = await res.json();
        const data = json.data || json || [];
        setFeaturesList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load features", err);
        setFeaturesList([]);
      }
    };

    fetchFeatures();
  }, [selectedModuleId]);

  const items = [
    { label: "Access Control", path: "/roles" },
    { label: "UBAC Tree", path: "/ubac_tree" },
  ];

  // Render actions vertically with connector
  const renderActions = (actions) => (
    <div className="flex flex-col items-start ml-6">
      {actions.map((action, idx) => (
        <div key={action.action_id} className="flex items-center">
          <div className="w-4 h-0.5 bg-gray-300 mr-2" />
          <div className="px-3 py-1 rounded bg-white border text-sm">
            {action.name}
          </div>
        </div>
      ))}
    </div>
  );

  // Render features with vertical line to actions
  const renderFeatures = (features) => (
    <div className="flex gap-8">
      {features.map((feature) => (
        <div key={feature.feature_id} className="flex flex-col items-center">
          <div className="px-4 py-2 rounded bg-white border font-medium">
            {feature.name}
          </div>
          <div className="w-px h-6 bg-gray-300 mt-2" />
          {feature.actions && renderActions(feature.actions)}
        </div>
      ))}
    </div>
  );

  // Render modules across the top with connectors to features
  const renderModules = (modules) => (
    <div className="flex gap-12 justify-start items-start">
      {modules.map((module) => (
        <div key={module.module_id} className="flex flex-col items-center">
          <div className="px-6 py-2 rounded bg-gray-100 border font-semibold">
            {module.name}
          </div>
          <div className="w-px h-6 bg-gray-300 mt-2" />
          <div className="mt-4">
            {module.features && renderFeatures(module.features)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <Breadcrumb items={items} />
      <TablesViewHeader
        title="UBAC Tree"
        showBackButton={false}
        showCreateButton={true}
        createButtonLabel="Create"
        onCreateClick={() => setIsModalOpen(true)}
      />

      <div className="px-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Modules / Features / Actions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetchUbacTree}
              className="px-3 py-1 rounded bg-brand-500 text-white"
            >
              Reload
            </button>
          </div>
        </div>

        {isLoading ? <div>Loading...</div> : renderModules(data.data || [])}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="bg-white rounded shadow-lg p-6 z-10 w-96">
            <h3 className="text-lg font-semibold mb-4">Create</h3>

            <div className="mb-3">
              <label className="block text-sm mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border px-2 py-1"
              >
                <option value="module">Module</option>
                <option value="feature">Feature</option>
                <option value="action">Action</option>
              </select>
            </div>

            {/* Module select - shown for feature/action */}
            {(type === "feature" || type === "action") && (
              <div className="mb-3">
                <label className="block text-sm mb-1">Module</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full border px-2 py-1"
                >
                  <option value="">Select module</option>
                  {modulesList.map((m) => (
                    <option key={m.module_id} value={m.module_id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Feature select - shown for action */}
            {type === "action" && (
              <div className="mb-3">
                <label className="block text-sm mb-1">Feature</label>
                <select
                  value={selectedFeatureId}
                  onChange={(e) => setSelectedFeatureId(e.target.value)}
                  className="w-full border px-2 py-1"
                >
                  <option value="">Select feature</option>
                  {featuresList.map((f) => (
                    <option key={f.feature_id} value={f.feature_id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm mb-1">Name</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full border px-2 py-1"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setIsModalOpen(false)}
                disabled={loadingSave}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-brand-500 text-white rounded"
                onClick={async () => {
                  // save logic
                  setLoadingSave(true);
                  try {
                    const token = getToken() || localStorage.getItem("token");
                    const headers = token
                      ? {
                          Authorization: token,
                          "Content-Type": "application/json",
                        }
                      : { "Content-Type": "application/json" };

                    let resp;
                    if (type === "module") {
                      resp = await fetch(
                        "https://men4u.xyz/v2/admin/create_module",
                        {
                          method: "POST",
                          headers,
                          body: JSON.stringify({ name: formName }),
                        }
                      );
                    } else if (type === "feature") {
                      resp = await fetch(
                        "https://men4u.xyz/v2/admin/create_feature",
                        {
                          method: "POST",
                          headers,
                          body: JSON.stringify({
                            module_id: Number(selectedModuleId),
                            name: formName,
                          }),
                        }
                      );
                    } else if (type === "action") {
                      resp = await fetch(
                        "https://men4u.xyz/v2/admin/create_action",
                        {
                          method: "POST",
                          headers,
                          body: JSON.stringify({
                            feature_id: Number(selectedFeatureId),
                            name: formName,
                          }),
                        }
                      );
                    }

                    // handle non-2xx responses and show clearer message
                    if (resp && !resp.ok) {
                      try {
                        const errJson = await resp.json();
                        const message =
                          errJson.detail ||
                          errJson.message ||
                          JSON.stringify(errJson);
                        alert(message);
                        throw new Error(message);
                      } catch (parseErr) {
                        alert("Save failed");
                        throw parseErr;
                      }
                    }

                    // refresh list
                    await refetchUbacTree();
                    // close
                    setIsModalOpen(false);
                    // reset
                    setFormName("");
                    setSelectedFeatureId("");
                    setSelectedModuleId("");
                  } catch (err) {
                    console.error(err);
                    alert("Save failed");
                  } finally {
                    setLoadingSave(false);
                  }
                }}
                disabled={
                  loadingSave ||
                  (type !== "module" && !selectedModuleId) ||
                  (type === "action" && !selectedFeatureId) ||
                  !formName
                }
              >
                {loadingSave ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UBACTree;
