/// <reference types="C:/Users/Wadih/Desktop/ProyectoMalparidosTour/mobile/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/Wadih/Desktop/ProyectoMalparidosTour/mobile/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { http, mensajeError } from '../services/http';
import { useAuth } from '../stores/auth';
import { abrirAjustesApp, estadoPermiso, pedirPermiso, programarRecordatorio } from '../services/notifications';
const route = useRoute();
const router = useRouter();
const auth = useAuth();
const cantidad = ref(1);
const enviando = ref(false);
const error = ref('');
const exito = ref('');
const permiso = ref('prompt');
onMounted(async () => { permiso.value = await estadoPermiso(); });
async function reservar() {
    error.value = '';
    exito.value = '';
    if (!Number.isInteger(cantidad.value) || cantidad.value < 1 || cantidad.value > 20) {
        error.value = 'La cantidad debe ser un número entero entre 1 y 20.';
        return;
    }
    enviando.value = true;
    try {
        const salidaId = Number(route.params.salidaId);
        const { data } = await http.post('reservas', {
            cliente_id: auth.usuario?.cliente_id,
            salida_tour_id: salidaId,
            cantidad_personas: cantidad.value,
            fecha_reserva: new Date().toISOString().slice(0, 10),
        });
        exito.value = `Reserva #${data.data.id} creada. Total: ₡${data.data.total.toLocaleString('es-CR')}`;
        // Componente nativo: recordatorio local (pide permiso solo si hace falta).
        if (permiso.value === 'prompt')
            permiso.value = await pedirPermiso();
        if (permiso.value === 'granted') {
            const { data: s } = await http.get(`tours/${route.params.id}/salidas`, { params: { per_page: 50 } });
            const salida = s.data.find((x) => x.id === salidaId);
            const { data: t } = await http.get(`tours/${route.params.id}`);
            if (salida)
                await programarRecordatorio(data.data.id, t.data.nombre, salida.fecha, salida.hora);
        }
        setTimeout(() => router.replace('/tours'), 1500);
    }
    catch (e) {
        error.value = mensajeError(e); // 409 (sin cupo/vencida) y 422 llegan en español desde la API
    }
    finally {
        enviando.value = false;
    }
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(route, {});
    __VLS_withDotValue(auth, {});
    __VLS_withDotValue(error, {});
    __VLS_withDotValue(exito, {});
    __VLS_withDotValue(enviando, {});
    __VLS_withDotValue(permiso, {});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.ionPage | typeof IonPage | typeof __VLS_components['ion-page'] | typeof __VLS_components.ionPage | typeof IonPage | typeof __VLS_components['ion-page']} */
    ionPage;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    // @ts-ignore
    }));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.ionHeader | typeof IonHeader | typeof __VLS_components['ion-header'] | typeof __VLS_components.ionHeader | typeof IonHeader | typeof __VLS_components['ion-header']} */
    ionHeader;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    // @ts-ignore
    }));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    var __VLS_9;
    const { default: __VLS_11 } = __VLS_nonNull(__VLS_9.slots);
    let __VLS_12;
    /** @ts-ignore @type { | typeof __VLS_components.ionToolbar | typeof IonToolbar | typeof __VLS_components['ion-toolbar'] | typeof __VLS_components.ionToolbar | typeof IonToolbar | typeof __VLS_components['ion-toolbar']} */
    ionToolbar;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        // @ts-ignore
        color: "primary",
    }));
    const __VLS_14 = __VLS_13({
        color: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_15;
    const { default: __VLS_17 } = __VLS_nonNull(__VLS_15.slots);
    let __VLS_18;
    /** @ts-ignore @type { | typeof __VLS_components.ionButtons | typeof IonButtons | typeof __VLS_components['ion-buttons'] | typeof __VLS_components.ionButtons | typeof IonButtons | typeof __VLS_components['ion-buttons']} */
    ionButtons;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        // @ts-ignore
        slot: "start",
    }));
    const __VLS_20 = __VLS_19({
        slot: "start",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    var __VLS_21;
    const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
    let __VLS_24;
    /** @ts-ignore @type { | typeof __VLS_components.ionBackButton | typeof IonBackButton | typeof __VLS_components['ion-back-button']} */
    ionBackButton;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        // @ts-ignore
        defaultHref: (`/tours/${route.value.params.id}`),
    }));
    const __VLS_26 = __VLS_25({
        defaultHref: (`/tours/${route.value.params.id}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    // @ts-ignore
    [route,];
    let __VLS_29;
    /** @ts-ignore @type { | typeof __VLS_components.ionTitle | typeof IonTitle | typeof __VLS_components['ion-title'] | typeof __VLS_components.ionTitle | typeof IonTitle | typeof __VLS_components['ion-title']} */
    ionTitle;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    // @ts-ignore
    }));
    const __VLS_31 = __VLS_30({}, ...__VLS_functionalComponentArgsRest(__VLS_30));
    var __VLS_32;
    const { default: __VLS_34 } = __VLS_nonNull(__VLS_32.slots);
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    let __VLS_35;
    /** @ts-ignore @type { | typeof __VLS_components.ionContent | typeof IonContent | typeof __VLS_components['ion-content'] | typeof __VLS_components.ionContent | typeof IonContent | typeof __VLS_components['ion-content']} */
    ionContent;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        // @ts-ignore
        ...{ class: "ion-padding" },
    }));
    const __VLS_37 = __VLS_36({
        ...{ class: "ion-padding" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    /** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
    var __VLS_38;
    const { default: __VLS_40 } = __VLS_nonNull(__VLS_38.slots);
    if (auth.value.usuario?.role !== 'cliente') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "centrado" },
        });
        /** @type {__VLS_StyleScopedClasses['centrado']} */ ;
        let __VLS_41;
        /** @ts-ignore @type { | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text'] | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text']} */
        ionText;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
            // @ts-ignore
            color: "medium",
        }));
        const __VLS_43 = __VLS_42({
            color: "medium",
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        var __VLS_44;
        const { default: __VLS_46 } = __VLS_nonNull(__VLS_44.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        // @ts-ignore
        [auth,];
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (reservar) },
        });
        let __VLS_47;
        /** @ts-ignore @type { | typeof __VLS_components.ionInput | typeof IonInput | typeof __VLS_components['ion-input']} */
        ionInput;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
            // @ts-ignore
            modelValue: (__VLS_unwrap(cantidad, {})), modelModifiers: { number: true, }, type: "number", inputmode: "numeric", min: "1", max: "20", label: "Cantidad de personas (1 a 20)", labelPlacement: "floating", fill: "outline",
        }));
        const __VLS_49 = __VLS_48({
            modelValue: (__VLS_unwrap(cantidad, {})),
            modelModifiers: { number: true, },
            type: "number",
            inputmode: "numeric",
            min: "1",
            max: "20",
            label: "Cantidad de personas (1 a 20)",
            labelPlacement: "floating",
            fill: "outline",
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        if (error.value) {
            let __VLS_52;
            /** @ts-ignore @type { | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text'] | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text']} */
            ionText;
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
                // @ts-ignore
                color: "danger",
            }));
            const __VLS_54 = __VLS_53({
                color: "danger",
            }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            var __VLS_55;
            const { default: __VLS_57 } = __VLS_nonNull(__VLS_55.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (error.value);
            // @ts-ignore
            [cantidad, error, error,];
        }
        if (exito.value) {
            let __VLS_58;
            /** @ts-ignore @type { | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text'] | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text']} */
            ionText;
            // @ts-ignore
            const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
                // @ts-ignore
                color: "success",
            }));
            const __VLS_60 = __VLS_59({
                color: "success",
            }, ...__VLS_functionalComponentArgsRest(__VLS_59));
            var __VLS_61;
            const { default: __VLS_63 } = __VLS_nonNull(__VLS_61.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (exito.value);
            // @ts-ignore
            [exito, exito,];
        }
        let __VLS_64;
        /** @ts-ignore @type { | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button'] | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button']} */
        ionButton;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
            // @ts-ignore
            expand: "block", type: "submit", ...{ class: "ion-margin-top" }, disabled: (enviando.value),
        }));
        const __VLS_66 = __VLS_65({
            expand: "block",
            type: "submit",
            ...{ class: "ion-margin-top" },
            disabled: (enviando.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        /** @type {__VLS_StyleScopedClasses['ion-margin-top']} */ ;
        var __VLS_67;
        const { default: __VLS_69 } = __VLS_nonNull(__VLS_67.slots);
        if (enviando.value) {
            let __VLS_70;
            /** @ts-ignore @type { | typeof __VLS_components.ionSpinner | typeof IonSpinner | typeof __VLS_components['ion-spinner']} */
            ionSpinner;
            // @ts-ignore
            const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
                // @ts-ignore
                name: "dots",
            }));
            const __VLS_72 = __VLS_71({
                name: "dots",
            }, ...__VLS_functionalComponentArgsRest(__VLS_71));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
        // @ts-ignore
        [enviando, enviando,];
        if (permiso.value === 'denied') {
            let __VLS_75;
            /** @ts-ignore @type { | typeof __VLS_components.ionNote | typeof IonNote | typeof __VLS_components['ion-note'] | typeof __VLS_components.ionNote | typeof IonNote | typeof __VLS_components['ion-note']} */
            ionNote;
            // @ts-ignore
            const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
                // @ts-ignore
                color: "warning", ...{ class: "ion-margin-top" }, ...{ style: {} },
            }));
            const __VLS_77 = __VLS_76({
                color: "warning",
                ...{ class: "ion-margin-top" },
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_76));
            /** @type {__VLS_StyleScopedClasses['ion-margin-top']} */ ;
            var __VLS_78;
            const { default: __VLS_80 } = __VLS_nonNull(__VLS_78.slots);
            let __VLS_81;
            /** @ts-ignore @type { | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button'] | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button']} */
            ionButton;
            // @ts-ignore
            const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
                // @ts-ignore
                ...{ 'onClick': {} }, size: "small", fill: "outline",
            }));
            const __VLS_83 = __VLS_82({
                ...{ 'onClick': {} },
                size: "small",
                fill: "outline",
            }, ...__VLS_functionalComponentArgsRest(__VLS_82));
            let __VLS_86;
            const __VLS_87 = {
                /** @type {typeof __VLS_86.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!!(auth.value.usuario?.role !== 'cliente'))
                        throw 0;
                    if (!(permiso.value === 'denied'))
                        throw 0;
                    return (__VLS_unwrap(abrirAjustesApp, {})());
                    // @ts-ignore
                    [permiso, abrirAjustesApp,];
                },
            };
            void __VLS_87;
            var __VLS_84;
            var __VLS_85;
            const { default: __VLS_88 } = __VLS_nonNull(__VLS_84.slots);
            // @ts-ignore
            [];
            // @ts-ignore
            [];
        }
    }
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
