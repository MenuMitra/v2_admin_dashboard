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
    home: () => [...queryKeys.dashboard.all, 'home'],
    stats: () => [...queryKeys.dashboard.all, 'stats'],
    overview: () => [...queryKeys.dashboard.all, 'overview'],
  },

  // Outlet related queries
  outlets: {
    all: ['outlets'],
    list: () => [...queryKeys.outlets.all, 'list'],
    detail: (id) => [...queryKeys.outlets.all, 'detail', id],
    bulkAction: () => [...queryKeys.outlets.all, 'bulk-action'],
    bulkUpload: (id) => [...queryKeys.outlets.all, 'bulk-upload', id],
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

  admin: {
    all: ['admin'],
    list: () => [...queryKeys.admin.all, 'list'],
    detail: (id) => [...queryKeys.admin.all, 'detail', id],
  },

  // Super Owner related queries
  superOwners: {
    all: ['superOwners'],
    list: () => [...queryKeys.superOwners.all, 'list'],
    detail: (id) => [...queryKeys.superOwners.all, 'detail', id],
    outlets: (id) => [...queryKeys.superOwners.all, 'outlets', id],
    functionalities: (id) => [...queryKeys.superOwners.all, 'functionalities', id],
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

  notifications: {
    all: ['notifications'],
    list: () => [...queryKeys.notifications.all, 'list'],
    detail: (id) => [...queryKeys.notifications.all, 'detail', id],
    roles: (outletId) => [...queryKeys.notifications.all, 'roles', outletId],
  },

  stats: {
    all: ['stats'],
    apiUsage: (filters) => [...queryKeys.stats.all, 'api-usage', filters],
    dbTables: () => [...queryKeys.stats.all, 'db-tables'],
    appUsage: (filters) => [...queryKeys.stats.all, 'app-usage', filters],
    appSources: () => [...queryKeys.stats.all, 'app-sources'],
  },

  categories: {
    all: ['categories'],
    list: (outletId) => [...queryKeys.categories.all, 'list', outletId],
    detail: (id) => [...queryKeys.categories.all, 'detail', id],
    bulkAction: (outletId) => [...queryKeys.categories.all, 'bulk-action', outletId],
  },

  menus: {
    all: ['menus'],
    list: (outletId) => [...queryKeys.menus.all, 'list', outletId],
    detail: (outletId, menuId) => [...queryKeys.menus.all, 'detail', outletId, menuId],
    bulk: (outletId) => [...queryKeys.menus.all, 'bulk', outletId],
  },

  managers: {
    all: ['managers'],
    list: (outletId) => [...queryKeys.managers.all, 'list', outletId],
    detail: (outletId, userId) => [...queryKeys.managers.all, 'detail', outletId, userId],
  },

  chefs: {
    all: ['chefs'],
    list: (outletId) => [...queryKeys.chefs.all, 'list', outletId],
    detail: (outletId, userId) => [...queryKeys.chefs.all, 'detail', outletId, userId],
    bulk: (outletId) => [...queryKeys.chefs.all, 'bulk', outletId],
  },
}; 