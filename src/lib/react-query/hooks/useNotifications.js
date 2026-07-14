import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { queryKeys } from '../queryKeys';
import { API_CONFIG } from '../../../config/appConfig';
import { toastController } from '../../../utils/toastController';

const { BASE_URL } = API_CONFIG;

function resolveOutletDisplayName(notification, outletById) {
  const outletId = String(notification.original_outlet_id ?? notification.outlet_id ?? '');

  if (outletId === '0') {
    return 'All';
  }

  if (notification.outlet_name) {
    return notification.outlet_name;
  }

  const fromList = outletById.get(outletId);
  if (fromList) {
    return fromList;
  }

  const current = notification.outlet;
  if (current && !/^\d+$/.test(String(current))) {
    return current;
  }

  return outletId;
}

export const useNotifications = (selectedOutlet = '') => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();

  // Outlets List Query — same API as Outlets page (get_list/outlets is broken/outdated)
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

      const response = await axios.post(
        `${BASE_URL}/common/listview_outlet`,
        {
          user_id: adminData?.user_id,
          app_source: 'admin_app',
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.detail !== 'Successfully retrieved outlets') {
        throw new Error(response.data.message || 'Failed to fetch outlets');
      }

      return (response.data.data || []).map((outlet) => ({
        outlet_id: String(outlet.outlet_id),
        outlet_name: outlet.outlet_name,
        outlet_code: outlet.outlet_code != null
          ? String(outlet.outlet_code)
          : String(outlet.outlet_id),
      }));
    },
    enabled: !!adminData?.user_id,
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

      const outlet_id =
        !selectedOutlet || selectedOutlet === 'all' ? '0' : String(selectedOutlet);

      const response = await axios.post(
        `${BASE_URL}/common/notification_filter_options`,
        {
          outlet_id,
          user_id: adminData?.user_id,
          app_source: 'admin_app',
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      const payload = response.data?.data || response.data || {};
      if (!Array.isArray(payload.roles)) {
        throw new Error('Failed to fetch roles');
      }

      return payload.roles.map((role) => {
        const roleKey =
          typeof role === 'string'
            ? role
            : role.role || role.role_name || role.id;
        return {
          role_id: String(roleKey),
          role_name:
            String(roleKey).charAt(0).toUpperCase() +
            String(roleKey).slice(1).replace(/_/g, ' '),
          count: role.count ?? 0,
        };
      });
    },
    enabled: selectedOutlet !== undefined && selectedOutlet !== null && selectedOutlet !== '',
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
        `${BASE_URL}/common/list_notifications`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Failed to fetch notifications');
      }

      return response.data.map((notification) => ({
        id: notification.notification_id,
        title: notification.message,
        type: notification.type,
        outlet_name: notification.outlet_name,
        role:
          notification.role === 'all'
            ? 'All'
            : notification.role.charAt(0).toUpperCase() +
              notification.role.slice(1),
        user:
          notification.user_name ||
          (notification.user_id === '0' ? 'All' : notification.user_id),
        success_count: notification.success_count,
        failure_count: notification.failure_count,
        created_on: notification.sent_on || notification.created_on,
        broadcast_status: notification.broadcast_status,
        original_outlet_id: String(notification.outlet_id),
        original_role: notification.role,
        original_user_id: notification.user_id,
      }));
    },
    onError: (error) => {
      toastController.error(error.message || 'Failed to fetch notifications');
    },
  });

  const notificationsWithOutletNames = useMemo(() => {
    const outletById = new Map(
      outlets.map((o) => [String(o.outlet_id), o.outlet_name])
    );

    return notifications.map((notification) => ({
      ...notification,
      outlet: resolveOutletDisplayName(notification, outletById),
    }));
  }, [notifications, outlets]);

  return {
    notifications: notificationsWithOutletNames,
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