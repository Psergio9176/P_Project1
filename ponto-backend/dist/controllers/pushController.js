"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarLembrete = exports.unsubscribe = exports.subscribe = exports.getVapidPublicKey = void 0;
const database_1 = __importDefault(require("../config/database"));
const webpush = require('web-push');
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails('mailto:notifications@exemplo.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}
const getVapidPublicKey = (_req, res) => {
    res.json({ publicKey: VAPID_PUBLIC_KEY });
};
exports.getVapidPublicKey = getVapidPublicKey;
const subscribe = async (req, res) => {
    try {
        if (!req.usuario) {
            res.status(401).json({ error: 'Não autenticado' });
            return;
        }
        const { endpoint, keys } = req.body;
        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            res.status(400).json({ error: 'Dados de subscription incompletos' });
            return;
        }
        await database_1.default.pushSubscription.upsert({
            where: {
                usuarioId_endpoint: {
                    usuarioId: req.usuario.id,
                    endpoint
                }
            },
            update: { keys },
            create: {
                usuarioId: req.usuario.id,
                endpoint,
                keys
            }
        });
        res.json({ message: 'Subscription salvo com sucesso' });
    }
    catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ error: 'Erro ao salvar subscription' });
    }
};
exports.subscribe = subscribe;
const unsubscribe = async (req, res) => {
    try {
        if (!req.usuario) {
            res.status(401).json({ error: 'Não autenticado' });
            return;
        }
        const { endpoint } = req.body;
        await database_1.default.pushSubscription.deleteMany({
            where: {
                usuarioId: req.usuario.id,
                endpoint
            }
        });
        res.json({ message: 'Subscription removido com sucesso' });
    }
    catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ error: 'Erro ao remover subscription' });
    }
};
exports.unsubscribe = unsubscribe;
const enviarLembrete = async (usuarioId, mensagem) => {
    try {
        const subscriptions = await database_1.default.pushSubscription.findMany({
            where: { usuarioId }
        });
        for (const sub of subscriptions) {
            const payload = JSON.stringify({
                title: 'Lembrete de Ponto',
                body: mensagem,
                icon: '/pwa-192x192.png',
                tag: 'lembrete-ponto'
            });
            await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload).catch(console.error);
        }
    }
    catch (error) {
        console.error('Enviar lembrete error:', error);
    }
};
exports.enviarLembrete = enviarLembrete;
//# sourceMappingURL=pushController.js.map