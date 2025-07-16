import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { queryKeys } from '../queryKeys';
import { API_CONFIG } from '../../../config/appConfig';
import { toastController } from '../../../utils/toastController';

const { BASE_URL, API_VERSION } = API_CONFIG;

export const useNotifications = (selectedOutlet = '') => {
  const { getToken } = useAuth();

  // Outlets List Query
  const {
    data: outlets = [],
    isLoading: isLoadingOutlets,
    error: outletsError,
  } = useQuery({
    queryKey: queryKeys.outlets.list(),
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/get_list/outlets`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.detail !== "Successfully retrieved outlets") {
        throw new Error('Failed to fetch outlets');
      }

      return Object.entries(response.data.outlet_list).map(([name, id]) => ({
        outlet_id: id.toString(),
        outlet_name: name,
        outlet_code: id.toString()
      }));
    },
    onError: (error) => {
      toastController.error(error.message || 'Failed to fetch outlets');
    },
  });

  // Roles List Query
  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useQuery({
    queryKey: queryKeys.notifications.roles(selectedOutlet),
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/notification_filter_options`,
        { outlet_id: selectedOutlet },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.data.roles) {
        throw new Error('Failed to fetch roles');
      }

      return response.data.roles.map(role => ({
        role_id: role.role,
        role_name: role.role.charAt(0).toUpperCase() + role.role.slice(1).replace('_', ' '),
        count: role.count
      }));
    },
    enabled: !!selectedOutlet,
    onError: (error) => {
      toastController.error(error.message || 'Failed to fetch roles');
    },
  });

  // Notifications List Query
  const {
    data: notifications = [],
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/list_notifications`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Failed to fetch notifications');
      }

      return response.data.map(notification => ({
        id: notification.notification_id,
        title: notification.message,
        type: notification.type,
        outlet: notification.outlet_name || (notification.outlet_id === "0" ? "All" : notification.outlet_id),
        role: notification.role === "all" ? "All" : notification.role.charAt(0).toUpperCase() + notification.role.slice(1),
        user: notification.user_name || (notification.user_id === "0" ? "All" : notification.user_id),
        success_count: notification.success_count,
        failure_count: notification.failure_count,
        created_on: notification.sent_on || notification.created_on,
        broadcast_status: notification.broadcast_status,
        original_outlet_id: notification.outlet_id,
        original_role: notification.role,
        original_user_id: notification.user_id
      }));
    },
    onError: (error) => {
      toastController.error(error.message || 'Failed to fetch notifications');
    },
  });

  return {
    notifications,
    isLoadingNotifications,
    notificationsError,
    refetchNotifications,
    outlets,
    isLoadingOutlets,
    outletsError,
    roles,
    isLoadingRoles,
    rolesError,
  };
}; 