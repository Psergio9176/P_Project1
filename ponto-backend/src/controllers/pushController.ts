import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../middlewares/auth';

const webpush = require('web-push') as typeof import('web-push');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:notifications@exemplo.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export const getVapidPublicKey = (_req: Request, res: Response): void => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
};

export const subscribe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    await prisma.pushSubscription.upsert({
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
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Erro ao salvar subscription' });
  }
};

export const unsubscribe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { endpoint } = req.body;

    await prisma.pushSubscription.deleteMany({
      where: {
        usuarioId: req.usuario.id,
        endpoint
      }
    });

    res.json({ message: 'Subscription removido com sucesso' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Erro ao remover subscription' });
  }
};

export const enviarLembrete = async (usuarioId: string, mensagem: string): Promise<void> => {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { usuarioId }
    });

    for (const sub of subscriptions) {
      const payload = JSON.stringify({
        title: 'Lembrete de Ponto',
        body: mensagem,
        icon: '/pwa-192x192.png',
        tag: 'lembrete-ponto'
      });

      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
        payload
      ).catch(console.error);
    }
  } catch (error) {
    console.error('Enviar lembrete error:', error);
  }
};
