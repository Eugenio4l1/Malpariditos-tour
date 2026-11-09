
<?php

$db = new PDO('sqlite:database/database.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$email = 'admin@malpariditostours.test';

$consulta = $db->prepare(
    'SELECT id FROM users WHERE email = :email'
);
$consulta->execute(['email' => $email]);

if ($consulta->fetch()) {
    echo "El administrador de prueba ya existe." . PHP_EOL;
    exit;
}

$password = password_hash('AdminTour2026!', PASSWORD_BCRYPT);

$insertar = $db->prepare(
    'INSERT INTO users
    (name, email, password, role, created_at, updated_at)
    VALUES
    (:name, :email, :password, :role, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
);

$insertar->execute([
    'name' => 'Administrador de Prueba',
    'email' => $email,
    'password' => $password,
    'role' => 'admin'
]);

echo "Administrador creado correctamente." . PHP_EOL;
echo "Correo: " . $email . PHP_EOL;
