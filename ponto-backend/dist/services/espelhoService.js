"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularTerceiroDiaUtil = exports.gerarEspelhoPDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../config/database"));
const FERIADOS_NACIONAIS_2026 = [
    '2026-01-01', '2026-04-21', '2026-05-01', '2026-09-07',
    '2026-10-12', '2026-11-02', '2026-11-15', '2026-12-25'
];
const gerarEspelhoPDF = async (usuarioId, mes) => {
    const [year, month] = mes.split('-').map(Number);
    const usuario = await database_1.default.usuario.findUnique({
        where: { id: usuarioId },
        include: { unidade: { include: { empresa: true } } }
    });
    if (!usuario) {
        throw new Error('Usuário não encontrado');
    }
    const inicio = (0, date_fns_1.startOfMonth)(new Date(year, month - 1));
    const fim = (0, date_fns_1.endOfMonth)(new Date(year, month - 1));
    const marcacoes = await database_1.default.marcacao.findMany({
        where: {
            usuarioId,
            dataHoraLocal: { gte: inicio, lte: fim }
        },
        orderBy: { dataHoraLocal: 'asc' }
    });
    const marcacoesPorData = marcacoes.reduce((acc, m) => {
        const data = (0, date_fns_1.format)(m.dataHoraLocal, 'yyyy-MM-dd');
        if (!acc[data])
            acc[data] = [];
        acc[data].push(m);
        return acc;
    }, {});
    const assinatura = await database_1.default.assinaturaPonto.findUnique({
        where: { usuarioId_mesReferencia: { usuarioId, mesReferencia: mes } }
    });
    const doc = new pdfkit_1.default({ margin: 50 });
    doc.fontSize(16).font('Helvetica-Bold').text('ESPELHO DE PONTO ELETRÔNICO', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica');
    doc.text(`Empresa: ${usuario.unidade.empresa?.nome || 'Empresa'}`);
    doc.text(`CNPJ: 00.000.000/0001-00`);
    doc.text(`Endereço: ${usuario.unidade.endereco || '-'}`);
    doc.moveDown();
    doc.text(`Funcionário: ${usuario.nome}`);
    doc.text(`CPF: ${usuario.cpf}`);
    doc.text(`Cargo: Colaborador`);
    doc.text(`Unidade: ${usuario.unidade.nome}`);
    doc.moveDown();
    doc.text(`Mês de Referência: ${(0, date_fns_1.format)(inicio, 'MMMM/yyyy', { locale: locale_1.ptBR })}`, { align: 'center' });
    doc.moveDown(2);
    const tableTop = doc.y;
    const colWidths = [60, 70, 70, 80, 70, 60];
    const headers = ['Data', 'Entrada', 'Sai. Almoço', 'Ret. Almoço', 'Saída', 'Total'];
    doc.font('Helvetica-Bold').fontSize(9);
    let xPos = 50;
    headers.forEach((header, i) => {
        doc.text(header, xPos, tableTop, { width: colWidths[i], align: 'center' });
        xPos += colWidths[i];
    });
    doc.moveTo(50, tableTop + 15).lineTo(doc.page.width - 50, tableTop + 15).stroke();
    doc.font('Helvetica').fontSize(8);
    let yPos = tableTop + 20;
    const diasuteis = (0, date_fns_1.eachDayOfInterval)({ start: inicio, end: fim }).filter(d => {
        if ((0, date_fns_1.isWeekend)(d))
            return false;
        const dataStr = (0, date_fns_1.format)(d, 'yyyy-MM-dd');
        return !FERIADOS_NACIONAIS_2026.includes(dataStr);
    });
    let totalHoras = 0;
    for (const dia of diasuteis) {
        if (yPos > 700) {
            doc.addPage();
            yPos = 50;
        }
        const dataStr = (0, date_fns_1.format)(dia, 'yyyy-MM-dd');
        const marcas = marcacoesPorData[dataStr] || [];
        const entrada = marcas.find(m => m.tipo === 'ENTRADA');
        const saidaAlmoco = marcas.find(m => m.tipo === 'SAIDA_ALMOCO');
        const retornoAlmoco = marcas.find(m => m.tipo === 'RETORNO_ALMOCO');
        const saida = marcas.find(m => m.tipo === 'SAIDA');
        const formatarHora = (m) => m ? (0, date_fns_1.format)((0, date_fns_1.parseISO)(m.dataHoraLocal.toISOString()), 'HH:mm') : '-';
        let totalDia = '';
        if (entrada && saidaAlmoco && retornoAlmoco && saida) {
            const manha = (0, date_fns_1.differenceInMinutes)((0, date_fns_1.parseISO)(saidaAlmoco.dataHoraLocal.toISOString()), (0, date_fns_1.parseISO)(entrada.dataHoraLocal.toISOString()));
            const tarde = (0, date_fns_1.differenceInMinutes)((0, date_fns_1.parseISO)(saida.dataHoraLocal.toISOString()), (0, date_fns_1.parseISO)(retornoAlmoco.dataHoraLocal.toISOString()));
            const totalMin = manha + tarde;
            totalHoras += totalMin;
            const horas = Math.floor(totalMin / 60);
            const mins = totalMin % 60;
            totalDia = `${horas}h${mins.toString().padStart(2, '0')}m`;
        }
        xPos = 50;
        doc.text((0, date_fns_1.format)(dia, 'dd/MM/yyyy'), xPos, yPos, { width: colWidths[0], align: 'center' });
        xPos += colWidths[0];
        doc.text(formatarHora(entrada), xPos, yPos, { width: colWidths[1], align: 'center' });
        xPos += colWidths[1];
        doc.text(formatarHora(saidaAlmoco), xPos, yPos, { width: colWidths[2], align: 'center' });
        xPos += colWidths[2];
        doc.text(formatarHora(retornoAlmoco), xPos, yPos, { width: colWidths[3], align: 'center' });
        xPos += colWidths[3];
        doc.text(formatarHora(saida), xPos, yPos, { width: colWidths[4], align: 'center' });
        xPos += colWidths[4];
        doc.text(totalDia, xPos, yPos, { width: colWidths[5], align: 'center' });
        yPos += 15;
    }
    doc.moveTo(50, yPos + 5).lineTo(doc.page.width - 50, yPos + 5).stroke();
    yPos += 15;
    const totalHorasFormat = `${Math.floor(totalHoras / 60)}h${(totalHoras % 60).toString().padStart(2, '0')}m`;
    doc.font('Helvetica-Bold').text(`Total de horas trabalhadas: ${totalHorasFormat}`, 50, yPos);
    yPos += 40;
    doc.font('Helvetica').fontSize(10);
    doc.text('Assinatura do Funcionário:', 50, yPos);
    doc.moveTo(50, yPos + 25).lineTo(250, yPos + 25).stroke();
    if (assinatura) {
        doc.fontSize(8).text(`Assinado em: ${(0, date_fns_1.format)((0, date_fns_1.parseISO)(assinatura.assinadoEm.toISOString()), 'dd/MM/yyyy HH:mm')}`, 50, yPos + 30);
        doc.text(`Hash: ${assinatura.hashEspelho.substring(0, 16)}...`, 50, yPos + 42);
    }
    else {
        doc.fontSize(8).text('Pendente de assinatura', 50, yPos + 30);
    }
    const pdfBuffer = await new Promise((resolve) => {
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
    const hash = crypto_1.default.createHash('sha256').update(pdfBuffer).digest('hex');
    return { pdf: doc, hash };
};
exports.gerarEspelhoPDF = gerarEspelhoPDF;
const calcularTerceiroDiaUtil = (ano, mes) => {
    let dia = (0, date_fns_1.startOfMonth)(new Date(ano, mes - 1));
    for (let i = 0; i < 3; i++) {
        const dataStr = (0, date_fns_1.format)(dia, 'yyyy-MM-dd');
        while ((0, date_fns_1.isWeekend)(dia) || FERIADOS_NACIONAIS_2026.includes(dataStr)) {
            dia = (0, date_fns_1.addDays)(dia, 1);
        }
        if (i < 2)
            dia = (0, date_fns_1.addDays)(dia, 1);
    }
    return dia;
};
exports.calcularTerceiroDiaUtil = calcularTerceiroDiaUtil;
//# sourceMappingURL=espelhoService.js.map