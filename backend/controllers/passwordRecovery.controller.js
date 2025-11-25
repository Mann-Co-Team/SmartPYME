const UsuarioModel = require('../models/usuario.model');
const PasswordRecoveryModel = require('../models/passwordRecovery.model');
const bcrypt = require('bcryptjs');

class PasswordRecoveryController {
    // Solicitar recuperación de contraseña
    static async solicitarRecuperacion(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'El email es requerido'
                });
            }

            // Buscar usuario
            const usuario = await UsuarioModel.getByEmail(email);

            // Por seguridad, siempre responder exitosamente aunque el email no exista
            if (!usuario) {
                return res.json({
                    success: true,
                    message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
                });
            }

            // Generar token
            const token = await PasswordRecoveryModel.createRecoveryToken(usuario.id_usuario);

            // En producción, aquí se enviaría un email con el link
            // Por ahora, lo mostraremos en consola
            console.log('\n╔════════════════════════════════════════════════════════════╗');
            console.log('║           RECUPERACIÓN DE CONTRASEÑA SOLICITADA            ║');
            console.log('╠════════════════════════════════════════════════════════════╣');
            console.log(`║ Email: ${email.padEnd(48)} ║`);
            console.log(`║ Token: ${token.padEnd(48)} ║`);
            console.log(`║ Link: http://localhost:5173/recuperar-password/${token.padEnd(19)} ║`);
            console.log(`║ Válido por: 1 hora${' '.repeat(38)} ║`);
            console.log('╚════════════════════════════════════════════════════════════╝\n');

            res.json({
                success: true,
                message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
                // Solo para desarrollo:
                dev_token: process.env.NODE_ENV === 'development' ? token : undefined
            });

        } catch (error) {
            console.error('Error solicitando recuperación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al procesar la solicitud'
            });
        }
    }

    // Verificar token de recuperación
    static async verificarToken(req, res) {
        try {
            const { token } = req.params;

            const tokenData = await PasswordRecoveryModel.verifyToken(token);

            if (!tokenData) {
                return res.status(400).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
            }

            res.json({
                success: true,
                message: 'Token válido'
            });

        } catch (error) {
            console.error('Error verificando token:', error);
            res.status(500).json({
                success: false,
                message: 'Error al verificar el token'
            });
        }
    }

    // Resetear contraseña con token
    static async resetearPassword(req, res) {
        try {
            const { token, nuevaPassword, confirmarPassword } = req.body;

            if (!token || !nuevaPassword || !confirmarPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos'
                });
            }

            if (nuevaPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            if (nuevaPassword !== confirmarPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Las contraseñas no coinciden'
                });
            }

            // Verificar token
            const tokenData = await PasswordRecoveryModel.verifyToken(token);

            if (!tokenData) {
                return res.status(400).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
            }

            // Hash de la nueva contraseña
            const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

            // Actualizar contraseña
            await UsuarioModel.updatePassword(tokenData.id_usuario, hashedPassword);

            // Marcar token como usado
            await PasswordRecoveryModel.markTokenAsUsed(token);

            console.log(`✅ Contraseña reseteada para usuario ID: ${tokenData.id_usuario}`);

            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });

        } catch (error) {
            console.error('Error reseteando contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error al resetear la contraseña'
            });
        }
    }
}

module.exports = PasswordRecoveryController;
