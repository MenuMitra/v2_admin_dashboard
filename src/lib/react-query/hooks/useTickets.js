import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { queryKeys } from '../queryKeys';
import { API_CONFIG } from '../../../config/appConfig';
import { toastController } from '../../../utils/toastController';

const { BASE_URL, API_VERSION } = API_CONFIG;

export const useTickets = (outletId = null) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();

  // Tickets List Query
  const {
    data: tickets = [],
    isLoading: isLoadingTickets,
    error: ticketsError,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: queryKeys.tickets.list(),
    queryFn: async () => {
      const requestBody = {
        user_id: adminData?.user_id,
        app_source: "admin_app",
      };

      if (outletId) {
        requestBody.outlet_id = outletId;
      }

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/ticket_list`,
        requestBody,
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );

      if (!response.data.tickets) {
        throw new Error("Failed to fetch tickets");
      }

      return response.data.tickets;
    },
    enabled: !!adminData?.user_id,
    onError: (error) => {
      toastController.error(error.response?.data?.msg || "Failed to fetch tickets");
    },
  });

  // Outlets List Query
  const {
    data: outlets = [],
    isLoading: isLoadingOutlets,
    error: outletsError,
  } = useQuery({
    queryKey: queryKeys.outlets.list(),
    queryFn: async () => {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/listview_outlet`,
        {
          user_id: adminData?.user_id,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );

      if (!response.data.data) {
        throw new Error("Failed to fetch outlets");
      }

      return response.data.data;
    },
    enabled: !!adminData?.user_id,
    onError: (error) => {
      toastController.error(error.response?.data?.msg || "Failed to fetch outlets");
    },
  });

  return {
    tickets,
    isLoadingTickets,
    ticketsError,
    refetchTickets,
    outlets,
    isLoadingOutlets,
    outletsError,
  };
}; 