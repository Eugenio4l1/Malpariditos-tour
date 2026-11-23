/// <reference types="C:/Users/A.R/Desktop/Malpariditos-tour/mobile/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/A.R/Desktop/Malpariditos-tour/mobile/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { http, mensajeError } from '../services/http';
import { guardarCache, leerCache } from '../services/cache';
import { useAuth } from '../stores/auth';
const router = useRouter();
const auth = useAuth();
const tours = ref([]);
const busqueda = ref('');
const pagina = ref(1);
const ultimaPagina = ref(1);
const cargando = ref(false);
const error = ref('');
const desdeCache = ref(false);
const guardadoEn = ref(0);
const fechaCache = computed(() => new Date(guardadoEn.value).toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' }));
// Son las mismas cuatro fotografías definidas en el catálogo de la página web.
const imagenesTours = [
    'https://images.pexels.com/photos/39402239/pexels-photo-39402239.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/11032583/pexels-photo-11032583.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/14624137/pexels-photo-14624137.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/30603643/pexels-photo-30603643.jpeg?auto=compress&cs=tinysrgb&w=600',
];
const toursFiltrados = computed(() => {
    const termino = busqueda.value.trim().toLocaleLowerCase('es-CR');
    if (!termino)
        return tours.value;
    return tours.value.filter(t => `${t.nombre} ${t.categoria?.nombre || ''} ${t.descripcion || ''}`.toLocaleLowerCase('es-CR').includes(termino));
});
function imagenTour(id) { return imagenesTours[(Math.max(1, Number(id)) - 1) % imagenesTours.length]; }
function imagenError(event) { event.target.style.visibility = 'hidden'; }
function verDetalle(id) { router.push(`/tours/${id}`); }
async function cargar(_reiniciar = false) {
    cargando.value = true;
    error.value = '';
    try {
        const { data } = await http.get('tours', { params: { page: 1, per_page: 10, estado: 'activo' } });
        tours.value = data.data;
        pagina.value = data.meta.current_page;
        ultimaPagina.value = data.meta.last_page;
        desdeCache.value = false;
        await guardarCache('tours_p1', data.data);
    }
    catch (e) {
        if (e.response?.status === 401)
            return;
        const guardado = await leerCache('tours_p1');
        if (guardado) {
            tours.value = guardado.datos;
            guardadoEn.value = guardado.guardadoEn;
            desdeCache.value = true;
        }
        else
            error.value = mensajeError(e);
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
async function refrescar(ev) { await cargar(true); ev.target.complete(); }
async function salir() { await auth.logout(); router.replace('/login'); }
onMounted(() => cargar());
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(desdeCache, {});
    __VLS_withDotValue(toursFiltrados, {});
    __VLS_withDotValue(cargando, {});
    __VLS_withDotValue(tours, {});
    __VLS_withDotValue(error, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['intro']} */ ;
    /** @type {__VLS_StyleScopedClasses['intro']} */ ;
    /** @type {__VLS_StyleScopedClasses['cabecera-lista']} */ ;
    /** @type {__VLS_StyleScopedClasses['cabecera-lista']} */ ;
    /** @type {__VLS_StyleScopedClasses['buscador']} */ ;
    /** @type {__VLS_StyleScopedClasses['buscador']} */ ;
    /** @type {__VLS_StyleScopedClasses['tarjeta']} */ ;
    /** @type {__VLS_StyleScopedClasses['tarjeta']} */ ;
    /** @type {__VLS_StyleScopedClasses['foto']} */ ;
    /** @type {__VLS_StyleScopedClasses['contenido']} */ ;
    /** @type {__VLS_StyleScopedClasses['pie-tarjeta']} */ ;
    /** @type {__VLS_StyleScopedClasses['pie-tarjeta']} */ ;
    /** @type {__VLS_StyleScopedClasses['estado']} */ ;
    /** @type {__VLS_StyleScopedClasses['estado']} */ ;
    /** @type {__VLS_StyleScopedClasses['esqueleto']} */ ;
    /** @type {__VLS_StyleScopedClasses['catalogo']} */ ;
    /** @type {__VLS_StyleScopedClasses['rejilla']} */ ;
    /** @type {__VLS_StyleScopedClasses['foto']} */ ;
    /** @type {__VLS_StyleScopedClasses['catalogo']} */ ;
    /** @type {__VLS_StyleScopedClasses['rejilla']} */ ;
    /** @type {__VLS_StyleScopedClasses['foto']} */ ;
    /** @type {__VLS_StyleScopedClasses['contenido']} */ ;
    /** @type {__VLS_StyleScopedClasses['pie-tarjeta']} */ ;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ class: "catalogo" },
    });
    /** @type {__VLS_StyleScopedClasses['catalogo']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "intro" },
    });
    /** @type {__VLS_StyleScopedClasses['intro']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "marca" },
    });
    /** @type {__VLS_StyleScopedClasses['marca']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "intro-icono" },
    });
    /** @type {__VLS_StyleScopedClasses['intro-icono']} */ ;
    if (desdeCache.value) {
        let __VLS_57;
        /** @ts-ignore @type { | typeof __VLS_components.ionChip | typeof IonChip | typeof __VLS_components['ion-chip'] | typeof __VLS_components.ionChip | typeof IonChip | typeof __VLS_components['ion-chip']} */
        ionChip;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
            // @ts-ignore
            color: "warning", ...{ class: "cache-chip" },
        }));
        const __VLS_59 = __VLS_58({
            color: "warning",
            ...{ class: "cache-chip" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        /** @type {__VLS_StyleScopedClasses['cache-chip']} */ ;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cabecera-lista" },
    });
    /** @type {__VLS_StyleScopedClasses['cabecera-lista']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (toursFiltrados.value.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contador" },
    });
    /** @type {__VLS_StyleScopedClasses['contador']} */ ;
    (toursFiltrados.value.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "buscador" },
    });
    /** @type {__VLS_StyleScopedClasses['buscador']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "search",
        placeholder: "Buscar un tour...",
        'aria-label': "Buscar un tour",
    });
    (__VLS_unwrap(busqueda, {}));
    if (cargando.value && !tours.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "rejilla" },
        });
        /** @type {__VLS_StyleScopedClasses['rejilla']} */ ;
        const __VLS_69 = __VLS_tryAsConstant((4));
        for (const [n] of __VLS_vFor(__VLS_nonNull(__VLS_69))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (n),
                ...{ class: "esqueleto" },
            });
            /** @type {__VLS_StyleScopedClasses['esqueleto']} */ ;
            let __VLS_70;
            /** @ts-ignore @type { | typeof __VLS_components.ionSkeletonText | typeof IonSkeletonText | typeof __VLS_components['ion-skeleton-text']} */
            ionSkeletonText;
            // @ts-ignore
            const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
                // @ts-ignore
                animated: true, ...{ class: "imagen-esqueleto" },
            }));
            const __VLS_72 = __VLS_71({
                animated: true,
                ...{ class: "imagen-esqueleto" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_71));
            /** @type {__VLS_StyleScopedClasses['imagen-esqueleto']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "esqueleto-texto" },
            });
            /** @type {__VLS_StyleScopedClasses['esqueleto-texto']} */ ;
            let __VLS_75;
            /** @ts-ignore @type { | typeof __VLS_components.ionSkeletonText | typeof IonSkeletonText | typeof __VLS_components['ion-skeleton-text']} */
            ionSkeletonText;
            // @ts-ignore
            const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
                // @ts-ignore
                animated: true, ...{ style: {} },
            }));
            const __VLS_77 = __VLS_76({
                animated: true,
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_76));
            let __VLS_80;
            /** @ts-ignore @type { | typeof __VLS_components.ionSkeletonText | typeof IonSkeletonText | typeof __VLS_components['ion-skeleton-text']} */
            ionSkeletonText;
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
                // @ts-ignore
                animated: true, ...{ style: {} },
            }));
            const __VLS_82 = __VLS_81({
                animated: true,
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_81));
            let __VLS_85;
            /** @ts-ignore @type { | typeof __VLS_components.ionSkeletonText | typeof IonSkeletonText | typeof __VLS_components['ion-skeleton-text']} */
            ionSkeletonText;
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
                // @ts-ignore
                animated: true, ...{ style: {} },
            }));
            const __VLS_87 = __VLS_86({
                animated: true,
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_86));
            // @ts-ignore
            [toursFiltrados, toursFiltrados, busqueda, cargando, tours,];
        }
    }
    else if (error.value && !tours.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "estado" },
        });
        /** @type {__VLS_StyleScopedClasses['estado']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (error.value);
        let __VLS_90;
        /** @ts-ignore @type { | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button'] | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button']} */
        ionButton;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
            // @ts-ignore
            ...{ 'onClick': {} },
        }));
        const __VLS_92 = __VLS_91({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        let __VLS_95;
        const __VLS_96 = {
            /** @type {typeof __VLS_95.click} */
            onClick: (...[$event]) => {
                void $event;
                if (!!(cargando.value && !tours.value.length))
                    throw 0;
                if (!(error.value && !tours.value.length))
                    throw 0;
                return (cargar(true));
                // @ts-ignore
                [tours, error, error,];
            },
        };
        void __VLS_96;
        var __VLS_93;
        var __VLS_94;
        const { default: __VLS_97 } = __VLS_nonNull(__VLS_93.slots);
        // @ts-ignore
        [];
    }
    else if (!toursFiltrados.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "estado" },
        });
        /** @type {__VLS_StyleScopedClasses['estado']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "estado-icono" },
        });
        /** @type {__VLS_StyleScopedClasses['estado-icono']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        (tours.value.length ? 'No encontramos ese tour' : 'Todavía no hay tours');
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (tours.value.length ? 'Probá con otro nombre.' : 'Pronto tendremos nuevas experiencias para vos.');
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "rejilla" },
        });
        /** @type {__VLS_StyleScopedClasses['rejilla']} */ ;
        const __VLS_98 = __VLS_tryAsConstant((toursFiltrados.value));
        for (const [t] of __VLS_vFor(__VLS_nonNull(__VLS_98))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!!(cargando.value && !tours.value.length))
                            throw 0;
                        if (!!(error.value && !tours.value.length))
                            throw 0;
                        if (!!(!toursFiltrados.value.length))
                            throw 0;
                        return (verDetalle(t.id));
                        // @ts-ignore
                        [toursFiltrados, toursFiltrados, tours, tours,];
                    } },
                ...{ onKeydown: (...[$event]) => {
                        void $event;
                        if (!!(cargando.value && !tours.value.length))
                            throw 0;
                        if (!!(error.value && !tours.value.length))
                            throw 0;
                        if (!!(!toursFiltrados.value.length))
                            throw 0;
                        return (verDetalle(t.id));
                        // @ts-ignore
                        [];
                    } },
                ...{ onKeydown: (...[$event]) => {
                        void $event;
                        if (!!(cargando.value && !tours.value.length))
                            throw 0;
                        if (!!(error.value && !tours.value.length))
                            throw 0;
                        if (!!(!toursFiltrados.value.length))
                            throw 0;
                        return (verDetalle(t.id));
                        // @ts-ignore
                        [];
                    } },
                key: (t.id),
                ...{ class: "tarjeta" },
                role: "button",
                tabindex: "0",
            });
            /** @type {__VLS_StyleScopedClasses['tarjeta']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "foto" },
            });
            /** @type {__VLS_StyleScopedClasses['foto']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                ...{ onError: (imagenError) },
                src: (imagenTour(t.id)),
                alt: (`Imagen de ${t.nombre}`),
                loading: "lazy",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "categoria" },
            });
            /** @type {__VLS_StyleScopedClasses['categoria']} */ ;
            (t.categoria?.nombre || 'Experiencia');
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "contenido" },
            });
            /** @type {__VLS_StyleScopedClasses['contenido']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
            (t.nombre);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "duracion" },
            });
            /** @type {__VLS_StyleScopedClasses['duracion']} */ ;
            (t.duracion_horas);
            (t.duracion_horas === 1 ? 'hora' : 'horas');
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "pie-tarjeta" },
            });
            /** @type {__VLS_StyleScopedClasses['pie-tarjeta']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "desde" },
            });
            /** @type {__VLS_StyleScopedClasses['desde']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (Number(t.precio).toLocaleString('es-CR'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "flecha" },
            });
            /** @type {__VLS_StyleScopedClasses['flecha']} */ ;
            // @ts-ignore
            [];
        }
    }
    let __VLS_99;
    /** @ts-ignore @type { | typeof __VLS_components.ionInfiniteScroll | typeof IonInfiniteScroll | typeof __VLS_components['ion-infinite-scroll'] | typeof __VLS_components.ionInfiniteScroll | typeof IonInfiniteScroll | typeof __VLS_components['ion-infinite-scroll']} */
    ionInfiniteScroll;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
        // @ts-ignore
        ...{ 'onIonInfinite': {} }, disabled: (__VLS_unwrap(pagina, {}) >= __VLS_unwrap(ultimaPagina, {}) || desdeCache.value),
    }));
    const __VLS_101 = __VLS_100({
        ...{ 'onIonInfinite': {} },
        disabled: (__VLS_unwrap(pagina, {}) >= __VLS_unwrap(ultimaPagina, {}) || desdeCache.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    let __VLS_104;
    const __VLS_105 = {
        /** @type {typeof __VLS_104.ionInfinite} */
        onIonInfinite: (...[$event]) => {
            void $event;
            return (masPaginas($event));
            // @ts-ignore
            [desdeCache, pagina, ultimaPagina,];
        },
    };
    void __VLS_105;
    var __VLS_102;
    var __VLS_103;
    const { default: __VLS_106 } = __VLS_nonNull(__VLS_102.slots);
    let __VLS_107;
    /** @ts-ignore @type { | typeof __VLS_components.ionInfiniteScrollContent | typeof IonInfiniteScrollContent | typeof __VLS_components['ion-infinite-scroll-content']} */
    ionInfiniteScrollContent;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
        // @ts-ignore
        loadingText: "Cargando más tours...",
    }));
    const __VLS_109 = __VLS_108({
        loadingText: "Cargando más tours...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_108));
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
