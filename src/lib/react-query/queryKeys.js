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
    bulkAction: () => [...queryKeys.outlets.all, 'bulk-action'],
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

  // Feature related queries
  features: {
    all: ['features'],
    list: () => [...queryKeys.features.all, 'list'],
    detail: (id) => [...queryKeys.features.all, 'detail', id],
  },

  // Subscription related queries
  subscriptions: {
    all: ['subscriptions'],
    list: () => [...queryKeys.subscriptions.all, 'list'],
    detail: (id) => [...queryKeys.subscriptions.all, 'detail', id],
  },

  roles: {
    all: ['roles'],
    list: () => [...queryKeys.roles.all, 'list'],
    detail: (id) => [...queryKeys.roles.all, 'detail', id],
    functionalities: (id) => [...queryKeys.roles.all, 'functionalities', id],
  },

  functionalities: {
    all: ['functionalities'],
    list: () => [...queryKeys.functionalities.all, 'list'],
    detail: (id) => [...queryKeys.functionalities.all, 'detail', id],
  },

  tickets: {
    all: ['tickets'],
    list: () => [...queryKeys.tickets.all, 'list'],
    detail: (id) => [...queryKeys.tickets.all, 'detail', id],
  },
}; 