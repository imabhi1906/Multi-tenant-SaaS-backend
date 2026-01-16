const prisma = require('../../utils/prisma');

const getTenantDetails = async (req, res, next) => {
  try {
    const tenantId = req.user.tenant_id;
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            books: true,
            users: true,
            orders: true,
          }
        }
      }
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json(tenant);
  } catch (error) {
    next(error);
  }
};

module.exports = { getTenantDetails };
