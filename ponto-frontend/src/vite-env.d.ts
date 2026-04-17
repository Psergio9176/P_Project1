/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

interface PushEvent extends ExtendableEvent {
  readonly data: { json(): any } | null;
}

interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}

interface NotificationEvent extends ExtendableEvent {
  readonly action: string;
  notification: {
    close(): void;
  };
}