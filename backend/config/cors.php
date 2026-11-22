<?php

/*
 * Los orígenes permitidos se leen de CORS_ALLOWED_ORIGINS (separados por coma).
 * Solo en entorno local hay valores por omisión; en cualquier otro entorno,
 * si la variable falta, la lista queda vacía.
 */
$origenes = env(
    'CORS_ALLOWED_ORIGINS',
    env('APP_ENV') === 'local'
        ? 'http://localhost,https://localhost,capacitor://localhost,http://localhost:8100,http://localhost:1234'
        : ''
);

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', (string) $origenes)))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Location'],

    'max_age' => 0,

    'supports_credentials' => false,

];