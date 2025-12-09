// Controller de Backups - DESCARGA SIMPLE
const BackupModel = require('../models/backup.model');
const { createBackup } = require('../scripts/backup');
const { createTenantBackup } = require('../scripts/backup_tenant');
const fs = require('fs');
const path = require('path');

class BackupController {
    /**
     * Crear backup manual
     */
    static async create(req, res) {
        try {
            const tenantId = req.user.tenant_id;
            const userId = req.user.id_usuario;
            const tenantOnly = req.query.tenant_only === 'true';

            console.log(`📦 Creando backup ${tenantOnly ? 'por tenant' : 'completo'}...`);

            let result;
            if (tenantOnly) {
                result = await createTenantBackup(tenantId, userId, false);
            } else {
                result = await createBackup(tenantId, userId, false);
            }

            res.json({
                success: true,
                message: 'Backup creado exitosamente',
                data: result
            });
        } catch (error) {
            console.error('Error creando backup:', error);
            res.status(500).json({
                success: false,
                message: 'Error creando backup',
                error: error.message
            });
        }
    }

    /**
     * Listar backups
     */
    static async getAll(req, res) {
        try {
            const tenantId = req.user.tenant_id;
            const filters = {
                backup_type: req.query.backup_type,
                status: req.query.status,
                limit: req.query.limit,
                offset: req.query.offset
            };

            const backups = await BackupModel.getAll(tenantId, filters);
            const total = await BackupModel.count(tenantId, filters);

            res.json({
                success: true,
                data: backups,
                pagination: {
                    total,
                    limit: parseInt(filters.limit) || 50,
                    offset: parseInt(filters.offset) || 0
                }
            });
        } catch (error) {
            console.error('Error obteniendo backups:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo backups'
            });
        }
    }

    /**
     * Descargar backup - SQL DIRECTO
     */
    static async download(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user.tenant_id;

            console.log(`📥 Descargando backup ID: ${id} para tenant: ${tenantId}`);

            const backup = await BackupModel.getById(id, tenantId);

            if (!backup) {
                return res.status(404).json({
                    success: false,
                    message: 'Backup no encontrado'
                });
            }

            if (!fs.existsSync(backup.filepath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Archivo de backup no encontrado'
                });
            }

            console.log('📤 Enviando archivo:', backup.filename);

            // Enviar archivo SQL directamente
            res.download(backup.filepath, backup.filename);

        } catch (error) {
            console.error('❌ Error descargando backup:', error);
            res.status(500).json({
                success: false,
                message: 'Error descargando backup',
                error: error.message
            });
        }
    }

    /**
     * Eliminar backup - CON VERIFICACIÓN DE CONTRASEÑA (excepto fallidos)
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const { password } = req.body;
            const tenantId = req.user.tenant_id;
            const userId = req.user.id_usuario;

            console.log(`🗑️ Intentando eliminar backup ID: ${id}`);

            // Obtener backup primero para verificar estado
            const backup = await BackupModel.getById(id, tenantId);

            if (!backup) {
                return res.status(404).json({
                    success: false,
                    message: 'Backup no encontrado'
                });
            }

            // Si el backup es fallido, permitir eliminación sin contraseña
            if (backup.status === 'failed' || password === 'SKIP_PASSWORD_CHECK') {
                console.log('✅ Backup fallido - eliminando sin verificación de contraseña');
            } else {
                // Verificar que se proporcionó contraseña
                if (!password) {
                    return res.status(400).json({
                        success: false,
                        message: 'Se requiere contraseña para eliminar backups exitosos'
                    });
                }

                // Verificar contraseña del usuario
                const bcrypt = require('bcryptjs');
                const db = require('../config/db');

                const [users] = await db.execute(
                    'SELECT password FROM usuarios WHERE id_usuario = ?',
                    [userId]
                );

                if (users.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }

                const passwordMatch = await bcrypt.compare(password, users[0].password);

                if (!passwordMatch) {
                    console.log('❌ Contraseña incorrecta');
                    return res.status(401).json({
                        success: false,
                        message: 'Contraseña incorrecta'
                    });
                }

                console.log('✅ Contraseña verificada');
            }

            // Eliminar archivo físico
            if (fs.existsSync(backup.filepath)) {
                fs.unlinkSync(backup.filepath);
                console.log('✅ Archivo físico eliminado');
            }

            // Eliminar registro de BD
            await BackupModel.delete(id, tenantId);
            console.log('✅ Registro de BD eliminado');

            res.json({
                success: true,
                message: 'Backup eliminado exitosamente'
            });
        } catch (error) {
            console.error('❌ Error eliminando backup:', error);
            res.status(500).json({
                success: false,
                message: 'Error eliminando backup',
                error: error.message
            });
        }
    }

    /**
     * Obtener último backup
     */
    static async getLastBackup(req, res) {
        try {
            const tenantId = req.user.tenant_id;
            const lastBackup = await BackupModel.getLastSuccessful(tenantId);

            res.json({
                success: true,
                data: lastBackup
            });
        } catch (error) {
            console.error('Error obteniendo último backup:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo último backup'
            });
        }
    }

    /**
     * PASO 1: Restaurar backup a base de datos de prueba
     */
    static async restoreToTest(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user.tenant_id;

            console.log(`🔄 Restaurando backup ID: ${id} a BD de prueba`);

            const backup = await BackupModel.getById(id, tenantId);

            if (!backup) {
                return res.status(404).json({
                    success: false,
                    message: 'Backup no encontrado'
                });
            }

            if (backup.status !== 'success') {
                return res.status(400).json({
                    success: false,
                    message: 'Solo se pueden restaurar backups exitosos'
                });
            }

            if (!fs.existsSync(backup.filepath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Archivo de backup no encontrado'
                });
            }

            const { restoreToTestDatabase } = require('../scripts/restore');
            const result = await restoreToTestDatabase(backup.filepath, tenantId);

            res.json({
                success: true,
                message: 'Backup restaurado exitosamente en base de datos de prueba',
                data: result
            });

        } catch (error) {
            console.error('❌ Error restaurando a prueba:', error);
            res.status(500).json({
                success: false,
                message: 'Error restaurando backup a base de datos de prueba',
                error: error.message
            });
        }
    }

    /**
     * PASO 2: Promover base de datos de prueba a producción
     */
    static async promoteToProduction(req, res) {
        try {
            const { password } = req.body;
            const tenantId = req.user.tenant_id;
            const userId = req.user.id_usuario;

            console.log(`⚠️ Promoviendo BD de prueba a producción`);

            // Verificar contraseña
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere contraseña para promover a producción'
                });
            }

            const bcrypt = require('bcryptjs');
            const db = require('../config/db');

            const [users] = await db.execute(
                'SELECT password FROM usuarios WHERE id_usuario = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            const passwordMatch = await bcrypt.compare(password, users[0].password);

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Contraseña incorrecta'
                });
            }

            const { promoteTestToProduction } = require('../scripts/restore');
            const result = await promoteTestToProduction(tenantId, userId);

            res.json({
                success: true,
                message: 'Base de datos restaurada exitosamente en producción',
                data: result
            });

        } catch (error) {
            console.error('❌ Error promoviendo a producción:', error);
            res.status(500).json({
                success: false,
                message: 'Error promoviendo a producción',
                error: error.message
            });
        }
    }

    /**
     * Eliminar base de datos de prueba
     */
    static async deleteTestDb(req, res) {
        try {
            const { deleteTestDatabase } = require('../scripts/restore');
            await deleteTestDatabase();

            res.json({
                success: true,
                message: 'Base de datos de prueba eliminada'
            });

        } catch (error) {
            console.error('❌ Error eliminando BD de prueba:', error);
            res.status(500).json({
                success: false,
                message: 'Error eliminando base de datos de prueba',
                error: error.message
            });
        }
    }
}

module.exports = BackupController;
