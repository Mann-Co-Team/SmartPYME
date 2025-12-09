// Controlador de Configuraciones del Sistema
const SystemSettings = require('../models/systemSettings.model');
const AuditoriaModel = require('../models/auditoria.model');

class SettingsController {
    /**
     * Obtener todas las configuraciones
     * GET /api/settings
     */
    static async getAll(req, res) {
        try {
            const tenantId = req.user.tenant_id;
            const isAdmin = req.user.role === 1;

            let settings;
            if (isAdmin) {
                settings = await SystemSettings.getAll(tenantId);
            } else {
                // Usuarios no admin solo ven configuraciones públicas
                settings = await SystemSettings.getPublic(tenantId);
            }

            // Convertir array a objeto para facilitar uso en frontend
            const settingsObject = {};
            settings.forEach(setting => {
                settingsObject[setting.setting_key] = {
                    value: setting.setting_value,
                    type: setting.setting_type,
                    category: setting.category,
                    description: setting.description
                };
            });

            res.json({
                success: true,
                data: settingsObject
            });

        } catch (error) {
            console.error('Error obteniendo configuraciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo configuraciones del sistema',
                error: error.message
            });
        }
    }

    /**
     * Obtener configuraciones públicas (sin autenticación)
     * GET /api/settings/public
     */
    static async getPublic(req, res) {
        try {
            // Obtener configuraciones públicas de todos los tenants
            // o del tenant específico si se proporciona
            const settings = await SystemSettings.getPublicSettings();

            res.json({
                success: true,
                data: settings
            });

        } catch (error) {
            console.error('Error obteniendo configuraciones públicas:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo configuraciones públicas',
                error: error.message
            });
        }
    }

    /**
     * Obtener configuración por clave
     * GET /api/settings/:key
     */
    static async getByKey(req, res) {
        try {
            const { key } = req.params;
            const tenantId = req.user.tenant_id;

            const setting = await SystemSettings.getByKey(tenantId, key);

            if (!setting) {
                return res.status(404).json({
                    success: false,
                    message: `Configuración '${key}' no encontrada`
                });
            }

            // Verificar si el usuario tiene permiso para ver esta configuración
            if (!setting.is_public && req.user.role !== 1) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para ver esta configuración'
                });
            }

            res.json({
                success: true,
                data: {
                    key: setting.setting_key,
                    value: setting.setting_value,
                    type: setting.setting_type,
                    category: setting.category,
                    description: setting.description
                }
            });

        } catch (error) {
            console.error('Error obteniendo configuración:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo configuración',
                error: error.message
            });
        }
    }

    /**
     * Obtener configuraciones por categoría
     * GET /api/settings/category/:category
     */
    static async getByCategory(req, res) {
        try {
            const { category } = req.params;
            const tenantId = req.user.tenant_id;

            const settings = await SystemSettings.getByCategory(tenantId, category);

            const settingsObject = {};
            settings.forEach(setting => {
                // Filtrar configuraciones privadas para usuarios no admin
                if (setting.is_public || req.user.role === 1) {
                    settingsObject[setting.setting_key] = {
                        value: setting.setting_value,
                        type: setting.setting_type,
                        description: setting.description
                    };
                }
            });

            res.json({
                success: true,
                data: settingsObject
            });

        } catch (error) {
            console.error('Error obteniendo configuraciones por categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo configuraciones',
                error: error.message
            });
        }
    }

    /**
     * Actualizar configuraciones
     * PUT /api/settings
     */
    static async update(req, res) {
        try {
            console.log('🔍 DEBUG - Update called');
            console.log('🔍 DEBUG - req.user:', req.user);

            const tenantId = req.user.tenant_id;
            const userId = req.user.userId;
            const settings = req.body;

            console.log('🔍 DEBUG - tenantId:', tenantId);
            console.log('🔍 DEBUG - userId:', userId);
            console.log('🔍 DEBUG - settings:', settings);

            // Solo administradores pueden actualizar configuraciones
            if (req.user.role !== 1) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo los administradores pueden modificar configuraciones'
                });
            }

            console.log('🔍 DEBUG - Validating settings...');
            // Validar configuraciones
            const validationErrors = await SettingsController.validateSettings(settings);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: validationErrors
                });
            }

            console.log('🔍 DEBUG - Updating settings in DB...');
            // Actualizar configuraciones
            await SystemSettings.updateMultiple(tenantId, settings, userId);

            console.log('🔍 DEBUG - Creating audit log...');
            // Registrar en auditoría
            await AuditoriaModel.create({
                id_tenant: tenantId,
                id_usuario: userId,
                accion: 'CONFIGURACION_ACTUALIZADA',
                modulo: 'sistema',
                descripcion: `Configuraciones actualizadas: ${Object.keys(settings).join(', ')}`,
                tabla_afectada: 'system_settings',
                id_registro: null,
                datos_anteriores: null,
                datos_nuevos: settings,
                ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                user_agent: req.get('user-agent'),
                resultado: 'exito',
                mensaje_error: null
            });

            console.log('🔍 DEBUG - Success!');
            res.json({
                success: true,
                message: 'Configuraciones actualizadas exitosamente'
            });

        } catch (error) {
            console.error('❌ Error actualizando configuraciones:', error);
            console.error('❌ Stack completo:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Error actualizando configuraciones',
                error: error.message
            });
        }
    }

    /**
     * Validar configuraciones
     */
    static async validateSettings(settings) {
        const errors = [];

        // Validar moneda
        if (settings.currency) {
            const validCurrencies = ['CLP', 'USD', 'EUR', 'ARS', 'BRL', 'MXN'];
            if (!validCurrencies.includes(settings.currency)) {
                errors.push({
                    field: 'currency',
                    message: `Moneda inválida. Debe ser una de: ${validCurrencies.join(', ')}`
                });
            }
        }

        // Validar idioma
        if (settings.language) {
            const validLanguages = ['es', 'en'];
            if (!validLanguages.includes(settings.language)) {
                errors.push({
                    field: 'language',
                    message: 'Idioma inválido. Debe ser "es" o "en"'
                });
            }
        }

        // Validar email de notificaciones
        if (settings.notification_email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(settings.notification_email)) {
                errors.push({
                    field: 'notification_email',
                    message: 'Email inválido'
                });
            }
        }

        // Validar tasa de impuesto
        if (settings.tax_rate !== undefined) {
            const taxRate = parseFloat(settings.tax_rate);
            if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
                errors.push({
                    field: 'tax_rate',
                    message: 'La tasa de impuesto debe estar entre 0 y 100'
                });
            }
        }

        // Validar zona horaria
        if (settings.timezone) {
            const validTimezones = [
                'America/Santiago',
                'America/Argentina/Buenos_Aires',
                'America/Sao_Paulo',
                'America/Mexico_City',
                'America/New_York',
                'Europe/Madrid'
            ];
            if (!validTimezones.includes(settings.timezone)) {
                errors.push({
                    field: 'timezone',
                    message: 'Zona horaria inválida'
                });
            }
        }

        return errors;
    }
}

module.exports = SettingsController;
