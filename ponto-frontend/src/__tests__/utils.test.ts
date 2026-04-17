import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('CPF Validation', () => {
  const validarCpf = (cpf: string): boolean => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;

    let sum = 0;
    let remainder: number;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(digits[i - 1]) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (parseInt(digits[9]) !== remainder) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(digits[i - 1]) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (parseInt(digits[10]) !== remainder) return false;

    return true;
  };

  it('deve validar CPF correto', () => {
    expect(validarCpf('111.444.777-35')).toBe(true);
    expect(validarCpf('12345678909')).toBe(true);
  });

  it('deveInvalidar CPF com menos de 11 digitos', () => {
    expect(validarCpf('1234567890')).toBe(false);
    expect(validarCpf('123')).toBe(false);
  });

  it('deveInvalidar CPF com digitos repetidos', () => {
    expect(validarCpf('111.111.111-11')).toBe(false);
    expect(validarCpf('000.000.000-00')).toBe(false);
  });
});

describe('Date Formatting', () => {
  const formatarData = (date: Date): string => {
    return date.toLocaleDateString('pt-BR');
  };

  const formatarHora = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  it('deve formatar data em pt-BR', () => {
    const date = new Date('2026-04-15T10:30:00');
    expect(formatarData(date)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('deve formatar hora em pt-BR', () => {
    const date = new Date('2026-04-15T10:30:00');
    expect(formatarHora(date)).toMatch(/\d{2}:\d{2}/);
  });
});
