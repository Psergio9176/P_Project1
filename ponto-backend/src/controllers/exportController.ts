import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import prisma from '../config/database';

export const exportarMarcacoes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataInicio, dataFim, usuarioId, formato = 'xlsx' } = req.query;

    const where: Record<string, unknown> = {};

    if (dataInicio || dataFim) {
      where.dataHoraLocal = {};
      if (dataInicio) (where.dataHoraLocal as Record<string, Date>).gte = new Date(dataInicio as string);
      if (dataFim) (where.dataHoraLocal as Record<string, Date>).lte = new Date(dataFim as string);
    }

    if (usuarioId) where.usuarioId = usuarioId;

    const marcacoes = await prisma.marcacao.findMany({
      where,
      include: {
        usuario: { select: { nome: true, cpf: true } }
      },
      orderBy: [
        { usuario: { nome: 'asc' } },
        { dataHoraLocal: 'asc' }
      ]
    });

    const marcacoesAgrupadas = marcacoes.reduce((acc, m) => {
      const key = m.usuarioId;
      if (!acc[key]) {
        acc[key] = { usuario: m.usuario, marcacoes: [] };
      }
      acc[key].marcacoes.push(m);
      return acc;
    }, {} as Record<string, { usuario: { nome: string; cpf: string }; marcacoes: typeof marcacoes }>);

    if (formato === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="marcacoes.csv"');

      let csv = 'Nome;CPF;Data;Entrada;Saída Almoço;Retorno Almoço;Saída\n';

      Object.values(marcacoesAgrupadas).forEach(({ usuario, marcacoes }) => {
        const porData: Record<string, Record<string, Date | null>> = {};

        marcacoes.forEach(m => {
          const data = m.dataHoraLocal.toISOString().split('T')[0];
          if (!porData[data]) {
            porData[data] = { ENTRADA: null, SAIDA_ALMOCO: null, RETORNO_ALMOCO: null, SAIDA: null };
          }
          porData[data][m.tipo] = m.dataHoraLocal;
        });

        Object.entries(porData).forEach(([data, marcas]) => {
          const formatar = (d: Date | null) => d ? d.toLocaleTimeString('pt-BR') : '';
          csv += `${usuario.nome};${usuario.cpf};${data};${formatar(marcas.ENTRADA)};${formatar(marcas.SAIDA_ALMOCO)};${formatar(marcas.RETORNO_ALMOCO)};${formatar(marcas.SAIDA)}\n`;
        });
      });

      res.send(csv);
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Marcações');

    worksheet.columns = [
      { header: 'Nome', key: 'nome', width: 30 },
      { header: 'CPF', key: 'cpf', width: 15 },
      { header: 'Data', key: 'data', width: 12 },
      { header: 'Entrada', key: 'entrada', width: 12 },
      { header: 'Saída Almoço', key: 'saidaAlmoco', width: 15 },
      { header: 'Retorno Almoço', key: 'retornoAlmoco', width: 15 },
      { header: 'Saída', key: 'saida', width: 12 }
    ];

    Object.values(marcacoesAgrupadas).forEach(({ usuario, marcacoes }) => {
      const porData: Record<string, Record<string, Date | null>> = {};

      marcacoes.forEach(m => {
        const data = m.dataHoraLocal.toISOString().split('T')[0];
        if (!porData[data]) {
          porData[data] = { ENTRADA: null, SAIDA_ALMOCO: null, RETORNO_ALMOCO: null, SAIDA: null };
        }
        porData[data][m.tipo] = m.dataHoraLocal;
      });

      Object.entries(porData).forEach(([data, marcas]) => {
        const formatar = (d: Date | null) => d ? d.toLocaleTimeString('pt-BR') : '-';
        worksheet.addRow({
          nome: usuario.nome,
          cpf: usuario.cpf,
          data,
          entrada: formatar(marcas.ENTRADA),
          saidaAlmoco: formatar(marcas.SAIDA_ALMOCO),
          retornoAlmoco: formatar(marcas.RETORNO_ALMOCO),
          saida: formatar(marcas.SAIDA)
        });
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="marcacoes.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Exportar marcacoes error:', error);
    res.status(500).json({ error: 'Erro ao exportar marcações' });
  }
};
