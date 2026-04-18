const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testando conexão com o banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar uma query simples
    const count = await prisma.usuario.count();
    console.log(`✅ Query executada! Total de usuários: ${count}`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    process.exit(1);
  }
}

testConnection();