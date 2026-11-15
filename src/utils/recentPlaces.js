import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE = 'morazango_lugares_recientes';
const MAXIMO = 6;

// =============================================
// Trae los últimos lugares que el usuario ha
// buscado o seleccionado (no solo viajes completados,
// igual que Uber muestra búsquedas recientes).
// =============================================
export const obtenerLugaresRecientes = async () => {
  try {
    const guardado = await AsyncStorage.getItem(CLAVE);
    return guardado ? JSON.parse(guardado) : [];
  } catch {
    return [];
  }
};

// =============================================
// Agrega un lugar al tope de la lista. Si ya
// existía (misma dirección), lo mueve arriba en
// vez de duplicarlo.
// =============================================
export const agregarLugarReciente = async (lugar) => {
  try {
    const actuales = await obtenerLugaresRecientes();
    const sinDuplicado = actuales.filter((l) => l.direccion !== lugar.direccion);
    const actualizados = [{ ...lugar, guardadoEn: Date.now() }, ...sinDuplicado].slice(0, MAXIMO);
    await AsyncStorage.setItem(CLAVE, JSON.stringify(actualizados));
  } catch {
    // Si falla el guardado local, no es crítico — simplemente no aparecerá en recientes
  }
};
