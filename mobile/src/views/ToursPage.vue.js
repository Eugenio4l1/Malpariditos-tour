/// <reference types="C:/Users/Wadih/Desktop/ProyectoMalparidosTour/mobile/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/Wadih/Desktop/ProyectoMalparidosTour/mobile/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { http, mensajeError } from '../services/http';
import { guardarCache, leerCache } from '../services/cache';
import { useAuth } from '../stores/auth';
const router = useRouter();
const auth = useAuth();
const tours = ref([]);
const pagina = ref(1);
const ultimaPagina = ref(1);
const cargando = ref(false);
const error = ref('');
const desdeCache = ref(false);
const guardadoEn = ref(0);
const fechaCache = computed(() => new Date(guardadoEn.value).toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' }));
async function cargar(reiniciar = false) {
    cargando.value = true;
    error.value = '';
    try {
        const { data } = await http.get('tours', { params: { page: 1, per_page: 10, estado: 'activo' } });
        tours.value = data.data;
        pagina.value = data.meta.current_page;
        ultimaPagina.value = data.meta.last_page;
        desdeCache.value = false;
        await guardarCache('tours_p1', data.data); // última lectura buena
    }
    catch (e) {
        if (e.response?.status === 401)
            return; // el interceptor cierra la sesión
        const guardado = await leerCache('tours_p1');
        if (guardado) { // sin red: mostrar la caché
            tours.value = guardado.datos;
            guardadoEn.value = guardado.guardadoEn;
            desdeCache.value = true;
        }
        else {
            error.value = mensajeError(e);
        }
    }
    finally {
        cargando.value = false;
    }
}
async function masPaginas(ev) {
    try {
        const { data } = await http.get('tours', { params: { page: pagina.value + 1, per_page: 10, estado: 'activo' } });
        tours.value.push(...data.data);
        pagina.value = data.meta.current_page;
        ultimaPagina.value = data.meta.last_page;
    }
    catch (e) {
        error.value = mensajeError(e);
    }
    finally {
        ev.target.complete();
    }
}
async function refrescar(ev) {
    await cargar(true);
    ev.target.complete();
}
async function salir() {
    await auth.logout();
    router.replace('/login');
}
onMounted(() => cargar());
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(desdeCache, {});
    __VLS_withDotValue(cargando, {});
    __VLS_withDotValue(tours, {});
    __VLS_withDotValue(error, {});
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
    /** @ts-ignore @type { | typeof __VLS_components.ionTitle | typeof IonTitle | typeof __VLS_components['ion-title'] | typeof __VLS_components.ionTitle | typeof IonTitle | typeof __VLS_components['ion-title']} */
    ionTitle;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    // @ts-ignore
    }));
    const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
    var __VLS_21;
    const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
    let __VLS_24;
    /** @ts-ignore @type { | typeof __VLS_components.ionButtons | typeof IonButtons | typeof __VLS_components['ion-buttons'] | typeof __VLS_components.ionButtons | typeof IonButtons | typeof __VLS_components['ion-buttons']} */
    ionButtons;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        // @ts-ignore
        slot: "end",
    }));
    const __VLS_26 = __VLS_25({
        slot: "end",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    var __VLS_27;
    const { default: __VLS_29 } = __VLS_nonNull(__VLS_27.slots);
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button'] | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button']} */
    ionButton;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        // @ts-ignore
        ...{ 'onClick': {} },
    }));
    const __VLS_32 = __VLS_31({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    let __VLS_35;
    const __VLS_36 = {
        /** @type {typeof __VLS_35.click} */
        onClick: (salir),
    };
    void __VLS_36;
    var __VLS_33;
    var __VLS_34;
    const { default: __VLS_37 } = __VLS_nonNull(__VLS_33.slots);
    let __VLS_38;
    /** @ts-ignore @type { | typeof __VLS_components.ionContent | typeof IonContent | typeof __VLS_components['ion-content'] | typeof __VLS_components.ionContent | typeof IonContent | typeof __VLS_components['ion-content']} */
    ionContent;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    // @ts-ignore
    }));
    const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
    var __VLS_41;
    const { default: __VLS_43 } = __VLS_nonNull(__VLS_41.slots);
    let __VLS_44;
    /** @ts-ignore @type { | typeof __VLS_components.ionRefresher | typeof IonRefresher | typeof __VLS_components['ion-refresher'] | typeof __VLS_components.ionRefresher | typeof IonRefresher | typeof __VLS_components['ion-refresher']} */
    ionRefresher;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
        // @ts-ignore
        ...{ 'onIonRefresh': {} }, slot: "fixed",
    }));
    const __VLS_46 = __VLS_45({
        ...{ 'onIonRefresh': {} },
        slot: "fixed",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_49;
    const __VLS_50 = {
        /** @type {typeof __VLS_49.ionRefresh} */
        onIonRefresh: (...[$event]) => {
            void $event;
            return (refrescar($event));
        },
    };
    void __VLS_50;
    var __VLS_47;
    var __VLS_48;
    const { default: __VLS_51 } = __VLS_nonNull(__VLS_47.slots);
    let __VLS_52;
    /** @ts-ignore @type { | typeof __VLS_components.ionRefresherContent | typeof IonRefresherContent | typeof __VLS_components['ion-refresher-content']} */
    ionRefresherContent;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
    // @ts-ignore
    }));
    const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
    if (desdeCache.value) {
        let __VLS_57;
        /** @ts-ignore @type { | typeof __VLS_components.ionChip | typeof IonChip | typeof __VLS_components['ion-chip'] | typeof __VLS_components.ionChip | typeof IonChip | typeof __VLS_components['ion-chip']} */
        ionChip;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            // @ts-ignore
            color: "warning", ...{ class: "ion-margin" },
        }));
        const __VLS_59 = __VLS_58({
            color: "warning",
            ...{ class: "ion-margin" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        /** @type {__VLS_StyleScopedClasses['ion-margin']} */ ;
        var __VLS_60;
        const { default: __VLS_62 } = __VLS_nonNull(__VLS_60.slots);
        let __VLS_63;
        /** @ts-ignore @type { | typeof __VLS_components.ionLabel | typeof IonLabel | typeof __VLS_components['ion-label'] | typeof __VLS_components.ionLabel | typeof IonLabel | typeof __VLS_components['ion-label']} */
        ionLabel;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
        // @ts-ignore
        }));
        const __VLS_65 = __VLS_64({}, ...__VLS_functionalComponentArgsRest(__VLS_64));
        var __VLS_66;
        const { default: __VLS_68 } = __VLS_nonNull(__VLS_66.slots);
        (__VLS_unwrap(fechaCache, {}));
        // @ts-ignore
        [desdeCache, fechaCache,];
        // @ts-ignore
        [];
    }
    if (cargando.value && !tours.value.length) {
        let __VLS_69;
        /** @ts-ignore @type { | typeof __VLS_components.ionList | typeof IonList | typeof __VLS_components['ion-list'] | typeof __VLS_components.ionList | typeof IonList | typeof __VLS_components['ion-list']} */
        ionList;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
        // @ts-ignore
        }));
        const __VLS_71 = __VLS_70({}, ...__VLS_functionalComponentArgsRest(__VLS_70));
        var __VLS_72;
        const { default: __VLS_74 } = __VLS_nonNull(__VLS_72.slots);
        const __VLS_75 = __VLS_tryAsConstant((5));
        for (const [n] of __VLS_vFor(__VLS_nonNull(__VLS_75))) {
            let __VLS_76;
            /** @ts-ignore @type { | typeof __VLS_components.ionItem | typeof IonItem | typeof __VLS_components['ion-item'] | typeof __VLS_components.ionItem | typeof IonItem | typeof __VLS_components['ion-item']} */
            ionItem;
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
                // @ts-ignore
                key: (n),
            }));
            const __VLS_78 = __VLS_77({
                key: (n),
            }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            var __VLS_79;
            const { default: __VLS_81 } = __VLS_nonNull(__VLS_79.slots);
            let __VLS_82;
            /** @ts-ignore @type { | typeof __VLS_components.ionLabel | typeof IonLabel | typeof __VLS_components['ion-label'] | typeof __VLS_components.ionLabel | typeof IonLabel | typeof __VLS_components['ion-label']} */
            ionLabel;
            // @ts-ignore
            const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
            // @ts-ignore
            }));
            const __VLS_84 = __VLS_83({}, ...__VLS_functionalComponentArgsRest(__VLS_83));
            var __VLS_85;
            const { default: __VLS_87 } = __VLS_nonNull(__VLS_85.slots);
            let __VLS_88;
            /** @ts-ignore @type { | typeof __VLS_components.ionSkeletonText | typeof IonSkeletonText | typeof __VLS_components['ion-skeleton-text']} */
            ionSkeletonText;
            // @ts-ignore
            const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
                // @ts-ignore
                animated: true, ...{ style: {} },
            }));
            const __VLS_90 = __VLS_89({
                animated: true,
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_89));
            let __VLS_93;
            /** @ts-ignore @type { | typeof __VLS_components.ionSkeletonText | typeof IonSkeletonText | typeof __VLS_components['ion-skeleton-text']} */
            ionSkeletonText;
            // @ts-ignore
            const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
                // @ts-ignore
                animated: true, ...{ style: {} },
            }));
            const __VLS_95 = __VLS_94({
                animated: true,
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_94));
            // @ts-ignore
            [cargando, tours,];
            // @ts-ignore
            [];
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
    }
    else if (error.value && !tours.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "centrado" },
        });
        /** @type {__VLS_StyleScopedClasses['centrado']} */ ;
        let __VLS_98;
        /** @ts-ignore @type { | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text'] | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text']} */
        ionText;
        // @ts-ignore
        const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
            // @ts-ignore
            color: "danger",
        }));
        const __VLS_100 = __VLS_99({
            color: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_99));
        var __VLS_101;
        const { default: __VLS_103 } = __VLS_nonNull(__VLS_101.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (error.value);
        // @ts-ignore
        [tours, error, error,];
        let __VLS_104;
        /** @ts-ignore @type { | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button'] | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button']} */
        ionButton;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
            // @ts-ignore
            ...{ 'onClick': {} },
        }));
        const __VLS_106 = __VLS_105({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        let __VLS_109;
        const __VLS_110 = {
            /** @type {typeof __VLS_109.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!!(cargando.value && !tours.value.length))
                    throw 0;
                if (!(error.value && !tours.value.length))
                    throw 0;
                return (cargar(true));
                // @ts-ignore
                [];
            },
        };
        void __VLS_110;
        var __VLS_107;
        var __VLS_108;
        const { default: __VLS_111 } = __VLS_nonNull(__VLS_107.slots);
        // @ts-ignore
        [];
    }
    else if (!tours.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "centrado" },
        });
        /** @type {__VLS_StyleScopedClasses['centrado']} */ ;
        let __VLS_112;
        /** @ts-ignore @type { | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text'] | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text']} */
        ionText;
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
        // @ts-ignore
        }));
        const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
        var __VLS_115;
        const { default: __VLS_117 } = __VLS_nonNull(__VLS_115.slots);
        // @ts-ignore
        [tours,];
    }
    else {
        let __VLS_118;
        /** @ts-ignore @type { | typeof __VLS_components.ionList | typeof IonList | typeof __VLS_components['ion-list'] | typeof __VLS_components.ionList | typeof IonList | typeof __VLS_components['ion-list']} */
        ionList;
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
        // @ts-ignore
        }));
        const __VLS_120 = __VLS_119({}, ...__VLS_functionalComponentArgsRest(__VLS_119));
        var __VLS_121;
        const { default: __VLS_123 } = __VLS_nonNull(__VLS_121.slots);
        const __VLS_124 = __VLS_tryAsConstant((tours.value));
        for (const [t] of __VLS_vFor(__VLS_nonNull(__VLS_124))) {
            let __VLS_125;
            /** @ts-ignore @type { | typeof __VLS_components.ionItem | typeof IonItem | typeof __VLS_components['ion-item'] | typeof __VLS_components.ionItem | typeof IonItem | typeof __VLS_components['ion-item']} */
            ionItem;
            // @ts-ignore
            const __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({
                // @ts-ignore
                ...{ 'onClick': {} }, key: (t.id), button: true, detail: (true),
            }));
            const __VLS_127 = __VLS_126({
                ...{ 'onClick': {} },
                key: (t.id),
                button: true,
                detail: (true),
            }, ...__VLS_functionalComponentArgsRest(__VLS_126));
            let __VLS_130;
            const __VLS_131 = {
                /** @type {typeof __VLS_130.click} */
                onClick: (...[$event]) => {
                    void $event;
                    if (!!(cargando.value && !tours.value.length))
                        throw 0;
                    if (!!(error.value && !tours.value.length))
                        throw 0;
                    if (!!(!tours.value.length))
                        throw 0;
                    return (router.value.push(`/tours/${t.id}`));
                    // @ts-ignore
                    [tours, router,];
                },
            };
            void __VLS_131;
            var __VLS_128;
            var __VLS_129;
            const { default: __VLS_132 } = __VLS_nonNull(__VLS_128.slots);
            let __VLS_133;
            /** @ts-ignore @type { | typeof __VLS_components.ionLabel | typeof IonLabel | typeof __VLS_components['ion-label'] | typeof __VLS_components.ionLabel | typeof IonLabel | typeof __VLS_components['ion-label']} */
            ionLabel;
            // @ts-ignore
            const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
            // @ts-ignore
            }));
            const __VLS_135 = __VLS_134({}, ...__VLS_functionalComponentArgsRest(__VLS_134));
            var __VLS_136;
            const { default: __VLS_138 } = __VLS_nonNull(__VLS_136.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
            (t.nombre);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (t.precio.toLocaleString('es-CR'));
            (t.duracion_horas);
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
    let __VLS_139;
    /** @ts-ignore @type { | typeof __VLS_components.ionInfiniteScroll | typeof IonInfiniteScroll | typeof __VLS_components['ion-infinite-scroll'] | typeof __VLS_components.ionInfiniteScroll | typeof IonInfiniteScroll | typeof __VLS_components['ion-infinite-scroll']} */
    ionInfiniteScroll;
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
        // @ts-ignore
        ...{ 'onIonInfinite': {} }, disabled: (__VLS_unwrap(pagina, {}) >= __VLS_unwrap(ultimaPagina, {}) || desdeCache.value),
    }));
    const __VLS_141 = __VLS_140({
        ...{ 'onIonInfinite': {} },
        disabled: (__VLS_unwrap(pagina, {}) >= __VLS_unwrap(ultimaPagina, {}) || desdeCache.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    let __VLS_144;
    const __VLS_145 = {
        /** @type {typeof __VLS_144.ionInfinite} */
        onIonInfinite: (...[$event]) => {
            void $event;
            return (masPaginas($event));
            // @ts-ignore
            [desdeCache, pagina, ultimaPagina,];
        },
    };
    void __VLS_145;
    var __VLS_142;
    var __VLS_143;
    const { default: __VLS_146 } = __VLS_nonNull(__VLS_142.slots);
    let __VLS_147;
    /** @ts-ignore @type { | typeof __VLS_components.ionInfiniteScrollContent | typeof IonInfiniteScrollContent | typeof __VLS_components['ion-infinite-scroll-content']} */
    ionInfiniteScrollContent;
    // @ts-ignore
    const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
    // @ts-ignore
    }));
    const __VLS_149 = __VLS_148({}, ...__VLS_functionalComponentArgsRest(__VLS_148));
    // @ts-ignore
    [];
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
