// R9: la lectura llega una sola vez aunque la señal se corte durante el envío.
// Se simula la oficina y la base local en memoria. (Las variables usadas
// dentro de jest.mock deben empezar con "mock".)

import type { LecturaLocal } from '@/domain/lectura';

const mockOficina: { lecturas: { id: string; clientId: string; medidorCodigo: string; periodo: string; tecnicoCodigo: string; registradaEn: string }[]; cortarRespuesta: boolean; sinRed: boolean } = {
  lecturas: [],
  cortarRespuesta: false,
  sinRed: false,
};
const mockLocal = new Map<string, LecturaLocal>();

class MockErrorDeRed extends Error {}
jest.mock('@/api/http', () => ({ ErrorDeRed: MockErrorDeRed }));

jest.mock('@/api/oficina', () => {
  const ErrorDeRed = MockErrorDeRed;
  return {
    ErrorConfiguracion: class extends Error {},
    buscarMedidor: async (codigo: string) => {
      if (mockOficina.sinRed) throw new ErrorDeRed();
      return {
        id: '1', codigo, direccion: '', sector: '', numeroCuenta: '', estado: 'Activo',
        ultimaLectura: 1000, fechaUltimaLectura: '2026-09-15', consumoPromedio: 20,
      };
    },
    lecturasDelPeriodo: async (codigo: string, periodo: string) => {
      if (mockOficina.sinRed) throw new ErrorDeRed();
      return mockOficina.lecturas.filter((l) => l.medidorCodigo === codigo && l.periodo === periodo);
    },
    crearLectura: async (l: LecturaLocal) => {
      if (mockOficina.sinRed) throw new ErrorDeRed();
      const remota = {
        id: String(mockOficina.lecturas.length + 1), clientId: l.id, medidorCodigo: l.medidorCodigo,
        periodo: l.periodo, tecnicoCodigo: l.tecnicoCodigo, registradaEn: l.registradaEn,
      };
      mockOficina.lecturas.push(remota); // la oficina sí la guardó...
      if (mockOficina.cortarRespuesta) throw new ErrorDeRed(); // ...pero la respuesta no llegó
      return remota;
    },
  };
});

jest.mock('@/db/lecturasRepo', () => ({
  lecturasPorEnviar: async () =>
    [...mockLocal.values()].filter((l) => l.envio === 'pendiente' || l.envio === 'enviando'),
  actualizarEnvio: async (id: string, c: Partial<LecturaLocal> & { envio: LecturaLocal['envio'] }) => {
    const l = mockLocal.get(id)!;
    const { ...cambios } = c as Record<string, unknown>;
    delete cambios.sumarIntento;
    mockLocal.set(id, { ...l, ...(cambios as Partial<LecturaLocal>) });
  },
}));

// Se importa después de los mocks.
const { sincronizar } = require('@/sync/sincronizador') as typeof import('@/sync/sincronizador');

function lectura(id: string, cambios: Partial<LecturaLocal> = {}): LecturaLocal {
  return {
    id, medidorCodigo: 'MED-000101', periodo: '2026-10', tecnicoCodigo: 'EMP-1001',
    estadoMedidor: 'normal', lectura: 1015, motivo: null, descripcionDanio: null,
    lecturaAnterior: null, consumo: null, consumoPromedio: null, anomalo: false,
    anomaliaConfirmada: false, fotoNombre: null, registradaEn: '2026-10-28T10:00:00Z',
    actualizadaEn: '2026-10-28T10:00:00Z', verificacion: 'pendiente', envio: 'pendiente',
    mensaje: null, remoteId: null, enviadaEn: null, intentos: 0, ...cambios,
  };
}

beforeEach(() => {
  mockOficina.lecturas = [];
  mockOficina.cortarRespuesta = false;
  mockOficina.sinRed = false;
  mockLocal.clear();
});

it('envía una pendiente y la marca enviada y verificada', async () => {
  mockLocal.set('a', lectura('a'));
  await sincronizar();
  expect(mockOficina.lecturas).toHaveLength(1);
  expect(mockLocal.get('a')?.envio).toBe('enviada');
  expect(mockLocal.get('a')?.verificacion).toBe('verificada');
  expect(mockLocal.get('a')?.consumo).toBe(15);
});

it('si la señal se corta durante el envío, al reintentar no la duplica', async () => {
  mockLocal.set('a', lectura('a'));
  mockOficina.cortarRespuesta = true;
  expect(await sincronizar()).toBe('sin-red');
  expect(mockLocal.get('a')?.envio).toBe('pendiente');
  expect(mockOficina.lecturas).toHaveLength(1);

  mockOficina.cortarRespuesta = false;
  await sincronizar();
  expect(mockOficina.lecturas).toHaveLength(1); // sigue habiendo una sola
  expect(mockLocal.get('a')?.envio).toBe('enviada');
});

it('sin red no cambia nada', async () => {
  mockLocal.set('a', lectura('a'));
  mockOficina.sinRed = true;
  expect(await sincronizar()).toBe('sin-red');
  expect(mockLocal.get('a')?.envio).toBe('pendiente');
});

it('R10: rechaza si la oficina ya tiene otra lectura del medidor en el mes', async () => {
  mockOficina.lecturas.push({
    id: '9', clientId: 'otro', medidorCodigo: 'MED-000101', periodo: '2026-10',
    tecnicoCodigo: 'EMP-1002', registradaEn: '',
  });
  mockLocal.set('a', lectura('a'));
  await sincronizar();
  expect(mockLocal.get('a')?.envio).toBe('rechazada');
  expect(mockOficina.lecturas).toHaveLength(1);
});

it('R4: registrada sin señal con consumo anómalo y sin foto queda en revisión', async () => {
  mockLocal.set('a', lectura('a', { lectura: 1200 })); // consumo 200 > 3 × 20
  await sincronizar();
  expect(mockLocal.get('a')?.envio).toBe('revision');
  expect(mockLocal.get('a')?.anomalo).toBe(true);
  expect(mockOficina.lecturas).toHaveLength(0);
});
