
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';
import exec from 'k6/execution';

// Dirección de la API y token de administrador
const BASE_URL = __ENV.BASE_URL;
const TOKEN = __ENV.TOKEN;

// Métricas que contabilizan únicamente los 60 segundos medidos
const solicitudesMedidas = new Counter('solicitudes_medidas');
const erroresMedidos = new Rate('errores_medidos');
const latenciaMedida = new Trend('latencia_medida', true);

export const options = {
    scenarios: {
        calentamiento: {
            executor: 'constant-vus',
            vus: 50,
            duration: '30s',
            gracefulStop: '0s',
        },
        medicion: {
            executor: 'constant-vus',
            vus: 50,
            startTime: '30s',
            duration: '60s',
            gracefulStop: '0s',
        },
    },
};

export default function () {
    const respuesta = http.get(
        BASE_URL,
        {
            headers: {
                Accept: 'application/json',
            },
        }
    );

    // Ignorar las solicitudes del calentamiento
    if (exec.scenario.name === 'medicion') {
        solicitudesMedidas.add(1);

        latenciaMedida.add(respuesta.timings.duration);

        erroresMedidos.add(
            respuesta.status < 200 || respuesta.status >= 400
        );
    }
}

export function handleSummary(data) {
    const solicitudes = data.metrics.solicitudes_medidas.values.count;
    const latencia = data.metrics.latencia_medida.values;
    const errores = data.metrics.errores_medidos.values.rate;

    const resultado = {
        peticiones_por_segundo: solicitudes / 60,
        latencia_p95_ms: latencia['p(95)'],
        tasa_errores_porcentaje: errores * 100,
        total_solicitudes: solicitudes,
    };

    return {
        stdout: JSON.stringify(resultado, null, 2),
    };
}

