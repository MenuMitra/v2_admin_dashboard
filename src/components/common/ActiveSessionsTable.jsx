import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomDropdown from "./CustomDropdown";

const ActiveSessionsTable = ({
  activeSessions = [],
  onLogout,
  showAction = true,
  className = "",
}) => {
  const [appTypeFilter, setAppTypeFilter] = useState("all");

  const appTypeOptions = useMemo(() => {
    const types = [
      ...new Set(
        activeSessions
          .map((s) => s.app_type?.toUpperCase())
          .filter(Boolean)
      ),
    ].sort();

    return [
      { value: "all", label: "All App Types" },
      ...types.map((type) => ({ value: type, label: type })),
    ];
  }, [activeSessions]);

  useEffect(() => {
    if (
      appTypeFilter !== "all" &&
      !appTypeOptions.some((opt) => opt.value === appTypeFilter)
    ) {
      setAppTypeFilter("all");
    }
  }, [appTypeFilter, appTypeOptions]);

  const filteredSessions = useMemo(() => {
    if (appTypeFilter === "all") return activeSessions;
    return activeSessions.filter(
      (s) => s.app_type?.toUpperCase() === appTypeFilter
    );
  }, [activeSessions, appTypeFilter]);

  if (!activeSessions || activeSessions.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex justify-end mb-3 mt-2">
        <div className="w-44">
          <CustomDropdown
            label="App Type"
            options={appTypeOptions}
            value={appTypeFilter}
            onChange={(e) => setAppTypeFilter(e.target.value)}
            placeholder="All App Types"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
              Device Model
            </th>
            <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
              Expires On
            </th>
            <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
              Last Activity
            </th>
            <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
              Last Login
            </th>
            <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
              App Type
            </th>
            {showAction && (
              <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredSessions.length === 0 ? (
            <tr>
              <td
                colSpan={showAction ? 6 : 5}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                No sessions found for the selected app type.
              </td>
            </tr>
          ) : (
          filteredSessions.map((session, idx) => (
            <tr key={idx} className="border-b last:border-b-0">
              <td className="px-4 py-2 text-sm text-gray-800">
                {session.device_model || "-"}
              </td>
              <td className="px-4 py-2 text-sm text-gray-800">
                {session.expires_on || "-"}
              </td>
              <td className="px-4 py-2 text-sm text-gray-800">
                {session.last_activity || "-"}
              </td>
              <td className="px-4 py-2 text-sm text-gray-800">
                {session.last_login || "-"}
              </td>
              <td className="px-4 py-2 text-sm text-gray-800">
                {session.app_type?.toUpperCase() || "-"}
              </td>
              {showAction && (
                <td className="px-4 py-2 text-sm text-gray-800">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-3xl shadow-theme-xs transition"
                    onClick={() => onLogout && onLogout(session.device_id)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          )))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default ActiveSessionsTable;
