"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarJobsNotificacoes = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = __importDefault(require("../config/database"));
const pushController_1 = require("../controllers/pushController");
const HORARIOS_LEMBRETE = ['08:00', '12:00', '13:00', '17:00'];
const iniciarJobsNotificacoes = () => {
    for (const horario of HORARIOS_LEMBRETE) {
        const [hora, minuto] = horario.split(':');
        node_cron_1.default.schedule(`${minuto} ${hora} * * 1-6`, async () => {
            await enviarLembretesPendentes();
        });
    }
    node_cron_1.default.schedule('0 18 * * 1-6', async () => {
        await enviarNotificacoesFimExpediente();
    });
    console.log('Jobs de notificações agendados');
};
exports.iniciarJobsNotificacoes = iniciarJobsNotificacoes;
async function enviarLembretesPendentes() {
    try {
        const usuarios = await database_1.default.usuario.findMany({
            where: { ativo: true },
            include: { marcacoes: {
                    where: {
                        dataHoraLocal: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                            lte: new Date(new Date().setHours(23, 59, 59, 999))
                        }
                    }
                } }
        });
        const horaAtual = new Date().getHours();
        for (const usuario of usuarios) {
            const marcacoesFeitas = usuario.marcacoes.map(m => m.tipo);
            let mensagem = null;
            if (horaAtual === 8 && !marcacoesFeitas.includes('ENTRADA')) {
                mensagem = 'Bom dia! Não esqueça de registrar sua entrada.';
            }
            else if (horaAtual === 12 && !marcacoesFeitas.includes('SAIDA_ALMOCO')) {
                mensagem = 'Hora do almoço! Registre sua saída.';
            }
            else if (horaAtual === 13 && !marcacoesFeitas.includes('RETORNO_ALMOCO')) {
                mensagem = 'Bom retorno! Registre sua volta do almoço.';
            }
            else if (horaAtual === 17 && !marcacoesFeitas.includes('SAIDA')) {
                mensagem = 'Quase no fim do expediente! Registre sua saída.';
            }
            if (mensagem) {
                await (0, pushController_1.enviarLembrete)(usuario.id, mensagem);
            }
        }
    }
    catch (error) {
        console.error('Erro ao enviar lembretes pendentes:', error);
    }
}
async function enviarNotificacoesFimExpediente() {
    try {
        const usuarios = await database_1.default.usuario.findMany({
            where: { ativo: true },
            include: { marcacoes: {
                    where: {
                        dataHoraLocal: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                            lte: new Date(new Date().setHours(23, 59, 59, 999))
                        }
                    }
                } }
        });
        for (const usuario of usuarios) {
            const marcacoesFeitas = usuario.marcacoes.map(m => m.tipo);
            const faltantes = [];
            if (!marcacoesFeitas.includes('ENTRADA'))
                faltantes.push('Entrada');
            if (!marcacoesFeitas.includes('SAIDA_ALMOCO'))
                faltantes.push('Saída Almoço');
            if (!marcacoesFeitas.includes('RETORNO_ALMOCO'))
                faltantes.push('Retorno Almoço');
            if (!marcacoesFeitas.includes('SAIDA'))
                faltantes.push('Saída');
            if (faltantes.length > 0) {
                const mensagem = `Você ainda não registrou: ${faltantes.join(', ')}. Faça agora para manter seu ponto em dia!`;
                await (0, pushController_1.enviarLembrete)(usuario.id, mensagem);
            }
        }
    }
    catch (error) {
        console.error('Erro ao enviar notificações de fim de expediente:', error);
    }
}
//# sourceMappingURL=notificacoes.js.map