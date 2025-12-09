/**
 * RF-15: Componente para visualizar logs de incidentes del sistema
 */
import React, { useState, useEffect } from 'react';
import { getIncidentLogs, clearIncidentLogs } from '../utils/retryHandler';

export default function SystemIncidents() {
    const [incidents, setIncidents] = useState([]);
    const [filter, setFilter] = useState('all'); // all, success, failed, retry

    useEffect(() => {
        loadIncidents();

        // Actualizar cada 5 segundos
        const interval = setInterval(loadIncidents, 5000);

        return () => clearInterval(interval);
    }, []);

    const loadIncidents = () => {
        const logs = getIncidentLogs();
        setIncidents(logs.reverse()); // Más recientes primero
    };

    const handleClearLogs = () => {
        if (window.confirm('¿Está seguro de limpiar todos los logs?')) {
            clearIncidentLogs();
            loadIncidents();
        }
    };

    const filteredIncidents = incidents.filter(incident => {
        if (filter === 'all') return true;
        if (filter === 'success') return incident.type === 'RETRY_SUCCESS';
        if (filter === 'failed') return incident.type === 'RETRY_FAILED';
        if (filter === 'retry') return incident.type === 'RETRY_ATTEMPT';
        return true;
    });

    const getIncidentIcon = (type) => {
        switch (type) {
            case 'RETRY_SUCCESS':
                return '✅';
            case 'RETRY_FAILED':
                return '❌';
            case 'RETRY_ATTEMPT':
                return '⚠️';
            default:
                return '📋';
        }
    };

    const getIncidentColor = (type) => {
        switch (type) {
            case 'RETRY_SUCCESS':
                return 'bg-green-50 border-green-200';
            case 'RETRY_FAILED':
                return 'bg-red-50 border-red-200';
            case 'RETRY_ATTEMPT':
                return 'bg-yellow-50 border-yellow-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getIncidentLabel = (type) => {
        switch (type) {
            case 'RETRY_SUCCESS':
                return 'Recuperado';
            case 'RETRY_FAILED':
                return 'Fallido';
            case 'RETRY_ATTEMPT':
                return 'Reintentando';
            default:
                return 'Incidente';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        📋 Logs de Incidentes del Sistema
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        RF-15: Recuperación ante Errores del Sistema
                    </p>
                </div>
                <button
                    onClick={handleClearLogs}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    🗑️ Limpiar Logs
                </button>
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Todos ({incidents.length})
                </button>
                <button
                    onClick={() => setFilter('success')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'success'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    ✅ Recuperados
                </button>
                <button
                    onClick={() => setFilter('failed')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'failed'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    ❌ Fallidos
                </button>
                <button
                    onClick={() => setFilter('retry')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'retry'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    ⚠️ Reintentos
                </button>
            </div>

            {/* Lista de incidentes */}
            <div className="space-y-2">
                {filteredIncidents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No hay incidentes registrados</p>
                    </div>
                ) : (
                    filteredIncidents.map((incident, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border ${getIncidentColor(incident.type)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    <span className="text-2xl">{getIncidentIcon(incident.type)}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">
                                                {incident.operation}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${incident.type === 'RETRY_SUCCESS' ? 'bg-green-200 text-green-800' :
                                                    incident.type === 'RETRY_FAILED' ? 'bg-red-200 text-red-800' :
                                                        'bg-yellow-200 text-yellow-800'
                                                }`}>
                                                {getIncidentLabel(incident.type)}
                                            </span>
                                        </div>

                                        {incident.error && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Error: {incident.error}
                                            </p>
                                        )}

                                        {incident.attempts && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Intentos: {incident.attempts}
                                            </p>
                                        )}

                                        {incident.attempt && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Intento: {incident.attempt}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <span className="text-xs text-gray-500">
                                    {new Date(incident.timestamp).toLocaleString('es-CL')}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-700">
                        {incidents.filter(i => i.type === 'RETRY_SUCCESS').length}
                    </div>
                    <div className="text-sm text-green-600 mt-1">Operaciones Recuperadas</div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-3xl font-bold text-red-700">
                        {incidents.filter(i => i.type === 'RETRY_FAILED').length}
                    </div>
                    <div className="text-sm text-red-600 mt-1">Operaciones Fallidas</div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-3xl font-bold text-yellow-700">
                        {incidents.filter(i => i.type === 'RETRY_ATTEMPT').length}
                    </div>
                    <div className="text-sm text-yellow-600 mt-1">Reintentos Realizados</div>
                </div>
            </div>
        </div>
    );
}
