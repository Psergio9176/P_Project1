import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const empresa = await prisma.empresa.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nome: 'Empresa Demo'
    }
  });

  console.log(`Empresa criada: ${empresa.nome}`);

  const unidade = await prisma.unidade.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      nome: 'Sede',
      endereco: 'Rua Exemplo, 123 - São Paulo, SP',
      latitude: -23.5505,
      longitude: -46.6333,
      empresaId: empresa.id
    }
  });

  console.log(`Unidade criada: ${unidade.nome}`);

  const senhaHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.upsert({
    where: { cpf: '00000000000' },
    update: {},
    create: {
      cpf: '00000000000',
      nome: 'Administrador',
      email: 'admin@empresa.com',
      senhaHash,
      perfil: 'ADMIN',
      tipoJornada: 'PADRAO',
      unidadeId: unidade.id,
      ativo: true
    }
  });

  console.log(`Admin criado: ${admin.nome} (CPF: ${admin.cpf}, Senha: admin123)`);

  const senhaHashColaborador = await bcrypt.hash('colab123', 10);

  const colaborador = await prisma.usuario.upsert({
    where: { cpf: '11111111111' },
    update: {},
    create: {
      cpf: '11111111111',
      nome: 'João Silva',
      email: 'joao@empresa.com',
      senhaHash: senhaHashColaborador,
      perfil: 'COLABORADOR',
      tipoJornada: 'PADRAO',
      unidadeId: unidade.id,
      ativo: true
    }
  });

  console.log(`Colaborador criado: ${colaborador.nome} (CPF: ${colaborador.cpf}, Senha: colab123)`);

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
