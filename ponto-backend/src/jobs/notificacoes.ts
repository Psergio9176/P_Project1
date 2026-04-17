import cron from 'node-cron';
import prisma from '../config/database';
import { enviarLembrete } from '../controllers/pushController';

const HORARIOS_LEMBRETE = ['08:00', '12:00', '13:00', '17:00'];

export const iniciarJobsNotificacoes = () => {
  for (const horario of HORARIOS_LEMBRETE) {
    const [hora, minuto] = horario.split(':');
    
    cron.schedule(`${minuto} ${hora} * * 1-6`, async () => {
      await enviarLembretesPendentes();
    });
  }

  cron.schedule('0 18 * * 1-6', async () => {
    await enviarNotificacoesFimExpediente();
  });

  console.log('Jobs de notificações agendados');
};

async function enviarLembretesPendentes(): Promise<void> {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { ativo: true },
      include: { marcacoes: {
        where: {
          dataHoraLocal: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }}
    });

    const horaAtual = new Date().getHours();

    for (const usuario of usuarios) {
      const marcacoesFeitas = usuario.marcacoes.map(m => m.tipo);
      
      let mensagem: string | null = null;

      if (horaAtual === 8 && !marcacoesFeitas.includes('ENTRADA')) {
        mensagem = 'Bom dia! Não esqueça de registrar sua entrada.';
      } else if (horaAtual === 12 && !marcacoesFeitas.includes('SAIDA_ALMOCO')) {
        mensagem = 'Hora do almoço! Registre sua saída.';
      } else if (horaAtual === 13 && !marcacoesFeitas.includes('RETORNO_ALMOCO')) {
        mensagem = 'Bom retorno! Registre sua volta do almoço.';
      } else if (horaAtual === 17 && !marcacoesFeitas.includes('SAIDA')) {
        mensagem = 'Quase no fim do expediente! Registre sua saída.';
      }

      if (mensagem) {
        await enviarLembrete(usuario.id, mensagem);
      }
    }
  } catch (error) {
    console.error('Erro ao enviar lembretes pendentes:', error);
  }
}

async function enviarNotificacoesFimExpediente(): Promise<void> {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { ativo: true },
      include: { marcacoes: {
        where: {
          dataHoraLocal: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }}
    });

    for (const usuario of usuarios) {
      const marcacoesFeitas = usuario.marcacoes.map(m => m.tipo);
      const faltantes: string[] = [];

      if (!marcacoesFeitas.includes('ENTRADA')) faltantes.push('Entrada');
      if (!marcacoesFeitas.includes('SAIDA_ALMOCO')) faltantes.push('Saída Almoço');
      if (!marcacoesFeitas.includes('RETORNO_ALMOCO')) faltantes.push('Retorno Almoço');
      if (!marcacoesFeitas.includes('SAIDA')) faltantes.push('Saída');

      if (faltantes.length > 0) {
        const mensagem = `Você ainda não registrou: ${faltantes.join(', ')}. Faça agora para manter seu ponto em dia!`;
        await enviarLembrete(usuario.id, mensagem);
      }
    }
  } catch (error) {
    console.error('Erro ao enviar notificações de fim de expediente:', error);
  }
}
