const { PrismaClient } = require('@prisma/client');
const { getTenantId, getUserRole } = require('./context');

const prisma = new PrismaClient();

const extendedPrisma = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const tenantId = getTenantId();
        const role = getUserRole();

        // Skip filtering for Tenant model or if user is SUPER_ADMIN
        if (model === 'Tenant' || role === 'SUPER_ADMIN' || !tenantId) {
          return query(args);
        }

        // Add tenant_id filter to read/update/delete operations
        if (
          ['findFirst', 'findMany', 'count', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert'].includes(
            operation
          )
        ) {
          args.where = { ...args.where, tenant_id: tenantId };
        }

        // Add tenant_id to create operations
        if (['create', 'createMany'].includes(operation)) {
          if (Array.isArray(args.data)) {
            args.data = args.data.map((item) => ({ ...item, tenant_id: tenantId }));
          } else {
            args.data = { ...args.data, tenant_id: tenantId };
          }
        }

        return query(args);
      },
    },
  },
});

module.exports = extendedPrisma;
