import { CAPTURA_VACIA, esConsumoAnomalo, evaluarCaptura, parseLectura, type DatosCaptura } from '@/domain/reglas';

const ref = { lecturaAnterior: 1000, consumoPromedio: 20 };

function datos(cambios: Partial<DatosCaptura>): DatosCaptura {
  return { ...CAPTURA_VACIA, ...cambios };
}

describe('parseLectura', () => {
  it('acepta enteros y rechaza decimales o letras', () => {
    expect(parseLectura('1520')).toBe(1520);
    expect(parseLectura('  ')).toBeNull();
    expect(parseLectura('15.5')).toBe('invalida');
    expect(parseLectura('12a')).toBe('invalida');
  });
});

describe('R5: estados del medidor', () => {
  it('exige elegir un estado', () => {
    expect(evaluarCaptura(CAPTURA_VACIA, ref).errores.estado).toBeDefined();
  });

  it('normal exige la lectura', () => {
    const r = evaluarCaptura(datos({ estadoMedidor: 'normal' }), ref);
    expect(r.errores.lectura).toBeDefined();
  });

  it('inaccesible exige motivo y no permite lectura', () => {
    const sinMotivo = evaluarCaptura(datos({ estadoMedidor: 'inaccesible' }), ref);
    expect(sinMotivo.errores.motivo).toBeDefined();

    const conLectura = evaluarCaptura(
      datos({ estadoMedidor: 'inaccesible', motivo: 'Perro suelto', lecturaTexto: '1010' }),
      ref,
    );
    expect(conLectura.errores.lectura).toBeDefined();

    const bien = evaluarCaptura(datos({ estadoMedidor: 'inaccesible', motivo: 'Perro suelto' }), ref);
    expect(bien.errores).toEqual({});
    expect(bien.lectura).toBeNull();
  });

  it('dañado exige descripción y foto, y permite lectura vacía', () => {
    const sinNada = evaluarCaptura(datos({ estadoMedidor: 'danado' }), ref);
    expect(sinNada.errores.descripcion).toBeDefined();
    expect(sinNada.errores.foto).toBeDefined();
    expect(sinNada.errores.lectura).toBeUndefined();

    const bien = evaluarCaptura(
      datos({ estadoMedidor: 'danado', descripcionDanio: 'Vidrio roto', fotoNombre: 'a.jpg' }),
      ref,
    );
    expect(bien.errores).toEqual({});
  });
});

describe('R6: consumo y anomalía', () => {
  it('calcula el consumo con la lectura anterior', () => {
    const r = evaluarCaptura(datos({ estadoMedidor: 'normal', lecturaTexto: '1025' }), ref);
    expect(r.consumo).toBe(25);
    expect(r.anomalo).toBe(false);
    expect(r.errores).toEqual({});
  });

  it('el triple exacto no es anómalo; más del triple sí', () => {
    expect(esConsumoAnomalo(60, 20)).toBe(false);
    expect(esConsumoAnomalo(61, 20)).toBe(true);
  });

  it('con consumo anómalo exige confirmación y foto', () => {
    const r = evaluarCaptura(datos({ estadoMedidor: 'normal', lecturaTexto: '1061' }), ref);
    expect(r.anomalo).toBe(true);
    expect(r.fotoObligatoria).toBe(true);
    expect(r.errores.confirmacion).toBeDefined();
    expect(r.errores.foto).toBeDefined();

    const ok = evaluarCaptura(
      datos({ estadoMedidor: 'normal', lecturaTexto: '1061', anomaliaConfirmada: true, fotoNombre: 'f.jpg' }),
      ref,
    );
    expect(ok.errores).toEqual({});
  });

  it('rechaza una lectura menor que la anterior', () => {
    const r = evaluarCaptura(datos({ estadoMedidor: 'normal', lecturaTexto: '999' }), ref);
    expect(r.errores.lectura).toBeDefined();
    expect(r.consumo).toBeNull();
  });

  it('sin referencia (sin señal y sin caché) no calcula consumo', () => {
    const r = evaluarCaptura(datos({ estadoMedidor: 'normal', lecturaTexto: '1500' }), null);
    expect(r.consumo).toBeNull();
    expect(r.errores).toEqual({});
  });
});

describe('R7: foto opcional en los demás casos', () => {
  it('normal con consumo normal no exige foto', () => {
    const r = evaluarCaptura(datos({ estadoMedidor: 'normal', lecturaTexto: '1010' }), ref);
    expect(r.fotoObligatoria).toBe(false);
  });
  it('inaccesible no exige foto', () => {
    const r = evaluarCaptura(datos({ estadoMedidor: 'inaccesible', motivo: 'Caja sellada' }), ref);
    expect(r.fotoObligatoria).toBe(false);
  });
});
