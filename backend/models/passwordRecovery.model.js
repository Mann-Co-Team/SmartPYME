const crypto = require('crypto');
const db = require('../config/db');

class PasswordRecoveryModel {
    // Crear token de recuperación
    static async createRecoveryToken(userId) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hora

        await db.execute(
            `INSERT INTO password_recovery_tokens (id_usuario, token, expiry) 
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE token = ?, expiry = ?`,
            [userId, token, expiry, token, expiry]
        );

        return token;
    }

    // Verificar token
    static async verifyToken(token) {
        const [rows] = await db.execute(
            `SELECT id_usuario, expiry FROM password_recovery_tokens 
             WHERE token = ? AND expiry > NOW() AND used = 0`,
            [token]
        );

        return rows.length > 0 ? rows[0] : null;
    }

    // Marcar token como usado
    static async markTokenAsUsed(token) {
        await db.execute(
            'UPDATE password_recovery_tokens SET used = 1 WHERE token = ?',
            [token]
        );
    }

    // Limpiar tokens expirados
    static async cleanExpiredTokens() {
        await db.execute(
            'DELETE FROM password_recovery_tokens WHERE expiry < NOW() OR used = 1'
        );
    }
}

module.exports = PasswordRecoveryModel;
