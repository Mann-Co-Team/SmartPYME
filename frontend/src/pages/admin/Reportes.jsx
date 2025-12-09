import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPriceWithConversion } from '../../utils/currencyConverter';
import api from '../../services/api';

const Reportes = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [exportando, setExportando] = useState(false);
    const [reporte, setReporte] = useState(null);
    const [error, setError] = useState('');
    const [userCurrency, setUserCurrency] = useState(localStorage.getItem('currency') || 'CLP');

    // Filtros
    const [filtros, setFiltros] = useState({
        tipoPeriodo: 'mes', // dia, semana, mes, anio, personalizado
        fechaInicio: '',
        fechaFin: '',
        agruparPor: 'dia'
    });

    // Calcular fechas por defecto según parámetro de URL o mes actual
    useEffect(() => {
        const hoy = new Date();
        const periodoParam = searchParams.get('periodo'); // dia, mes, anio
        let primerDia, ultimoDia, tipoPeriodo;

        switch (periodoParam) {
            case 'dia':
                primerDia = ultimoDia = hoy;
                tipoPeriodo = 'dia';
                break;
            case 'mes':
                primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                tipoPeriodo = 'mes';
                break;
            case 'anio':
                primerDia = new Date(hoy.getFullYear(), 0, 1);
                ultimoDia = new Date(hoy.getFullYear(), 11, 31);
                tipoPeriodo = 'anio';
                break;
            default:
                // Por defecto: mes actual
                primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                tipoPeriodo = 'mes';
        }

        setFiltros(prev => ({
            ...prev,
            tipoPeriodo,
            fechaInicio: primerDia.toISOString().split('T')[0],
            fechaFin: ultimoDia.toISOString().split('T')[0]
        }));

        // Escuchar cambios de moneda
        const handleCurrencyChange = () => {
            const newCurrency = localStorage.getItem('currency') || 'CLP';
            setUserCurrency(newCurrency);
        };

        window.addEventListener('currencyChanged', handleCurrencyChange);
        return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
    }, [searchParams]);

    // Actualizar fechas según tipo de período
    const handleTipoPeriodoChange = (tipo) => {
        const hoy = new Date();
        let inicio, fin;

        switch (tipo) {
            case 'dia':
                inicio = fin = hoy.toISOString().split('T')[0];
                break;
            case 'semana':
                const primerDiaSemana = new Date(hoy);
                primerDiaSemana.setDate(hoy.getDate() - hoy.getDay());
                inicio = primerDiaSemana.toISOString().split('T')[0];
                fin = hoy.toISOString().split('T')[0];
                break;
            case 'mes':
                inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
                fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
                break;
            case 'anio':
                inicio = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0];
                fin = new Date(hoy.getFullYear(), 11, 31).toISOString().split('T')[0];
                break;
            case 'personalizado':
                // Mantener fechas actuales
                return setFiltros(prev => ({ ...prev, tipoPeriodo: tipo }));
        }

        setFiltros(prev => ({
            ...prev,
            tipoPeriodo: tipo,
            fechaInicio: inicio,
            fechaFin: fin
        }));
    };

    // Obtener reporte
    const obtenerReporte = async () => {
        if (!filtros.fechaInicio || !filtros.fechaFin) {
            setError('Debe seleccionar fechas de inicio y fin');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await api.get('/reportes', {
                params: {
                    fechaInicio: filtros.fechaInicio,
                    fechaFin: filtros.fechaFin,
                    agruparPor: filtros.agruparPor
                }
            });

            if (response.data.success) {
                setReporte(response.data.data);
            }
        } catch (err) {
            console.error('Error obteniendo reporte:', err);
            setError(err.response?.data?.message || 'Error al obtener el reporte');
        } finally {
            setLoading(false);
        }
    };

    // Exportar reporte
    const exportarReporte = async (formato) => {
        if (!filtros.fechaInicio || !filtros.fechaFin) {
            setError('Debe seleccionar fechas de inicio y fin');
            return;
        }

        try {
            setExportando(true);
            setError('');

            const response = await api.get(`/reportes/exportar/${formato}`, {
                params: {
                    fechaInicio: filtros.fechaInicio,
                    fechaFin: filtros.fechaFin
                },
                responseType: 'blob'
            });

            // Crear enlace de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_ventas_${filtros.fechaInicio}_${filtros.fechaFin}.${formato === 'excel' ? 'xlsx' : formato}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(`Error exportando ${formato}:`, err);
            setError(err.response?.data?.message || `Error al exportar ${formato.toUpperCase()}`);
        } finally {
            setExportando(false);
        }
    };

    // Formatear moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(value || 0);
    };

    useEffect(() => {
        if (filtros.fechaInicio && filtros.fechaFin) {
            obtenerReporte();
        }
    }, []);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.reports.title')}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Análisis y exportación de datos de ventas
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Filtros</h2>

                {/* Tipo de Período */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    {['dia', 'semana', 'mes', 'anio', 'personalizado'].map((tipo) => (
                        <button
                            key={tipo}
                            onClick={() => handleTipoPeriodoChange(tipo)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtros.tipoPeriodo === tipo
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {tipo === 'anio' ? 'Año' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            value={filtros.fechaInicio}
                            onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            value={filtros.fechaFin}
                            onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Agrupar Por
                        </label>
                        <select
                            value={filtros.agruparPor}
                            onChange={(e) => setFiltros({ ...filtros, agruparPor: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="dia">Día</option>
                            <option value="semana">Semana</option>
                            <option value="mes">Mes</option>
                        </select>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="mt-4 flex gap-3">
                    <button
                        onClick={obtenerReporte}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? 'Generando...' : 'Generar Reporte'}
                    </button>

                    <button
                        onClick={() => exportarReporte('csv')}
                        disabled={exportando || !reporte}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                        📄 Exportar CSV
                    </button>

                    <button
                        onClick={() => exportarReporte('excel')}
                        disabled={exportando || !reporte}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                        📊 Exportar Excel
                    </button>

                    <button
                        onClick={() => exportarReporte('pdf')}
                        disabled={exportando || !reporte}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                        📑 Exportar PDF
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded-lg">
                        {error}
                    </div>
                )}
            </div>

            {/* Resultados */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Generando reporte...</p>
                </div>
            ) : reporte ? (
                <>
                    {/* Métricas Generales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ventas</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {formatPriceWithConversion(reporte.metricas.total_ventas, userCurrency)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {reporte.metricas.total_pedidos || 0} pedidos
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Ticket Promedio</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {formatCurrency(reporte.metricas.ticket_promedio)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Por pedido
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Productos Vendidos</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {reporte.metricas.total_productos_vendidos || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {reporte.metricas.clientes_unicos || 0} clientes únicos
                            </p>
                        </div>
                    </div>

                    {/* Top Productos */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Top 10 Productos Más Vendidos
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Producto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Cantidad
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Ingresos
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {reporte.productos_mas_vendidos.map((prod, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {prod.nombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {prod.categoria}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                                                {prod.cantidad_vendida}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                                                {formatCurrency(prod.ingresos_totales)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Ventas por Categoría */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Ventas por Categoría
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Pedidos
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Productos
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Total Ventas
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            % Ventas
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {reporte.ventas_por_categoria.map((cat, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {cat.categoria}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                                                {cat.pedidos}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                                                {cat.productos_vendidos}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                                                {formatCurrency(cat.total_ventas)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                                                {cat.porcentaje_ventas}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Métodos de Pago */}
                    {reporte.metodos_pago && reporte.metodos_pago.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                                Métodos de Pago
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {reporte.metodos_pago.map((mp, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase">
                                            {mp.metodo_pago}
                                        </h3>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                            {formatCurrency(mp.total_ventas)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {mp.cantidad_pedidos} pedidos ({mp.porcentaje_uso}%)
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p className="text-gray-500 dark:text-gray-400">
                        Selecciona un período y haz clic en &quot;Generar Reporte&quot; para ver los datos
                    </p>
                </div>
            )}
        </div>
    );
};

export default Reportes;
