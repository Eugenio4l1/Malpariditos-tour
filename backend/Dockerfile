# syntax=docker/dockerfile:1

# ---------- Etapa 1: dependencias de Composer (no llega a la imagen final) ----------
FROM composer:2 AS vendor
WORKDIR /app

# Dependencias primero: aprovecha la caché de capas de Docker
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction \
    --prefer-dist --ignore-platform-reqs

# Código y autoloader optimizado
COPY . .
RUN composer dump-autoload --no-dev --optimize --no-scripts --ignore-platform-reqs \
    && mkdir -p storage/framework/cache/data storage/framework/sessions \
                storage/framework/views storage/logs bootstrap/cache

# ---------- Etapa 2: imagen final mínima (Alpine, PHP 8.4, Nginx + FPM) ----------
FROM serversideup/php:8.4-fpm-nginx-alpine AS final

ENV PHP_OPCACHE_ENABLE=1 \
    AUTORUN_ENABLED=true

WORKDIR /var/www/html
COPY --from=vendor --chown=www-data:www-data /app /var/www/html

# Usuario sin privilegios: el contenedor NO corre como administrador
USER www-data

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/up || exit 1