import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin inicial
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@seudominio.com.br';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMeOnFirstLogin123!';
  const adminName = process.env.ADMIN_NAME || 'Administrador';

  // Verificar se o admin já existe
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ Usuário admin já existe: ${adminEmail}`);
  } else {
    // Hash da senha
    const password_hash = await bcrypt.hash(adminPassword, 10);

    // Criar admin
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password_hash,
        name: adminName,
        role: 'ADMIN',
        is_active: true,
      },
    });

    console.log(`✅ Usuário admin criado com sucesso!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Senha: ${adminPassword}`);
    console.log(`   🔒 IMPORTANTE: Altere esta senha após o primeiro login!`);
  }

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
