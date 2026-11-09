/// <reference types="C:/Users/Wadih/Desktop/ProyectoMalparidosTour/mobile/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/Wadih/Desktop/ProyectoMalparidosTour/mobile/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { http, mensajeError } from '../services/http';
import { onIonViewWillEnter } from '@ionic/vue';
const route = useRoute();
const router = useRouter();
const tour = ref(null);
const salidas = ref([]);
const cargando = ref(true);
const error = ref('');
async function cargar() {
    cargando.value = true;
    error.value = '';
    try {
        const id = route.params.id;
        const [t, s] = await Promise.all([http.get(`tours/${id}`), http.get(`tours/${id}/salidas`, { params: { per_page: 50 } })]);
        tour.value = t.data.data;
        const hoy = new Date().toISOString().slice(0, 10);
        salidas.value = s.data.data.filter((x) => x.fecha >= hoy);
    }
    catch (e) {
        error.value = mensajeError(e);
    }
    finally {
        cargando.value = false;
    }
}
onMounted(cargar);
onIonViewWillEnter(cargar);
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(tour, {});
    __VLS_withDotValue(cargando, {});
    __VLS_withDotValue(error, {});
    __VLS_withDotValue(salidas, {});
    __VLS_withDotValue(router, {});
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
        defaultHref: "/tours",
    }));
    const __VLS_26 = __VLS_25({
        defaultHref: "/tours",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
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
    (tour.value?.nombre ?? 'Detalle');
    // @ts-ignore
    [tour,];
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
    }));
    const __VLS_37 = __VLS_36({}, ...__VLS_functionalComponentArgsRest(__VLS_36));
    var __VLS_38;
    const { default: __VLS_40 } = __VLS_nonNull(__VLS_38.slots);
    if (cargando.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "centrado" },
        });
        /** @type {__VLS_StyleScopedClasses['centrado']} */ ;
        let __VLS_41;
        /** @ts-ignore @type { | typeof __VLS_components.ionSpinner | typeof IonSpinner | typeof __VLS_components['ion-spinner']} */
        ionSpinner;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        // @ts-ignore
        }));
        const __VLS_43 = __VLS_42({}, ...__VLS_functionalComponentArgsRest(__VLS_42));
    }
    else if (error.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "centrado" },
        });
        /** @type {__VLS_StyleScopedClasses['centrado']} */ ;
        let __VLS_46;
        /** @ts-ignore @type { | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text'] | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text']} */
        ionText;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            // @ts-ignore
            color: "danger",
        }));
        const __VLS_48 = __VLS_47({
            color: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        var __VLS_49;
        const { default: __VLS_51 } = __VLS_nonNull(__VLS_49.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (error.value);
        // @ts-ignore
        [cargando, error, error,];
        let __VLS_52;
        /** @ts-ignore @type { | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button'] | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button']} */
        ionButton;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
            // @ts-ignore
            ...{ 'onClick': {} },
        }));
        const __VLS_54 = __VLS_53({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        let __VLS_57;
        const __VLS_58 = {
            /** @type {typeof __VLS_57.click} */
            onClick: (cargar),
        };
        void __VLS_58;
        var __VLS_55;
        var __VLS_56;
        const { default: __VLS_59 } = __VLS_nonNull(__VLS_55.slots);
        // @ts-ignore
        [];
    }
    else if (tour.value) {
        let __VLS_60;
        /** @ts-ignore @type { | typeof __VLS_components.ionCard | typeof IonCard | typeof __VLS_components['ion-card'] | typeof __VLS_components.ionCard | typeof IonCard | typeof __VLS_components['ion-card']} */
        ionCard;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
        // @ts-ignore
        }));
        const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
        var __VLS_63;
        const { default: __VLS_65 } = __VLS_nonNull(__VLS_63.slots);
        let __VLS_66;
        /** @ts-ignore @type { | typeof __VLS_components.ionCardHeader | typeof IonCardHeader | typeof __VLS_components['ion-card-header'] | typeof __VLS_components.ionCardHeader | typeof IonCardHeader | typeof __VLS_components['ion-card-header']} */
        ionCardHeader;
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
        // @ts-ignore
        }));
        const __VLS_68 = __VLS_67({}, ...__VLS_functionalComponentArgsRest(__VLS_67));
        var __VLS_69;
        const { default: __VLS_71 } = __VLS_nonNull(__VLS_69.slots);
        let __VLS_72;
        /** @ts-ignore @type { | typeof __VLS_components.ionCardTitle | typeof IonCardTitle | typeof __VLS_components['ion-card-title'] | typeof __VLS_components.ionCardTitle | typeof IonCardTitle | typeof __VLS_components['ion-card-title']} */
        ionCardTitle;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        // @ts-ignore
        }));
        const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
        var __VLS_75;
        const { default: __VLS_77 } = __VLS_nonNull(__VLS_75.slots);
        (tour.value.nombre);
        // @ts-ignore
        [tour, tour,];
        let __VLS_78;
        /** @ts-ignore @type { | typeof __VLS_components.ionCardSubtitle | typeof IonCardSubtitle | typeof __VLS_components['ion-card-subtitle'] | typeof __VLS_components.ionCardSubtitle | typeof IonCardSubtitle | typeof __VLS_components['ion-card-subtitle']} */
        ionCardSubtitle;
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
        // @ts-ignore
        }));
        const __VLS_80 = __VLS_79({}, ...__VLS_functionalComponentArgsRest(__VLS_79));
        var __VLS_81;
        const { default: __VLS_83 } = __VLS_nonNull(__VLS_81.slots);
        (tour.value.precio.toLocaleString('es-CR'));
        (tour.value.duracion_horas);
        // @ts-ignore
        [tour, tour,];
        // @ts-ignore
        [];
        let __VLS_84;
        /** @ts-ignore @type { | typeof __VLS_components.ionCardContent | typeof IonCardContent | typeof __VLS_components['ion-card-content'] | typeof __VLS_components.ionCardContent | typeof IonCardContent | typeof __VLS_components['ion-card-content']} */
        ionCardContent;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
        // @ts-ignore
        }));
        const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
        var __VLS_87;
        const { default: __VLS_89 } = __VLS_nonNull(__VLS_87.slots);
        (tour.value.descripcion ?? 'Sin descripción.');
        // @ts-ignore
        [tour,];
        // @ts-ignore
        [];
        let __VLS_90;
        /** @ts-ignore @type { | typeof __VLS_components.ionListHeader | typeof IonListHeader | typeof __VLS_components['ion-list-header'] | typeof __VLS_components.ionListHeader | typeof IonListHeader | typeof __VLS_components['ion-list-header']} */
        ionListHeader;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        // @ts-ignore
        }));
        const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
        var __VLS_93;
        const { default: __VLS_95 } = __VLS_nonNull(__VLS_93.slots);
        let __VLS_96;
        /** @ts-ignore @type { | typeof __VLS_components.ionLabel | typeof IonLabel | typeof __VLS_components['ion-label'] | typeof __VLS_components.ionLabel | typeof IonLabel | typeof __VLS_components['ion-label']} */
        ionLabel;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
        // @ts-ignore
        }));
        const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
        var __VLS_99;
        const { default: __VLS_101 } = __VLS_nonNull(__VLS_99.slots);
        // @ts-ignore
        [];
        // @ts-ignore
        [];
        if (!salidas.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "centrado" },
            });
            /** @type {__VLS_StyleScopedClasses['centrado']} */ ;
            let __VLS_102;
            /** @ts-ignore @type { | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text'] | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text']} */
            ionText;
            // @ts-ignore
            const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
            // @ts-ignore
            }));
            const __VLS_104 = __VLS_103({}, ...__VLS_functionalComponentArgsRest(__VLS_103));
            var __VLS_105;
            const { default: __VLS_107 } = __VLS_nonNull(__VLS_105.slots);
            // @ts-ignore
            [salidas,];
        }
        else {
            let __VLS_108;
            /** @ts-ignore @type { | typeof __VLS_components.ionList | typeof IonList | typeof __VLS_components['ion-list'] | typeof __VLS_components.ionList | typeof IonList | typeof __VLS_components['ion-list']} */
            ionList;
            // @ts-ignore
            const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
            // @ts-ignore
            }));
            const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
            var __VLS_111;
            const { default: __VLS_113 } = __VLS_nonNull(__VLS_111.slots);
            const __VLS_114 = __VLS_tryAsConstant((salidas.value));
            for (const [s] of __VLS_vFor(__VLS_nonNull(__VLS_114))) {
                let __VLS_115;
                /** @ts-ignore @type { | typeof __VLS_components.ionItem | typeof IonItem | typeof __VLS_components['ion-item'] | typeof __VLS_components.ionItem | typeof IonItem | typeof __VLS_components['ion-item']} */
                ionItem;
                // @ts-ignore
                const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
                    // @ts-ignore
                    ...{ 'onClick': {} }, key: (s.id), button: true, detail: (true),
                }));
                const __VLS_117 = __VLS_116({
                    ...{ 'onClick': {} },
                    key: (s.id),
                    button: true,
                    detail: (true),
                }, ...__VLS_functionalComponentArgsRest(__VLS_116));
                let __VLS_120;
                const __VLS_121 = {
                    /** @type {typeof __VLS_120.click} */
                    onClick: (...[$event]) => {
                        void $event;
                        if (!!(cargando.value))
                            throw 0;
                        if (!!(error.value))
                            throw 0;
                        if (!(tour.value))
                            throw 0;
                        if (!!(!salidas.value.length))
                            throw 0;
                        return (router.value.push(`/tours/${tour.value.id}/reservar/${s.id}`));
                        // @ts-ignore
                        [tour, salidas, router,];
                    },
                };
                void __VLS_121;
                var __VLS_118;
                var __VLS_119;
                const { default: __VLS_122 } = __VLS_nonNull(__VLS_118.slots);
                let __VLS_123;
                /** @ts-ignore @type { | typeof __VLS_components.ionLabel | typeof IonLabel | typeof __VLS_components['ion-label'] | typeof __VLS_components.ionLabel | typeof IonLabel | typeof __VLS_components['ion-label']} */
                ionLabel;
                // @ts-ignore
                const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
                // @ts-ignore
                }));
                const __VLS_125 = __VLS_124({}, ...__VLS_functionalComponentArgsRest(__VLS_124));
                var __VLS_126;
                const { default: __VLS_128 } = __VLS_nonNull(__VLS_126.slots);
                __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
                (s.fecha);
                (s.hora);
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
                (s.cupo_disponible);
                // @ts-ignore
                [];
                // @ts-ignore
                [];
                // @ts-ignore
                [];
            }
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
