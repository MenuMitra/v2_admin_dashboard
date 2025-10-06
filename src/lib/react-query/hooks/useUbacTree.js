import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { API_CONFIG } from "../../../config/appConfig";
import { queryKeys } from "../queryKeys";
import { toastController } from "../../../utils/toastController";

const { BASE_URL, API_VERSION } = API_CONFIG;

export const useUbacTree = () => {
  const { getToken } = useAuth();

  const {
    data = {},
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.functionalities.list(),
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/admin/ubac_tree`,
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onError: (err) => {
      toastController.error(
        err.response?.data?.detail || "Failed to fetch UBAC tree"
      );
    },
  });

  return {
    data,
    isLoading,
    error,
    refetchUbacTree: refetch,
  };
};

export default useUbacTree;
