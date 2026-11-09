import { ref } from 'vue';
import { Network } from '@capacitor/network';
export const online = ref(true);
export async function iniciarRed() {
    online.value = (await Network.getStatus()).connected;
    await Network.addListener('networkStatusChange', (s) => { online.value = s.connected; });
}
