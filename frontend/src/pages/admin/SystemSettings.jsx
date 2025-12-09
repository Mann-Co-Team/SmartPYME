import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { getSettings, updateSettings } from '../../services/settings';

const SystemSettings = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [settings, setSettings] = useState({
        // Regional
        currency: 'CLP',
        language: 'es',
        timezone: 'America/Santiago',
        tax_rate: '19',

        // Notificaciones
        notification_email: '',

        // Plantillas
        email_template_order: {
            subject: '',
            body: ''
        },
        pdf_template_invoice: {
            header: '',
            footer: '',
            show_logo: true
        }
    });

    const [originalSettings, setOriginalSettings] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await getSettings();

            if (response.success) {
                const settingsData = {};
                Object.keys(response.data).forEach(key => {
                    settingsData[key] = response.data[key].value;
                });

                setSettings(settingsData);
                setOriginalSettings(JSON.stringify(settingsData));
            }
        } catch (error) {
            console.error('Error cargando configuraciones:', error);
            toast.error(t('settings.errorLoading'));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        setHasChanges(true);
    };

    const handleTemplateChange = (template, field, value) => {
        setSettings(prev => ({
            ...prev,
            [template]: {
                ...prev[template],
                [field]: value
            }
        }));
        setHasChanges(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            const response = await updateSettings(settings);

            if (response.success) {
                toast.success(t('settings.saveSuccess'));
                setOriginalSettings(JSON.stringify(settings));
                setHasChanges(false);

                // Aplicar cambios de idioma globalmente
                if (settings.language && settings.language !== i18n.language) {
                    i18n.changeLanguage(settings.language);
                    localStorage.setItem('i18nextLng', settings.language);
                }

                // Aplicar cambios de moneda globalmente
                if (settings.currency) {
                    localStorage.setItem('userCurrency', settings.currency);
                    // Disparar evento para que los componentes se actualicen
                    window.dispatchEvent(new Event('currencyChanged'));
                }
            }
        } catch (error) {
            console.error('Error guardando configuraciones:', error);
            toast.error(error.response?.data?.message || t('settings.errorSaving'));
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (originalSettings) {
            setSettings(JSON.parse(originalSettings));
            setHasChanges(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
                <p className="text-gray-600 mt-1">{t('settings.subtitle')}</p>
            </div>

            {hasChanges && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                    <span className="text-yellow-800">{t('settings.unsavedChanges')}</span>
                    <button
                        onClick={handleReset}
                        className="text-yellow-600 hover:text-yellow-800 font-medium"
                    >
                        {t('settings.discardChanges')}
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Configuración Regional */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ {t('settings.regionalConfig')}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Moneda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('common.currency')}
                            </label>
                            <select
                                value={settings.currency || 'CLP'}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="CLP">{t('currencies.clp')} (CLP)</option>
                                <option value="USD">{t('currencies.usd')} (USD)</option>
                                <option value="EUR">{t('currencies.eur')} (EUR)</option>
                                <option value="ARS">{t('currencies.ars')} (ARS)</option>
                                <option value="BRL">{t('currencies.brl')} (BRL)</option>
                                <option value="MXN">{t('currencies.mxn')} (MXN)</option>
                            </select>
                        </div>

                        {/* Idioma */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('common.language')}
                            </label>
                            <select
                                value={settings.language || 'es'}
                                onChange={(e) => handleChange('language', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="es">Español</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        {/* Zona Horaria */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('settings.timezone')}
                            </label>
                            <select
                                value={settings.timezone || 'America/Santiago'}
                                onChange={(e) => handleChange('timezone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="America/Santiago">Santiago (GMT-3)</option>
                                <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                                <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                                <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                                <option value="America/New_York">Nueva York (GMT-5)</option>
                                <option value="Europe/Madrid">Madrid (GMT+1)</option>
                            </select>
                        </div>

                        {/* Tasa de Impuesto */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('settings.taxRate')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={settings.tax_rate || '19'}
                                onChange={(e) => handleChange('tax_rate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Notificaciones */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">📧 {t('settings.notifications')}</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('settings.notificationEmail')}
                        </label>
                        <input
                            type="email"
                            value={settings.notification_email || ''}
                            onChange={(e) => handleChange('notification_email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="notificaciones@empresa.com"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {t('settings.notificationEmailHelp')}
                        </p>
                    </div>
                </div>

                {/* Plantillas de Email */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">📨 {t('settings.emailTemplates')}</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('settings.emailSubjectOrders')}
                            </label>
                            <input
                                type="text"
                                value={settings.email_template_order?.subject || ''}
                                onChange={(e) => handleTemplateChange('email_template_order', 'subject', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nuevo Pedido #{{order_id}}"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('settings.emailBodyOrders')}
                            </label>
                            <textarea
                                rows="6"
                                value={settings.email_template_order?.body || ''}
                                onChange={(e) => handleTemplateChange('email_template_order', 'body', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                placeholder="Estimado {{customer_name}},&#10;&#10;Su pedido #{{order_id}} ha sido recibido.&#10;&#10;Total: {{total}}&#10;&#10;Gracias por su compra."
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Variables disponibles: {'{'}{'{'} order_id {'}'}{'}'}, {'{'}{'{'} customer_name {'}'}{'}'}, {'{'}{'{'} total {'}'}{'}'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Plantillas de PDF */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">📄 {t('settings.pdfTemplates')}</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('settings.pdfHeaderInvoices')}
                            </label>
                            <input
                                type="text"
                                value={settings.pdf_template_invoice?.header || ''}
                                onChange={(e) => handleTemplateChange('pdf_template_invoice', 'header', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="{{company_name}}"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('settings.pdfFooterInvoices')}
                            </label>
                            <input
                                type="text"
                                value={settings.pdf_template_invoice?.footer || ''}
                                onChange={(e) => handleTemplateChange('pdf_template_invoice', 'footer', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Gracias por su compra"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="show_logo"
                                checked={settings.pdf_template_invoice?.show_logo || false}
                                onChange={(e) => handleTemplateChange('pdf_template_invoice', 'show_logo', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="show_logo" className="ml-2 block text-sm text-gray-700">
                                {t('settings.showLogoInPdf')}
                            </label>
                        </div>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={!hasChanges || saving}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={!hasChanges || saving}
                        className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? t('settings.saving') : t('settings.saveChanges')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SystemSettings;
