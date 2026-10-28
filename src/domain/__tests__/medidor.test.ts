import { periodoDe } from '@/domain/lectura';
import { parseMedidor, validarCodigoMedidor } from '@/domain/medidor';
import { autenticar } from '@/domain/tecnicos';

describe('R2: código del medidor', () => {
  it('acepta MED- seguido de seis dígitos (también en minúsculas)', () => {
    expect(validarCodigoMedidor('MED-000123')).toEqual({ ok: true, codigo: 'MED-000123' });
    expect(validarCodigoMedidor(' med-000123 ')).toEqual({ ok: true, codigo: 'MED-000123' });
  });

  it.each(['', 'MED-', 'MED-12345', 'MED-1234567', 'MED-12A456', 'MDE-123456', '123456', 'MED 123456'])(
    'rechaza "%s"',
    (codigo) => {
      expect(validarCodigoMedidor(codigo).ok).toBe(false);
    },
  );

  it('dice cuántos dígitos faltan', () => {
    const r = validarCodigoMedidor('MED-1234');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('faltan 2');
  });
});

describe('parseMedidor', () => {
  it('convierte números que llegan como texto', () => {
    const m = parseMedidor({
      id: '1',
      codigo: 'MED-000101',
      ultimaLectura: '1520',
      consumoPromedio: '18.5',
    });
    expect(m?.ultimaLectura).toBe(1520);
    expect(m?.consumoPromedio).toBe(18.5);
  });
  it('descarta registros con código inválido', () => {
    expect(parseMedidor({ codigo: 'X' })).toBeNull();
  });
});

describe('periodo y técnicos', () => {
  it('el periodo es año-mes', () => {
    expect(periodoDe(new Date(2026, 9, 28))).toBe('2026-10');
    expect(periodoDe(new Date(2026, 0, 2))).toBe('2026-01');
  });
  it('R1: autentica con código y clave, sin devolver la clave', () => {
    const t = autenticar('emp-1001', 'agua2026');
    expect(t?.nombre).toBe('María Guamán');
    expect(t).not.toHaveProperty('clave');
    expect(autenticar('EMP-1001', 'otra')).toBeNull();
  });
});
