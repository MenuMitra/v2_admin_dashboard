/**
 * Query key factory for TanStack Query
 * This helps maintain consistent query keys across the application
 */

export const queryKeys = {
  // Auth related queries
  auth: {
    all: ['auth'],
    profile: () => [...queryKeys.auth.all, 'profile'],
    session: () => [...queryKeys.auth.all, 'session'],
  },
  
  // Dashboard related queries
  dashboard: {
    all: ['dashboard'],
    stats: () => [...queryKeys.dashboard.all, 'stats'],
    overview: () => [...queryKeys.dashboard.all, 'overview'],
  },

  // Outlet related queries
  outlets: {
    all: ['outlets'],
    list: () => [...queryKeys.outlets.all, 'list'],
    detail: (id) => [...queryKeys.outlets.all, 'detail', id],
    stats: (id) => [...queryKeys.outlets.all, 'stats', id],
  },

  // Owner related queries
  owners: {
    all: ['owners'],
    list: () => [...queryKeys.owners.all, 'list'],
    detail: (id) => [...queryKeys.owners.all, 'detail', id],
  },

  // Customer related queries
  customers: {
    all: ['customers'],
    list: () => [...queryKeys.customers.all, 'list'],
    detail: (id) => [...queryKeys.customers.all, 'detail', id],
  },

  // Admin related queries
  admins: {
    all: ['admins'],
    list: () => [...queryKeys.admins.all, 'list'],
    detail: (id) => [...queryKeys.admins.all, 'detail', id],
  },

  // Super Owner related queries
  superOwners: {
    all: ['superOwners'],
    list: () => [...queryKeys.superOwners.all, 'list'],
    detail: (id) => [...queryKeys.superOwners.all, 'detail', id],
  },

  // Partner related queries
  partners: {
    all: ['partners'],
    list: () => [...queryKeys.partners.all, 'list'],
    detail: (id) => [...queryKeys.partners.all, 'detail', id],
  },
}; 