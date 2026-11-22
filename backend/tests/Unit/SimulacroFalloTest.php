<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class SimulacroFalloTest extends TestCase
{
    public function test_simulacro_de_fallo_para_evidencia_del_ci(): void
    {
        if (getenv('SIMULAR_FALLO') === '1') {
            $this->fail('Fallo simulado: el CI debe detener el despliegue.');
        }

        $this->assertTrue(true);
    }
}