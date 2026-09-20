<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Yaml\Yaml;

class ExportOpenApi extends Command
{
    protected $signature = 'openapi:export {--path=../docs/openapi.yaml : Ruta de salida, relativa a backend/}';

    protected $description = 'Exporta la especificación OpenAPI generada por Scramble a un archivo YAML';

    public function handle(): int
    {
        $temporal = 'storage/app/openapi.tmp.json';

        if ($this->call('scramble:export', ['--path' => $temporal]) !== self::SUCCESS || ! is_file(base_path($temporal))) {
            $this->error('No se pudo generar la especificación con scramble:export.');

            return self::FAILURE;
        }

        $especificacion = json_decode(file_get_contents(base_path($temporal)), false, 512, JSON_THROW_ON_ERROR);
        unlink(base_path($temporal));

        $yaml = Yaml::dump(
            $especificacion,
            20,
            2,
            Yaml::DUMP_OBJECT_AS_MAP | Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK | Yaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE
        );

        file_put_contents(base_path($this->option('path')), $yaml);
        $this->info('Especificación exportada a '.$this->option('path'));

        return self::SUCCESS;
    }
}