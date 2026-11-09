import { LocalNotifications } from '@capacitor/local-notifications';
import { NativeSettings, AndroidSettings } from 'capacitor-native-settings';
export async function estadoPermiso() {
    const { display } = await LocalNotifications.checkPermissions();
    return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'prompt';
}
// Pide el permiso en tiempo de ejecución (Android 13+).
export async function pedirPermiso() {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'prompt';
}
// Si el usuario lo negó de forma permanente, solo se puede activar desde Ajustes.
export function abrirAjustesApp() {
    return NativeSettings.openAndroid({ option: AndroidSettings.ApplicationDetails });
}
// Recordatorio un día antes de la salida (o en 10 s si la salida es mañana/hoy, para poder demostrarlo).
export async function programarRecordatorio(reservaId, tour, fecha, hora) {
    const salida = new Date(`${fecha}T${hora}`);
    let cuando = new Date(salida.getTime() - 24 * 60 * 60 * 1000);
    if (cuando.getTime() < Date.now())
        cuando = new Date(Date.now() + 10_000);
    await LocalNotifications.schedule({
        notifications: [{
                id: reservaId,
                title: 'Recordatorio de tu tour',
                body: `${tour} sale el ${fecha} a las ${hora}.`,
                schedule: { at: cuando, allowWhileIdle: true },
            }],
    });
}
