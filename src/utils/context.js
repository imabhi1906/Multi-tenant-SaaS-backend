const { AsyncLocalStorage } = require('async_hooks');

const tenantContext = new AsyncLocalStorage();

module.exports = {
  tenantContext,
  getTenantId: () => tenantContext.getStore()?.tenantId,
  getUserRole: () => tenantContext.getStore()?.role,
  getUserId: () => tenantContext.getStore()?.userId,
};
