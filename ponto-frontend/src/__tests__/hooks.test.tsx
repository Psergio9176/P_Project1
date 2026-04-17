import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useGeolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar estado inicial corretamente', async () => {
    const { useGeolocation } = await import('../hooks/useGeolocation');
    const hook = useGeolocation();
    
    expect(hook.latitude).toBeNull();
    expect(hook.longitude).toBeNull();
    expect(hook.accuracy).toBeNull();
    expect(hook.error).toBeNull();
    expect(hook.loading).toBe(false);
  });
});

describe('useOnlineStatus', () => {
  it('deve retornar true quando online', async () => {
    Object.defineProperty(window.navigator, 'onLine', { value: true, writable: true });
    
    const { useOnlineStatus } = await import('../hooks/useOnlineStatus');
    const isOnline = useOnlineStatus();
    
    expect(isOnline).toBe(true);
  });

  it('deve retornar false quando offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', { value: false, writable: true });
    
    const { useOnlineStatus } = await import('../hooks/useOnlineStatus');
    const isOnline = useOnlineStatus();
    
    expect(isOnline).toBe(false);
  });
});
