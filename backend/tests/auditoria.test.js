const AuditoriaModel = require('../models/auditoria.model');
const db = require('../config/db');

describe('AuditoriaModel', () => {
    let testTenantId;
    let testUsuarioId;

    beforeAll(async () => {
        // Obtener tenant y usuario de prueba
        const [tenants] = await db.execute('SELECT id_tenant FROM tenants LIMIT 1');
        testTenantId = tenants[0]?.id_tenant;

        const [usuarios] = await db.execute(
            'SELECT id_usuario FROM usuarios WHERE id_tenant = ? LIMIT 1',
            [testTenantId]
        );
        testUsuarioId = usuarios[0]?.id_usuario;
    });

    describe('create', () => {
        it('debería crear un registro de auditoría exitoso', async () => {
            const auditData = {
                id_tenant: testTenantId,
                id_usuario: testUsuarioId,
                accion: 'test_accion',
                modulo: 'test',
                descripcion: 'Test de auditoría',
                ip_address: '127.0.0.1',
                user_agent: 'Jest Test',
                resultado: 'exito'
            };

            const result = await AuditoriaModel.create(auditData);

            expect(result).toBeDefined();
            expect(result.id_auditoria).toBeDefined();
            expect(result.accion).toBe('test_accion');
        });

        it('debería crear un registro de auditoría con fallo', async () => {
            const auditData = {
                id_tenant: testTenantId,
                id_usuario: testUsuarioId,
                accion: 'test_fallo',
                modulo: 'test',
                descripcion: 'Test de fallo',
                resultado: 'fallo',
                mensaje_error: 'Error de prueba'
            };

            const result = await AuditoriaModel.create(auditData);

            expect(result).toBeDefined();
            expect(result.resultado).toBe('fallo');
            expect(result.mensaje_error).toBe('Error de prueba');
        });

        it('debería guardar datos JSON correctamente', async () => {
            const auditData = {
                id_tenant: testTenantId,
                id_usuario: testUsuarioId,
                accion: 'test_json',
                modulo: 'test',
                descripcion: 'Test con JSON',
                datos_anteriores: { campo: 'valor_anterior' },
                datos_nuevos: { campo: 'valor_nuevo' },
                resultado: 'exito'
            };

            const result = await AuditoriaModel.create(auditData);

            expect(result).toBeDefined();
            expect(result.datos_anteriores).toEqual({ campo: 'valor_anterior' });
            expect(result.datos_nuevos).toEqual({ campo: 'valor_nuevo' });
        });
    });

    describe('getAll', () => {
        beforeAll(async () => {
            // Crear algunos registros de prueba
            await AuditoriaModel.create({
                id_tenant: testTenantId,
                id_usuario: testUsuarioId,
                accion: 'producto_crear',
                modulo: 'productos',
                descripcion: 'Producto de prueba creado',
                resultado: 'exito'
            });

            await AuditoriaModel.create({
                id_tenant: testTenantId,
                id_usuario: testUsuarioId,
                accion: 'pedido_crear',
                modulo: 'pedidos',
                descripcion: 'Pedido de prueba creado',
                resultado: 'exito'
            });
        });

        it('debería obtener todos los registros del tenant', async () => {
            const registros = await AuditoriaModel.getAll(testTenantId);

            expect(Array.isArray(registros)).toBe(true);
            expect(registros.length).toBeGreaterThan(0);
            expect(registros[0]).toHaveProperty('id_auditoria');
            expect(registros[0]).toHaveProperty('accion');
            expect(registros[0]).toHaveProperty('modulo');
        });

        it('debería filtrar por módulo', async () => {
            const registros = await AuditoriaModel.getAll(testTenantId, {
                modulo: 'productos'
            });

            expect(Array.isArray(registros)).toBe(true);
            registros.forEach(r => {
                expect(r.modulo).toBe('productos');
            });
        });

        it('debería filtrar por resultado', async () => {
            const registros = await AuditoriaModel.getAll(testTenantId, {
                resultado: 'exito'
            });

            expect(Array.isArray(registros)).toBe(true);
            registros.forEach(r => {
                expect(r.resultado).toBe('exito');
            });
        });

        it('debería respetar el límite de registros', async () => {
            const registros = await AuditoriaModel.getAll(testTenantId, {
                limit: 5
            });

            expect(registros.length).toBeLessThanOrEqual(5);
        });

        it('debería buscar en descripción', async () => {
            const registros = await AuditoriaModel.getAll(testTenantId, {
                search: 'prueba'
            });

            expect(Array.isArray(registros)).toBe(true);
            if (registros.length > 0) {
                expect(
                    registros.some(r =>
                        r.descripcion && r.descripcion.toLowerCase().includes('prueba')
                    )
                ).toBe(true);
            }
        });
    });

    describe('count', () => {
        it('debería contar registros correctamente', async () => {
            const total = await AuditoriaModel.count(testTenantId);

            expect(typeof total).toBe('number');
            expect(total).toBeGreaterThan(0);
        });

        it('debería contar con filtros', async () => {
            const total = await AuditoriaModel.count(testTenantId, {
                modulo: 'productos'
            });

            expect(typeof total).toBe('number');
        });
    });

    describe('getByUsuario', () => {
        it('debería obtener registros de un usuario específico', async () => {
            const registros = await AuditoriaModel.getByUsuario(
                testTenantId,
                testUsuarioId,
                10
            );

            expect(Array.isArray(registros)).toBe(true);
            registros.forEach(r => {
                expect(r.id_usuario).toBe(testUsuarioId);
            });
        });
    });

    describe('getByModulo', () => {
        it('debería obtener registros de un módulo específico', async () => {
            const registros = await AuditoriaModel.getByModulo(
                testTenantId,
                'productos',
                10
            );

            expect(Array.isArray(registros)).toBe(true);
            registros.forEach(r => {
                expect(r.modulo).toBe('productos');
            });
        });
    });

    describe('getEstadisticas', () => {
        it('debería obtener estadísticas completas', async () => {
            const stats = await AuditoriaModel.getEstadisticas(testTenantId);

            expect(stats).toBeDefined();
            expect(stats.resumen).toBeDefined();
            expect(stats.por_modulo).toBeDefined();
            expect(stats.por_accion).toBeDefined();
            expect(stats.usuarios_mas_activos).toBeDefined();

            expect(typeof stats.resumen.total_registros).toBe('number');
            expect(typeof stats.resumen.total_exitos).toBe('number');
            expect(typeof stats.resumen.total_fallos).toBe('number');
        });

        it('las estadísticas deberían ser consistentes', async () => {
            const stats = await AuditoriaModel.getEstadisticas(testTenantId);

            const totalCalculado = stats.resumen.total_exitos + stats.resumen.total_fallos;
            expect(totalCalculado).toBeLessThanOrEqual(stats.resumen.total_registros);
        });
    });

    afterAll(async () => {
        // Limpiar registros de prueba
        await db.execute(
            'DELETE FROM auditoria WHERE modulo = ? AND id_tenant = ?',
            ['test', testTenantId]
        );
    });
});
