import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBackups, createBackup, deleteBackup, downloadBackup, getLastBackup, restoreToTest, promoteToProduction } from '../../services/backup';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    ArrowDownTrayIcon,
    TrashIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    CloudArrowDownIcon,
    XMarkIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const Backups = () => {
    const { t } = useTranslation();
    const [backups, setBackups] = useState([]);
    const [lastBackup, setLastBackup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [filter, setFilter] = useState('all');

    // Modal de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleting, setDeleting] = useState(false);

    // Modal de restauración
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [restoreTarget, setRestoreTarget] = useState(null);
    const [restoreStep, setRestoreStep] = useState(1); // 1 = test, 2 = production
    const [restoring, setRestoring] = useState(false);
    const [restorePassword, setRestorePassword] = useState('');
    const [testDbReady, setTestDbReady] = useState(false);


    useEffect(() => {
        loadBackups();
        loadLastBackup();
    }, [filter]);

    const loadBackups = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (filter !== 'all') {
                filters.backup_type = filter;
            }
            const data = await getBackups(filters);
            setBackups(data.data || []);
        } catch (err) {
            console.error('Error cargando backups:', err);
            setError('Error cargando backups');
        } finally {
            setLoading(false);
        }
    };

    const loadLastBackup = async () => {
        try {
            const data = await getLastBackup();
            setLastBackup(data.data);
        } catch (err) {
            console.error('Error cargando último backup:', err);
        }
    };

    const handleCreateBackup = async () => {
        try {
            setCreating(true);
            setError(null);
            setSuccess(null);
            await createBackup(false);
            setSuccess(t('admin.backups.backupCreated'));
            loadBackups();
            loadLastBackup();
        } catch (err) {
            console.error('Error creando backup:', err);
            setError(err.message || 'Error creando backup');
        } finally {
            setCreating(false);
        }
    };

    const handleDownload = async (id, filename) => {
        try {
            await downloadBackup(id, filename);
            setSuccess('Backup descargado exitosamente');
        } catch (err) {
            console.error('Error descargando backup:', err);
            setError('Error descargando backup');
        }
    };

    const openDeleteModal = (backup) => {
        setDeleteTarget(backup);
        setDeletePassword('');
        setShowDeleteModal(true);

        // Si es fallido, eliminar directamente sin contraseña
        if (backup.status === 'failed') {
            confirmDeleteFailed(backup);
        }
    };

    const confirmDeleteFailed = async (backup) => {
        try {
            setDeleting(true);
            setError(null);
            // Para backups fallidos, enviar password vacío (backend lo permitirá)
            await deleteBackup(backup.id_backup, 'SKIP_PASSWORD_CHECK');
            setSuccess('Backup fallido eliminado exitosamente');
            closeDeleteModal();
            loadBackups();
            loadLastBackup();
        } catch (err) {
            console.error('Error eliminando backup fallido:', err);
            setError(err.message || 'Error eliminando backup');
        } finally {
            setDeleting(false);
        }
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
        setDeletePassword('');
    };

    const confirmDelete = async () => {
        if (!deletePassword.trim()) {
            setError('Debes ingresar tu contraseña');
            return;
        }

        try {
            setDeleting(true);
            setError(null);
            await deleteBackup(deleteTarget.id_backup, deletePassword);
            setSuccess(t('admin.backups.backupCreated'));
            closeDeleteModal();
            loadBackups();
            loadLastBackup();
        } catch (err) {
            console.error('Error eliminando backup:', err);
            setError(err.message || 'Error eliminando backup. Verifica tu contraseña.');
        } finally {
            setDeleting(false);
        }
    };

    // Funciones de restauración
    const openRestoreModal = (backup) => {
        setRestoreTarget(backup);
        setRestoreStep(1);
        setTestDbReady(false);
        setRestorePassword('');
        setError(null);
        setShowRestoreModal(true);
    };

    const closeRestoreModal = () => {
        setShowRestoreModal(false);
        setRestoreTarget(null);
        setRestoreStep(1);
        setTestDbReady(false);
        setRestorePassword('');
        setError(null);
    };

    const handleRestoreToTest = async () => {
        try {
            setRestoring(true);
            setError(null);
            await restoreToTest(restoreTarget.id_backup);
            setTestDbReady(true);
            setRestoreStep(2);
            setSuccess('Backup restaurado en base de datos de prueba. Verifica los datos antes de promover a producción.');
        } catch (err) {
            console.error('Error restaurando a prueba:', err);
            setError(err.message || 'Error restaurando backup a base de datos de prueba');
        } finally {
            setRestoring(false);
        }
    };

    const handlePromoteToProduction = async () => {
        if (!restorePassword.trim()) {
            setError('Debes ingresar tu contraseña para promover a producción');
            return;
        }

        try {
            setRestoring(true);
            setError(null);
            await promoteToProduction(restorePassword);
            setSuccess('¡Base de datos restaurada exitosamente en producción!');
            closeRestoreModal();
            loadBackups();
            loadLastBackup();
        } catch (err) {
            console.error('Error promoviendo a producción:', err);
            setError(err.message || 'Error promoviendo a producción. Verifica tu contraseña.');
        } finally {
            setRestoring(false);
        }
    };


    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            success: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                icon: CheckCircleIcon,
                label: 'Exitoso'
            },
            failed: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                icon: XCircleIcon,
                label: 'Fallido'
            },
            in_progress: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                icon: ClockIcon,
                label: 'En Progreso'
            }
        };

        const badge = badges[status] || badges.in_progress;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon className="h-4 w-4" />
                {badge.label}
            </span>
        );
    };

    const getTypeBadge = (type) => {
        return type === 'automatic' ? (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Automático
            </span>
        ) : (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                Manual
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('admin.backups.title')}</h1>
                <p className="text-gray-600 mt-1">Administra las copias de seguridad de tu base de datos</p>
            </div>

            {/* Mensajes */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                    <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-red-800">{error}</span>
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-green-800">{success}</span>
                </div>
            )}

            {/* Card de Último Backup */}
            {lastBackup && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">Último Backup Exitoso</h3>
                            <div className="space-y-1 text-sm text-blue-800">
                                <p>📅 {formatDate(lastBackup.created_at)}</p>
                                <p>📦 {formatFileSize(lastBackup.file_size)}</p>
                                <p>📝 {lastBackup.filename}</p>
                            </div>
                        </div>
                        <CloudArrowDownIcon className="h-16 w-16 text-blue-400" />
                    </div>
                </div>
            )}

            {/* Acciones */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('manual')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'manual'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Manuales
                    </button>
                    <button
                        onClick={() => setFilter('automatic')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'automatic'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Automáticos
                    </button>
                </div>

                <button
                    onClick={handleCreateBackup}
                    disabled={creating}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CloudArrowDownIcon className="h-5 w-5" />
                    {creating ? 'Creando...' : 'Crear Backup de Empresa'}
                </button>
            </div>

            {/* Tabla de Backups */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Archivo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tamaño
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {backups.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No hay backups disponibles
                                </td>
                            </tr>
                        ) : (
                            backups.map((backup) => (
                                <tr key={backup.id_backup} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(backup.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="max-w-xs truncate" title={backup.filename}>
                                            {backup.filename}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatFileSize(backup.file_size)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getTypeBadge(backup.backup_type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(backup.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            {backup.status === 'success' && (
                                                <>
                                                    <button
                                                        onClick={() => handleDownload(backup.id_backup, backup.filename)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Descargar"
                                                    >
                                                        <ArrowDownTrayIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openRestoreModal(backup)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Restaurar"
                                                    >
                                                        <ArrowPathIcon className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => openDeleteModal(backup)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Eliminar"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Eliminación */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Eliminar Backup</h3>
                            <button
                                onClick={closeDeleteModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                ⚠️ Estás a punto de eliminar el backup:
                            </p>
                            <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded">
                                {deleteTarget?.filename}
                            </p>
                            <p className="text-sm text-red-600 mt-2">
                                Esta acción NO se puede deshacer.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ingresa tu contraseña para confirmar:
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Contraseña"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        confirmDelete();
                                    }
                                }}
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting || !deletePassword.trim()}
                                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? 'Eliminando...' : 'Eliminar Backup'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Restauración */}
            {showRestoreModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Restaurar Backup - {restoreStep === 1 ? 'Paso 1: Prueba' : 'Paso 2: Producción'}
                            </h3>
                            <button
                                onClick={closeRestoreModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                                {error}
                            </div>
                        )}

                        {restoreTarget && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
                                <p><strong>Archivo:</strong> {restoreTarget.filename}</p>
                                <p><strong>Fecha:</strong> {formatDate(restoreTarget.created_at)}</p>
                                <p><strong>Tamaño:</strong> {formatFileSize(restoreTarget.file_size)}</p>
                            </div>
                        )}

                        {restoreStep === 1 ? (
                            <>
                                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                    <h4 className="font-semibold text-blue-900 mb-2">📋 Paso 1: Restaurar a Base de Datos de Prueba</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Se creará una base de datos temporal: <code className="bg-blue-100 px-1 rounded">smartpyme_db_test</code></li>
                                        <li>• Podrás verificar los datos antes de aplicar a producción</li>
                                        <li>• <strong>Sin riesgo</strong> para la base de datos actual</li>
                                    </ul>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={closeRestoreModal}
                                        disabled={restoring}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleRestoreToTest}
                                        disabled={restoring}
                                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {restoring ? 'Restaurando...' : 'Restaurar a Prueba'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                                    <h4 className="font-semibold text-green-900 mb-2">✅ Base de Datos de Prueba Lista</h4>
                                    <p className="text-sm text-green-800 mb-2">
                                        El backup ha sido restaurado exitosamente en <code className="bg-green-100 px-1 rounded">smartpyme_db_test</code>
                                    </p>
                                    <p className="text-sm text-green-800">
                                        Verifica los datos antes de continuar.
                                    </p>
                                </div>

                                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Paso 2: Promover a Producción</h4>
                                    <ul className="text-sm text-yellow-800 space-y-1">
                                        <li>• Se creará un backup automático de la BD actual</li>
                                        <li>• La BD de prueba reemplazará la BD de producción</li>
                                        <li>• <strong>Esta acción es irreversible</strong></li>
                                        <li>• Requiere contraseña de administrador</li>
                                    </ul>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contraseña de Administrador *
                                    </label>
                                    <input
                                        type="password"
                                        value={restorePassword}
                                        onChange={(e) => setRestorePassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Ingresa tu contraseña"
                                        disabled={restoring}
                                    />
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={closeRestoreModal}
                                        disabled={restoring}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handlePromoteToProduction}
                                        disabled={restoring || !restorePassword.trim()}
                                        className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {restoring ? 'Promoviendo...' : 'Promover a Producción'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Información */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Información del Sistema de Backups</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Los backups se guardan como archivos SQL legibles</li>
                    <li>• Restauración segura en 2 pasos: primero a BD de prueba, luego a producción</li>
                    <li>• Los backups antiguos (más de 30 días) se eliminan automáticamente</li>
                    <li>• Los backups automáticos se ejecutan diariamente a las 2:00 AM</li>
                    <li>• Se requiere contraseña de administrador para eliminar y restaurar backups</li>
                    <li>• Notificaciones automáticas si falla un backup programado</li>
                </ul>
            </div>
        </div>
    );
};

export default Backups;
