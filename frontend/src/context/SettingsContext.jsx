import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        currency: 'CLP',
        language: 'es',
        timezone: 'America/Santiago',
        tax_rate: 19,
        notification_email: '',
        email_template_order: { subject: '', body: '' },
        pdf_template_invoice: { header: '', footer: '', show_logo: true }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        console.log('[SettingsContext] Loading settings...');
        try {
            // Usar endpoint público que no requiere autenticación
            const response = await fetch('http://localhost:3000/api/settings/public');
            const data = await response.json();

            console.log('[SettingsContext] Settings response:', data);

            if (data.success && data.data) {
                // Obtener tenant ID de la URL actual
                const pathParts = window.location.pathname.split('/');
                const tenantSlug = pathParts[1] || pathParts[2]; // /tienda/slug o /slug

                console.log('[SettingsContext] Tenant slug:', tenantSlug);

                // Buscar settings del tenant actual
                // Por ahora usar el primer tenant disponible si no encontramos match
                const tenantIds = Object.keys(data.data);
                const tenantId = tenantIds[0]; // Simplificado - usar primer tenant

                console.log('[SettingsContext] Using tenant ID:', tenantId);

                if (tenantId && data.data[tenantId]) {
                    const parsedSettings = {};
                    data.data[tenantId].forEach(setting => {
                        parsedSettings[setting.key] = setting.value;
                    });

                    console.log('[SettingsContext] Parsed settings:', parsedSettings);
                    setSettings(prev => ({ ...prev, ...parsedSettings }));
                }
            }
        } catch (error) {
            console.error('[SettingsContext] Error loading settings:', error);
            // Mantener valores por defecto si falla
        } finally {
            setLoading(false);
        }
    };

    const refreshSettings = () => {
        setLoading(true);
        loadSettings();
    };

    // Exponer refreshSettings globalmente para que Settings.jsx pueda llamarlo
    useEffect(() => {
        window.refreshGlobalSettings = refreshSettings;
        return () => {
            delete window.refreshGlobalSettings;
        };
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
