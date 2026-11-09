/// <reference types="C:/Users/Wadih/Desktop/ProyectoMalparidosTour/mobile/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/Wadih/Desktop/ProyectoMalparidosTour/mobile/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth';
import { mensajeError } from '../services/http';
const router = useRouter();
const auth = useAuth();
const email = ref('');
const password = ref('');
const cargando = ref(false);
const error = ref('');
async function entrar() {
    error.value = '';
    cargando.value = true;
    try {
        await auth.login(email.value, password.value);
        router.replace('/tours'); // replace: atrás no regresa al login
    }
    catch (e) {
        error.value = mensajeError(e);
    }
    finally {
        cargando.value = false;
    }
}
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(error, {});
    __VLS_withDotValue(cargando, {});
    __VLS_withDotValue(email, {});
    __VLS_withDotValue(password, {});
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
    /** @ts-ignore @type { | typeof __VLS_components.ionContent | typeof IonContent | typeof __VLS_components['ion-content'] | typeof __VLS_components.ionContent | typeof IonContent | typeof __VLS_components['ion-content']} */
    ionContent;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        // @ts-ignore
        ...{ class: "ion-padding" },
    }));
    const __VLS_26 = __VLS_25({
        ...{ class: "ion-padding" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    /** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
    var __VLS_27;
    const { default: __VLS_29 } = __VLS_nonNull(__VLS_27.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (entrar) },
    });
    let __VLS_30;
    /** @ts-ignore @type { | typeof __VLS_components.ionInput | typeof IonInput | typeof __VLS_components['ion-input']} */
    ionInput;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        // @ts-ignore
        modelValue: (email.value), type: "email", label: "Correo", labelPlacement: "floating", fill: "outline", autocomplete: "email", ...{ class: "ion-margin-bottom" },
    }));
    const __VLS_32 = __VLS_31({
        modelValue: (email.value),
        type: "email",
        label: "Correo",
        labelPlacement: "floating",
        fill: "outline",
        autocomplete: "email",
        ...{ class: "ion-margin-bottom" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    /** @type {__VLS_StyleScopedClasses['ion-margin-bottom']} */ ;
    let __VLS_35;
    /** @ts-ignore @type { | typeof __VLS_components.ionInput | typeof IonInput | typeof __VLS_components['ion-input']} */
    ionInput;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        // @ts-ignore
        modelValue: (password.value), type: "password", label: "Contraseña", labelPlacement: "floating", fill: "outline", autocomplete: "current-password",
    }));
    const __VLS_37 = __VLS_36({
        modelValue: (password.value),
        type: "password",
        label: "Contraseña",
        labelPlacement: "floating",
        fill: "outline",
        autocomplete: "current-password",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    if (error.value) {
        let __VLS_40;
        /** @ts-ignore @type { | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text'] | typeof __VLS_components.ionText | typeof IonText | typeof __VLS_components['ion-text']} */
        ionText;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
            // @ts-ignore
            color: "danger",
        }));
        const __VLS_42 = __VLS_41({
            color: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        var __VLS_43;
        const { default: __VLS_45 } = __VLS_nonNull(__VLS_43.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (error.value);
        // @ts-ignore
        [email, password, error, error,];
    }
    let __VLS_46;
    /** @ts-ignore @type { | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button'] | typeof __VLS_components.ionButton | typeof IonButton | typeof __VLS_components['ion-button']} */
    ionButton;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
        // @ts-ignore
        expand: "block", type: "submit", ...{ class: "ion-margin-top" }, disabled: (cargando.value || !email.value || !password.value),
    }));
    const __VLS_48 = __VLS_47({
        expand: "block",
        type: "submit",
        ...{ class: "ion-margin-top" },
        disabled: (cargando.value || !email.value || !password.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    /** @type {__VLS_StyleScopedClasses['ion-margin-top']} */ ;
    var __VLS_49;
    const { default: __VLS_51 } = __VLS_nonNull(__VLS_49.slots);
    if (cargando.value) {
        let __VLS_52;
        /** @ts-ignore @type { | typeof __VLS_components.ionSpinner | typeof IonSpinner | typeof __VLS_components['ion-spinner']} */
        ionSpinner;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
            // @ts-ignore
            name: "dots",
        }));
        const __VLS_54 = __VLS_53({
            name: "dots",
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    // @ts-ignore
    [email, password, cargando, cargando,];
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
