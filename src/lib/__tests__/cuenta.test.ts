import { evaluarFortaleza } from '@/lib/fortalezaClave';
import { validarClave, validarConfirmacion, validarCorreo, validarNombre } from '@/lib/validaciones';

describe('Deber 5 · indicador de seguridad de la contraseña', () => {
  it('vacía no muestra nivel', () => {
    expect(evaluarFortaleza('').nivel).toBe('vacia');
  });

  it('menos de 8 caracteres siempre es débil', () => {
    expect(evaluarFortaleza('Ab1!').nivel).toBe('debil');
  });

  it('solo minúsculas es débil', () => {
    expect(evaluarFortaleza('medidores').nivel).toBe('debil');
  });

  it('8+ con mayúsculas y números es media', () => {
    expect(evaluarFortaleza('Medidor26').nivel).toBe('media');
  });

  it('12+ con mayúsculas, números y símbolo es fuerte', () => {
    const r = evaluarFortaleza('RutaLecturas#2026');
    expect(r.nivel).toBe('fuerte');
    expect(r.sugerencias).toEqual([]);
  });

  it('las contraseñas comunes son débiles aunque tengan 8 caracteres', () => {
    expect(evaluarFortaleza('12345678').nivel).toBe('debil');
    expect(evaluarFortaleza('Password1').nivel).toBe('debil'); // se compara en minúsculas
  });

  it('un carácter repetido es débil', () => {
    expect(evaluarFortaleza('aaaaaaaaaaaaaaaa').nivel).toBe('debil');
  });

  it('15 caracteres o más es al menos media (NIST)', () => {
    expect(evaluarFortaleza('medidoresdeagua').nivel).toBe('media');
  });

  it('da sugerencias cuando no es fuerte', () => {
    expect(evaluarFortaleza('medidores').sugerencias.length).toBeGreaterThan(0);
  });
});

describe('validaciones de la cuenta (taller)', () => {
  it('correo', () => {
    expect(validarCorreo('')).not.toBeNull();
    expect(validarCorreo('diego@')).not.toBeNull();
    expect(validarCorreo('diego.camacho@epn.edu.ec')).toBeNull();
  });
  it('clave de 8 caracteres como mínimo', () => {
    expect(validarClave('1234567')).not.toBeNull();
    expect(validarClave('12345678')).toBeNull();
  });
  it('confirmación', () => {
    expect(validarConfirmacion('abcdefgh', 'abcdefgx')).toBe('Las contraseñas no coinciden.');
    expect(validarConfirmacion('abcdefgh', 'abcdefgh')).toBeNull();
  });
  it('nombre', () => {
    expect(validarNombre('Di')).not.toBeNull();
    expect(validarNombre('Diego')).toBeNull();
  });
});
