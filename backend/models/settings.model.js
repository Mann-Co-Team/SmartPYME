const db = require('../config/db');

class SettingsModel {
    static async getAll() {
        try {
            const [rows] = await db.execute(`
                SELECT setting_key, setting_value, description, updated_at
                FROM settings 
                ORDER BY setting_key ASC
            `);
            
            // Convertir a objeto key-value
            const settings = {};
            rows.forEach(row => {
                settings[row.setting_key] = row.setting_value;
            });
            
            return settings;
        } catch (error) {
            throw error;
        }
    }

    static async getByKey(key) {
        try {
            const [rows] = await db.execute(`
                SELECT setting_key, setting_value, description
                FROM settings 
                WHERE setting_key = ?
            `, [key]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async updateSetting(key, value) {
        try {
            const [result] = await db.execute(`
                INSERT INTO settings (setting_key, setting_value, updated_at)
                VALUES (?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                setting_value = VALUES(setting_value),
                updated_at = NOW()
            `, [key, value]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updateMultiple(settings) {
        try {
            const queries = Object.entries(settings).map(([key, value]) => {
                return db.execute(`
                    INSERT INTO settings (setting_key, setting_value, updated_at)
                    VALUES (?, ?, NOW())
                    ON DUPLICATE KEY UPDATE
                    setting_value = VALUES(setting_value),
                    updated_at = NOW()
                `, [key, value]);
            });

            await Promise.all(queries);
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SettingsModel;
