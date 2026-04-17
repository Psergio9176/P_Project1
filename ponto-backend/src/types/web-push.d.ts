declare module 'web-push' {
  export interface VapidKeys {
    publicKey: string;
    privateKey: string;
  }

  export interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function generateVAPIDKeys(): VapidKeys;

  export function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer | null,
    options?: {
      TTL?: number;
      vapidDetails?: {
        subject: string;
        publicKey: string;
        privateKey: string;
      };
      headers?: Record<string, string>;
    }
  ): Promise<unknown>;

  export function setGCMAPIKey(key: string): void;
}
