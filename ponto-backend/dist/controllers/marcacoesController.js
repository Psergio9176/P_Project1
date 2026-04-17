"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hoje = exports.listar = exports.syncBatch = exports.registrar = void 0;
const database_1 = __importDefault(require("../config/database"));
const ORDEM_MARCACOES_PADRAO = ['ENTRADA', 'SAIDA_ALMOCO', 'RETORNO_ALMOCO', 'SAIDA'];
const ORDEM_MARCACOES_REDUZIDA = ['ENTRADA', 'SAIDA'];
const getProximaMarcacao = (marcacoes, tipoJornada) => {
    const ordem = tipoJornada === 'REDUZIDA' ? ORDEM_MARCACOES_REDUZIDA : ORDEM_MARCACOES_PADRAO;
    const ultimoTipo = marcacoes[marcacoes.length - 1];
    const ultimoIndex = ordem.indexOf(ultimoTipo);
    if (ultimoIndex === -1 || ultimoIndex === ordem.length - 1) {
        return null;
    }
    return ordem[ultimoIndex + 1];
};
const registrar = async (req, res) => {
    try {
        if (!req.usuario) {
            res.status(401).json({ error: 'Não autenticado' });
            return;
        }
        const { tipo, dataHoraUtc, dataHoraLocal, latitude, longitude, acuraciaGps, userAgent, offline } = req.body;
        if (!tipo || !dataHoraUtc || !dataHoraLocal || latitude === undefined || longitude === undefined) {
            res.status(400).json({ error: 'Dados incompletos para registro de marcação' });
            return;
        }
        const usuario = await database_1.default.usuario.findUnique({
            where: { id: req.usuario.id }
        });
        if (!usuario) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        const dataReferencia = new Date(dataHoraLocal);
        const inicioDia = new Date(dataReferencia);
        inicioDia.setHours(0, 0, 0, 0);
        const fimDia = new Date(dataReferencia);
        fimDia.setHours(23, 59, 59, 999);
        const marcacoesDia = await database_1.default.marcacao.findMany({
            where: {
                usuarioId: req.usuario.id,
                dataHoraLocal: { gte: inicioDia, lte: fimDia }
            },
            orderBy: { dataHoraLocal: 'asc' }
        });
        const tiposExistentes = marcacoesDia.map(m => m.tipo);
        if (tiposExistentes.includes(tipo)) {
            res.status(400).json({ error: `Já existe marcação de ${tipo} para este dia` });
            return;
        }
        const tipoJornada = usuario.tipoJornada;
        const ordem = tipoJornada === 'REDUZIDA' ? ORDEM_MARCACOES_REDUZIDA : ORDEM_MARCACOES_PADRAO;
        const esperado = getProximaMarcacao(tiposExistentes, tipoJornada);
        if (esperado && esperado !== tipo) {
            res.status(400).json({ error: `Esperado registro de ${esperado}` });
            return;
        }
        const marcacao = await database_1.default.marcacao.create({
            data: {
                usuarioId: req.usuario.id,
                tipo,
                dataHoraUtc: new Date(dataHoraUtc),
                dataHoraLocal: new Date(dataHoraLocal),
                latitude,
                longitude,
                acuraciaGps,
                userAgent,
                offline: offline || false
            }
        });
        res.status(201).json({
            id: marcacao.id,
            tipo: marcacao.tipo,
            dataHoraLocal: marcacao.dataHoraLocal,
            latitude: marcacao.latitude,
            longitude: marcacao.longitude,
            comprovante: {
                tipo,
                dataHora: marcacao.dataHoraLocal,
                location: `https://www.google.com/maps?q=${latitude},${longitude}`
            }
        });
    }
    catch (error) {
        console.error('Registrar marcacao error:', error);
        res.status(500).json({ error: 'Erro ao registrar marcação' });
    }
};
exports.registrar = registrar;
const syncBatch = async (req, res) => {
    try {
        if (!req.usuario) {
            res.status(401).json({ error: 'Não autenticado' });
            return;
        }
        const { marcacoes } = req.body;
        if (!Array.isArray(marcacoes) || marcacoes.length === 0) {
            res.status(400).json({ error: 'Array de marcações é obrigatório' });
            return;
        }
        const resultados = [];
        for (const m of marcacoes) {
            try {
                const existente = await database_1.default.marcacao.findFirst({
                    where: {
                        usuarioId: req.usuario.id,
                        tipo: m.tipo,
                        dataHoraLocal: {
                            gte: new Date(new Date(m.dataHoraLocal).setHours(0, 0, 0, 0)),
                            lte: new Date(new Date(m.dataHoraLocal).setHours(23, 59, 59, 999))
                        }
                    }
                });
                if (existente) {
                    resultados.push({ ...m, sucesso: false, erro: 'Já existe marcação para este dia' });
                    continue;
                }
                const marcacao = await database_1.default.marcacao.create({
                    data: {
                        usuarioId: req.usuario.id,
                        tipo: m.tipo,
                        dataHoraUtc: new Date(m.dataHoraUtc),
                        dataHoraLocal: new Date(m.dataHoraLocal),
                        latitude: m.latitude,
                        longitude: m.longitude,
                        acuraciaGps: m.acuraciaGps,
                        userAgent: m.userAgent,
                        offline: true,
                        sincronizado: true
                    }
                });
                resultados.push({ ...m, sucesso: true, id: marcacao.id });
            }
            catch (err) {
                resultados.push({ ...m, sucesso: false, erro: 'Erro ao processar' });
            }
        }
        res.json({ resultados });
    }
    catch (error) {
        console.error('Sync batch error:', error);
        res.status(500).json({ error: 'Erro ao sincronizar marcações' });
    }
};
exports.syncBatch = syncBatch;
const listar = async (req, res) => {
    try {
        const { dataInicio, dataFim, usuarioId } = req.query;
        const where = {};
        if (dataInicio || dataFim) {
            where.dataHoraLocal = {};
            if (dataInicio)
                where.dataHoraLocal.gte = new Date(dataInicio);
            if (dataFim)
                where.dataHoraLocal.lte = new Date(dataFim);
        }
        if (usuarioId)
            where.usuarioId = usuarioId;
        const marcacoes = await database_1.default.marcacao.findMany({
            where,
            include: { usuario: { select: { id: true, nome: true, cpf: true } } },
            orderBy: { dataHoraLocal: 'desc' }
        });
        res.json(marcacoes);
    }
    catch (error) {
        console.error('Listar marcacoes error:', error);
        res.status(500).json({ error: 'Erro ao listar marcações' });
    }
};
exports.listar = listar;
const hoje = async (req, res) => {
    try {
        if (!req.usuario) {
            res.status(401).json({ error: 'Não autenticado' });
            return;
        }
        const usuario = await database_1.default.usuario.findUnique({
            where: { id: req.usuario.id }
        });
        if (!usuario) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        const hoje = new Date();
        const inicioDia = new Date(hoje);
        inicioDia.setHours(0, 0, 0, 0);
        const fimDia = new Date(hoje);
        fimDia.setHours(23, 59, 59, 999);
        const marcacoes = await database_1.default.marcacao.findMany({
            where: {
                usuarioId: req.usuario.id,
                dataHoraLocal: { gte: inicioDia, lte: fimDia }
            },
            orderBy: { dataHoraLocal: 'asc' }
        });
        const tiposMarcados = marcacoes.map(m => m.tipo);
        const tipoJornada = usuario.tipoJornada;
        const ordem = tipoJornada === 'REDUZIDA' ? ORDEM_MARCACOES_REDUZIDA : ORDEM_MARCACOES_PADRAO;
        res.json({
            data: hoje,
            tipoJornada,
            marcacoes: marcacoes.map(m => ({
                id: m.id,
                tipo: m.tipo,
                dataHora: m.dataHoraLocal,
                latitude: m.latitude,
                longitude: m.longitude
            })),
            proximaMarcacao: getProximaMarcacao(tiposMarcados, tipoJornada),
            todasFeitas: getProximaMarcacao(tiposMarcados, tipoJornada) === null
        });
    }
    catch (error) {
        console.error('Hoje marcacao error:', error);
        res.status(500).json({ error: 'Erro ao buscar marcações do dia' });
    }
};
exports.hoje = hoje;
//# sourceMappingURL=marcacoesController.js.map