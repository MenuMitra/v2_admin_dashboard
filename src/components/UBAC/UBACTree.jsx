import React from "react";
import TablesViewHeader from "../common/TablesViewHeader";
import Breadcrumb from "../Breadcrumb";
import useUbacTree from "../../lib/react-query/hooks/useUbacTree";

const UBACTree = () => {
  const { data, isLoading, refetchUbacTree } = useUbacTree();

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
        onCreateClick={() => alert("Create clicked")}
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
    </div>
  );
};

export default UBACTree;
