import * as bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '../../generated/prisma/client';
import { nowBrasilia } from '../../src/core/utils/date-utils';

export async function seedUsers(prisma: PrismaClient) {
  const users = [
    {
      name: 'Root',
      username: 'root',
      password: 'impostoeroubo',
      role: UserRole.admin,
    },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: {
        name: user.name,
        username: user.username,
        passwordHash,
        role: user.role,
        isActive: true,
        updatedAt: nowBrasilia(),
        createdAt: nowBrasilia(),
      },
    });
  }

  console.log('✓ Users seed');
}
