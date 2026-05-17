export function generarCodigoEncomienda() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  const aleatorio = Math.floor(Math.random() * 9000) + 1000;
  return `MC-${anio}${mes}${dia}-${aleatorio}`;
}