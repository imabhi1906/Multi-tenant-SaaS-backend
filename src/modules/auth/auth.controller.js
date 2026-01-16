const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../utils/prisma');
const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
});

const signup = async (req, res, next) => {
  try {
    const validatedData = signupSchema.parse(req.body);

    // Create Tenant and Tenant Admin User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.name,
        },
      });

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          role: 'TENANT_ADMIN',
          tenant_id: tenant.id,
        },
      });

      return { tenant, user };
    });

    res.status(201).json({
      message: 'Tenant and Admin created successfully',
      data: {
        tenantId: result.tenant.id,
        userId: result.user.id,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        user_id: user.id,
        tenant_id: user.tenant_id,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login };
