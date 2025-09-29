import React, { useState, useEffect } from "react";
import TablesViewHeader from "../common/TablesViewHeader";
import Breadcrumb from "../Breadcrumb";
import useUbacTree from "../../lib/react-query/hooks/useUbacTree";
import { useAuth } from "../../hooks/useAuth";
import Modal from "../common/Modal";

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
  const [expandedModules, setExpandedModules] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

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

        const query = new URLSearchParams({
          module_id: String(body.module_id),
          outlet_id: String(body.outlet_id),
          app_source: body.app_source,
        }).toString();

        // include query string so API receives module_id/outlet_id/app_source
        const url = `https://men4u.xyz/v2/admin/get_features?${query}`;
        console.log("UBAC: fetchFeatures url =>", url);

        const res = await fetch(url, {
          method: "GET",
          headers,
        });

        console.log("UBAC: fetchFeatures status =>", res.status);

        if (res.status === 401 || res.status === 403) {
          console.warn("Unauthorized when fetching features", res.status);
          setFeaturesList([]);
          return;
        }

        if (!res.ok) {
          console.error("Failed to fetch features, status:", res.status);
          setFeaturesList([]);
          return;
        }

        const json = await res.json();
        // API may return features in different shapes: { data: [...] } or { features: [...] } or { ..., features: [...] }
        const incoming = json.data || json.features || json || [];
        const features = Array.isArray(incoming)
          ? incoming
          : incoming.features || [];
        setFeaturesList(features);
      } catch (err) {
        console.error("Failed to load features", err);
        setFeaturesList([]);
      }
    };

    fetchFeatures();
  }, [selectedModuleId]);

  const items = [
    { label: "Home", path: "/home" },
    { label: "UBAC Tree", path: "/ubac_tree" },
  ];

  // Render actions vertically with connector (compact)
  const renderActions = (actions) => (
    <div className="flex flex-col items-start ml-4">
      {actions.map((action, idx) => (
        <div key={action.action_id} className="flex items-center mb-1">
          <div className="w-3 h-0.5 bg-gray-300 mr-2" />
          <div className="px-2 py-1 rounded bg-white border text-xs whitespace-nowrap">
            {action.name}
          </div>
        </div>
      ))}
    </div>
  );

  // Render features horizontally; show first 3, then a 'See more' card toggling full list
  const renderFeatures = (features, moduleId) => {
    const isExpanded = Boolean(expandedModules[moduleId]);

    // items to show when not expanded
    const visible = isExpanded ? features : features.slice(0, 3);

    return (
      <div className="flex items-start">
        <div className="flex gap-6 items-start">
          {visible.map((feature) => (
            <div
              key={feature.feature_id}
              className="flex flex-col items-center"
            >
              <div className="min-w-[140px] max-w-xs px-4 py-2 rounded bg-white border shadow-sm text-center font-medium break-words">
                {feature.name}
              </div>
              <div className="w-px h-4 bg-gray-300 mt-2" />
              {feature.actions && renderActions(feature.actions)}
            </div>
          ))}

          {features.length > 3 && (
            <div className="flex flex-col items-center">
              <div
                className="min-w-[140px] px-4 py-2 rounded bg-white border shadow-sm font-medium cursor-pointer text-center"
                onClick={() =>
                  setExpandedModules((prev) => ({
                    ...prev,
                    [moduleId]: !prev[moduleId],
                  }))
                }
              >
                {isExpanded ? "See less" : `+${features.length - 3} more`}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render modules across the top with connectors to features
  const renderModules = (modules) => (
    <div className="flex gap-10 justify-start items-start overflow-x-auto py-4">
      {modules.map((module) => (
        <div
          key={module.module_id}
          className="flex flex-col items-center min-w-[220px]"
        >
          <div className="px-4 py-2 rounded bg-gray-100 border font-semibold text-center w-full">
            {module.name}
          </div>
          <div className="w-px h-6 bg-gray-300 mt-2" />
          <div className="mt-4 w-full">
            {module.features &&
              renderFeatures(module.features, module.module_id)}
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
        onReload={refetchUbacTree}
        isLoading={isLoading}
        showSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={{
          total_modules: data && data.data ? data.data.length : 0,
          total_features:
            data && data.data
              ? data.data.reduce(
                  (acc, m) =>
                    acc + (Array.isArray(m.features) ? m.features.length : 0),
                  0
                )
              : 0,
          total_actions:
            data && data.data
              ? data.data.reduce(
                  (acc, m) =>
                    acc +
                    (Array.isArray(m.features)
                      ? m.features.reduce(
                          (faAcc, f) =>
                            faAcc +
                            (Array.isArray(f.actions) ? f.actions.length : 0),
                          0
                        )
                      : 0),
                  0
                )
              : 0,
        }}
      />

      <div className="px-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Modules / Features / Actions
            </div>
          </div>

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            renderModules(
              // filter modules/features/actions by search term
              (data.data || []).filter((m) => {
                if (!searchTerm) return true;
                const q = searchTerm.toLowerCase();
                // match module name
                if (m.name && m.name.toLowerCase().includes(q)) return true;
                // match features or actions
                if (
                  m.features &&
                  m.features.some((f) => {
                    if (f.name && f.name.toLowerCase().includes(q)) return true;
                    if (
                      f.actions &&
                      f.actions.some(
                        (a) => a.name && a.name.toLowerCase().includes(q)
                      )
                    )
                      return true;
                    return false;
                  })
                )
                  return true;
                return false;
              })
            )
          )}
        </div>
      </div>

      {/* Create Modal (use shared Modal component for consistent appearance) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create"
        size="small"
        actionButtons={
          <>
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

                  await refetchUbacTree();
                  setIsModalOpen(false);
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
          </>
        }
      >
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
      </Modal>
    </div>
  );
};

export default UBACTree;
