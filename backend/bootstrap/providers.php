<?php

use App\Providers\AppServiceProvider;
use App\Providers\ConfiguracionProduccionProvider;
use Laravel\Sanctum\SanctumServiceProvider;

return [
    ConfiguracionProduccionProvider::class,
    AppServiceProvider::class,
    SanctumServiceProvider::class,
];