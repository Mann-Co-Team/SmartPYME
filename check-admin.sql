SELECT id_usuario, nombre, email, id_rol, activo, LEFT(password, 30) as password_hash 
FROM usuarios 
WHERE email='admin@smartpyme.com';
