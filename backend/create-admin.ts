import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const password_hash = await bcrypt.hash('12345678', 10);
  
  const admin = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'tomasbalestrin@gmail.com',
      password_hash,
      name: 'Tomas Balestrin',
      role: 'ADMIN',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  console.log('✅ Admin criado com sucesso!');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Senha: 12345678');
  console.log('👤 Nome:', admin.name);
  console.log('🎭 Role:', admin.role);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
