import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { API_CONFIG } from "../../../config/appConfig";
import { queryKeys } from "../queryKeys";

export const useStats = () => {
  const { getToken } = useAuth();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Helper function to format date for API
  const formatDateForApi = (yyyy_mm_dd) => {
    if (!yyyy_mm_dd) return "";
    const [year, month, day] = yyyy_mm_dd.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // 1. API Usage Stats Query
  const useApiUsageStats = (filters) => {
    return useQuery({
      queryKey: queryKeys.stats.apiUsage(filters),
      queryFn: async () => {
        const response = await fetch(
          `${BASE_URL}/admin/api_usage_stats`,
          {
            method: "GET",
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch API usage stats");
        return response.json();
      },
    });
  };

  // 2. DB Tables Stats Query
  const useDbTableStats = () => {
    return useQuery({
      queryKey: queryKeys.stats.dbTables(),
      queryFn: async () => {
        const response = await fetch(
          `${BASE_URL}/admin/table_stats`,
          {
            method: "GET",
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch table statistics");
        return response.json();
      },
    });
  };

  // 3. App Usage Stats Query
  const useAppUsageStats = (filters) => {
    return useQuery({
      queryKey: queryKeys.stats.appUsage(filters),
      queryFn: async () => {
        const token = getToken();
        if (!token) {
          throw new Error("No authorization token available");
        }

        // Convert date format to match API expectations: 'DD MMM YYYY'
        const formatDateForApi = (dateString) => {
          if (!dateString) return "";

          // Month names mapping for consistency
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          // If it's already in DD MMM YYYY format, return as is
          if (/^\d{2} [A-Za-z]{3} \d{4}$/.test(dateString)) {
            return dateString;
          }

          // If it's in YYYY-MM-DD format, convert to DD MMM YYYY
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;

            const day = date.getDate().toString().padStart(2, "0");
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
          }

          // Try to parse as any other format
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            console.warn("Could not parse date:", dateString);
            return dateString;
          }

          const day = date.getDate().toString().padStart(2, "0");
          const month = monthNames[date.getMonth()];
          const year = date.getFullYear();
          return `${day} ${month} ${year}`;
        };

        const requestBody = {
          start_date: formatDateForApi(filters.start_date),
          end_date: formatDateForApi(filters.end_date),
        };

        console.log("Sending app usage stats request:", requestBody);
        console.log("Authorization token:", token ? "Present" : "Missing");

        const response = await fetch(
          `${BASE_URL}/admin/app_usage_stats`,
          {
            method: "POST",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "App usage stats API error:",
            response.status,
            errorText
          );
          throw new Error(
            `Failed to fetch app usage stats: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Received app usage stats data:", data);
        return data;
      },
      enabled: Boolean(filters?.start_date && filters?.end_date),
    });
  };

  // 4. App Sources Query
  const useAppSources = () => {
    return useQuery({
      queryKey: queryKeys.stats.appSources(),
      queryFn: async () => {
        const response = await fetch(
          `${BASE_URL}/common/get_list/app_source`,
          {
            method: "GET",
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch app sources");
        const data = await response.json();

        // Transform the app_source_list object into dropdown format
        return Object.entries(data.app_source_list).map(([value, label]) => ({
          value,
          label: label
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        }));
      },
    });
  };

  return {
    useApiUsageStats,
    useDbTableStats,
    useAppUsageStats,
    useAppSources,
    formatDateForApi,
  };
};
