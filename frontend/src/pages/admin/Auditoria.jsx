import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuditoria, getEstadisticas, exportCSV } from '../../services/auditoria';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function Auditoria() {
    const { t } = useTranslation();
    const [registros, setRegistros] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        modulo: '',
        accion: '',
        resultado: '',
        fecha_inicio: '',
        fecha_fin: '',
        search: '',
        limit: 50,
        offset: 0
    });
    const [pagination, setPagination] = useState({ total: 0, pages: 0 });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        loadData();
    }, [filters.offset]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [auditoriaData, statsData] = await Promise.all([
                getAuditoria(filters),
                getEstadisticas()
            ]);

            setRegistros(auditoriaData.data || []);
            setPagination(auditoriaData.pagination || { total: 0, pages: 0 });
            setEstadisticas(statsData.data || null);
        } catch (error) {
            console.error('Error cargando auditoría:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, offset: 0 }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadData();
    };

    const handleExport = async () => {
        try {
            await exportCSV(filters);
        } catch (error) {
            console.error('Error exportando:', error);
        }
    };

    const handlePageChange = (newOffset) => {
        setFilters(prev => ({ ...prev, offset: newOffset }));
    };

    const getResultadoBadge = (resultado) => {
        return resultado === 'exito'
            ? <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Éxito</span>
            : <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Fallo</span>;
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('admin.audit.title')}</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Registro completo de acciones de usuarios autenticados (RF-12)
                </p>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Total Registros</p>
                        <p className="text-2xl font-bold">{estadisticas.resumen?.total_registros || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Éxitos</p>
                        <p className="text-2xl font-bold text-green-600">{estadisticas.resumen?.total_exitos || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Fallos</p>
                        <p className="text-2xl font-bold text-red-600">{estadisticas.resumen?.total_fallos || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Usuarios Activos</p>
                        <p className="text-2xl font-bold">{estadisticas.resumen?.usuarios_activos || 0}</p>
                    </div>
                </div>
            )}

            {/* Filtros y Búsqueda */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        <FunnelIcon className="h-5 w-5" />
                        {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        Exportar CSV
                    </button>
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                    {/* Búsqueda */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Buscar en descripción, acción, usuario..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filtros avanzados */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                name="modulo"
                                value={filters.modulo}
                                onChange={handleFilterChange}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos los módulos</option>
                                <option value="autenticacion">Autenticación</option>
                                <option value="productos">Productos</option>
                                <option value="categorias">Categorías</option>
                                <option value="pedidos">Pedidos</option>
                                <option value="usuarios">Usuarios</option>
                                <option value="configuracion">Configuración</option>
                            </select>

                            <select
                                name="resultado"
                                value={filters.resultado}
                                onChange={handleFilterChange}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos los resultados</option>
                                <option value="exito">Éxito</option>
                                <option value="fallo">Fallo</option>
                            </select>

                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={filters.fecha_inicio}
                                    onChange={handleFilterChange}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Fecha inicio"
                                />
                                <input
                                    type="date"
                                    name="fecha_fin"
                                    value={filters.fecha_fin}
                                    onChange={handleFilterChange}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Fecha fin"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Buscar
                    </button>
                </form>
            </div>

            {/* Tabla de Registros */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando registros...</p>
                    </div>
                ) : registros.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron registros
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha/Hora
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Módulo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acción
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Descripción
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Resultado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {registros.map((registro) => (
                                        <tr key={registro.id_auditoria} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(registro.created_at).toLocaleString('es-CL')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="text-gray-900">
                                                    {registro.usuario_nombre} {registro.usuario_apellido}
                                                </div>
                                                <div className="text-gray-500 text-xs">{registro.usuario_email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                                    {registro.modulo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {registro.accion_label || registro.accion}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {registro.descripcion || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {getResultadoBadge(registro.resultado)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => setSelectedRecord(registro)}
                                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                                >
                                                    Ver Detalles
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(Math.max(0, filters.offset - filters.limit))}
                                    disabled={filters.offset === 0}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => handlePageChange(filters.offset + filters.limit)}
                                    disabled={filters.offset + filters.limit >= pagination.total}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Mostrando <span className="font-medium">{filters.offset + 1}</span> a{' '}
                                        <span className="font-medium">
                                            {Math.min(filters.offset + filters.limit, pagination.total)}
                                        </span>{' '}
                                        de <span className="font-medium">{pagination.total}</span> resultados
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => handlePageChange(Math.max(0, filters.offset - filters.limit))}
                                            disabled={filters.offset === 0}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(filters.offset + filters.limit)}
                                            disabled={filters.offset + filters.limit >= pagination.total}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Siguiente
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal Ver Detalles */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Detalles de Auditoría</h2>
                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Información General */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Fecha y Hora</p>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {new Date(selectedRecord.created_at).toLocaleString('es-CL', {
                                                dateStyle: 'full',
                                                timeStyle: 'long'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Resultado</p>
                                        <p className="mt-1">{getResultadoBadge(selectedRecord.resultado)}</p>
                                    </div>
                                </div>

                                {/* Usuario */}
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Usuario</p>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedRecord.usuario_nombre} {selectedRecord.usuario_apellido}
                                    </p>
                                    <p className="text-sm text-gray-500">{selectedRecord.usuario_email}</p>
                                </div>

                                {/* Módulo y Acción */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Módulo</p>
                                        <p className="mt-1">
                                            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                                {selectedRecord.modulo}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Acción</p>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedRecord.accion_label || selectedRecord.accion}
                                        </p>
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Descripción</p>
                                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.descripcion || '-'}</p>
                                </div>

                                {/* Información Técnica */}
                                <div className="border-t pt-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Información Técnica</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">IP Address</p>
                                            <p className="mt-1 text-sm text-gray-900">{selectedRecord.ip_address || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Navegador</p>
                                            <p className="mt-1 text-sm text-gray-900 truncate" title={selectedRecord.user_agent}>
                                                {selectedRecord.user_agent || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Datos (si existen) */}
                                {(selectedRecord.datos_anteriores || selectedRecord.datos_nuevos) && (
                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Datos del Registro</h3>
                                        {selectedRecord.datos_anteriores && (
                                            <div className="mb-3">
                                                <p className="text-sm font-medium text-gray-500 mb-1">Datos Anteriores</p>
                                                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                                                    {JSON.stringify(JSON.parse(selectedRecord.datos_anteriores), null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {selectedRecord.datos_nuevos && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Datos Nuevos</p>
                                                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                                                    {JSON.stringify(
                                                        typeof selectedRecord.datos_nuevos === 'string'
                                                            ? JSON.parse(selectedRecord.datos_nuevos)
                                                            : selectedRecord.datos_nuevos,
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Mensaje de Error (si existe) */}
                                {selectedRecord.mensaje_error && (
                                    <div className="border-t pt-4">
                                        <p className="text-sm font-medium text-red-600">Mensaje de Error</p>
                                        <p className="mt-1 text-sm text-red-900 bg-red-50 p-3 rounded">
                                            {selectedRecord.mensaje_error}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
