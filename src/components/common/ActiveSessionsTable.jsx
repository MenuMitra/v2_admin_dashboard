import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const ActiveSessionsTable = ({
  activeSessions = [],
  lastLogin,
  onLogout,
  showAction = true,
  className = "",
}) => {
  if (!activeSessions || activeSessions.length === 0) {
    return null;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
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
          {activeSessions.map((session, idx) => (
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
                {lastLogin || "-"}
              </td>
              <td className="px-4 py-2 text-sm text-gray-800">
                {session.app_type?.toUpperCase() || "-"}
              </td>
              {showAction && (
                <td className="px-4 py-2 text-sm text-gray-800">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
                    onClick={() => onLogout && onLogout(session.device_id)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveSessionsTable;
