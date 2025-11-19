# Test Script para RF-3: Creacion de Pedidos
# SmartPYME - Sistema de Gestion

$baseUrl = "http://localhost:5000/api"
$testsPassed = 0
$testsFailed = 0

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   RF-3: CREACION DE PEDIDOS - TESTS" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Función para hacer requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Method = $Method
        Uri = "$baseUrl$Endpoint"
        Headers = $headers
    }
    
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @params -ErrorAction Stop
        return $response
    } catch {
        # Intentar parsear el error
        if ($_.ErrorDetails.Message) {
            try {
                return ($_.ErrorDetails.Message | ConvertFrom-Json)
            } catch {
                return @{ success = $false; message = $_.ErrorDetails.Message }
            }
        } else {
            return @{ success = $false; message = $_.Exception.Message }
        }
    }
}

# Test 1: Login de cliente para obtener token y id_cliente
Write-Host "Test 1: Login de cliente..." -NoNewline
try {
    $loginData = @{
        email = "juan.perez@ejemplo.com"
        password = "prueba123"
    }
    
    $loginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginData
    
    if ($loginResponse.success -and $loginResponse.data.token) {
        $token = $loginResponse.data.token
        $usuarioId = $loginResponse.data.user.id
        Write-Host " PASS" -ForegroundColor Green
        Write-Host "  - Token obtenido: $($token.Substring(0,20))..." -ForegroundColor Gray
        Write-Host "  - Usuario ID: $usuarioId" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host " FAIL - No se obtuvo token" -ForegroundColor Red
        $testsFailed++
        exit 1
    }
} catch {
    Write-Host " FAIL - Error: $_" -ForegroundColor Red
    $testsFailed++
    exit 1
}

Start-Sleep -Milliseconds 500

# Test 2: Obtener productos con stock disponible
Write-Host "Test 2: Obtener productos con stock..." -NoNewline
try {
    $productosResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/productos"
    
    if ($productosResponse.success -and $productosResponse.data.Count -gt 0) {
        $productosConStock = $productosResponse.data | Where-Object { $_.stock -gt 0 }
        
        if ($productosConStock.Count -gt 0) {
            $producto1 = $productosConStock[0]
            $producto2 = $productosConStock[1]
            Write-Host " PASS" -ForegroundColor Green
            Write-Host "  - Productos con stock: $($productosConStock.Count)" -ForegroundColor Gray
            $testsPassed++
        } else {
            Write-Host " FAIL - No hay productos con stock" -ForegroundColor Red
            $testsFailed++
        }
    } else {
        Write-Host " FAIL - No se obtuvieron productos" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host " FAIL - Error: $_" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# Test 3: Crear pedido exitoso con delivery
Write-Host "Test 3: Crear pedido con delivery..." -NoNewline
try {
    $pedidoData = @{
        id_usuario_cliente = $usuarioId
        items = @(
            @{
                id_producto = $producto1.id_producto
                cantidad = 1
                precio_unitario = $producto1.precio
                subtotal = $producto1.precio * 1
            }
        )
        total = $producto1.precio
        metodo_pago = "efectivo"
        notas = "Pedido de prueba RF-3"
        direccion_entrega = "Calle Falsa 123, Santiago, Chile"
        metodo_entrega = "delivery"
    }
    
    $pedidoResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/pedidos" -Body $pedidoData -Token $token
    
    if ($pedidoResponse.success -and $pedidoResponse.data.numero_pedido) {
        Write-Host " PASS" -ForegroundColor Green
        Write-Host "  - Numero de pedido: $($pedidoResponse.data.numero_pedido)" -ForegroundColor Gray
        Write-Host "  - ID pedido: $($pedidoResponse.data.id)" -ForegroundColor Gray
        $testsPassed++
        $pedidoId1 = $pedidoResponse.data.id
    } else {
        Write-Host " FAIL - No se creo el pedido" -ForegroundColor Red
        if ($pedidoResponse.message) {
            Write-Host "  - Error: $($pedidoResponse.message)" -ForegroundColor Red
        }
        $testsFailed++
    }
} catch {
    Write-Host " FAIL - Error: $_" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# Test 4: Crear pedido exitoso con pickup (retiro en tienda)
Write-Host "Test 4: Crear pedido con pickup..." -NoNewline
try {
    $pedidoData = @{
        id_usuario_cliente = $usuarioId
        items = @(
            @{
                id_producto = $producto2.id_producto
                cantidad = 1
                precio_unitario = $producto2.precio
                subtotal = $producto2.precio * 1
            }
        )
        total = $producto2.precio
        metodo_pago = "tarjeta"
        notas = "Pedido para retiro en tienda"
        direccion_entrega = $null
        metodo_entrega = "pickup"
    }
    
    $pedidoResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/pedidos" -Body $pedidoData -Token $token
    
    if ($pedidoResponse.success -and $pedidoResponse.data.numero_pedido) {
        Write-Host " PASS" -ForegroundColor Green
        Write-Host "  - Numero de pedido: $($pedidoResponse.data.numero_pedido)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host " FAIL - No se creo el pedido" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host " FAIL - Error: $_" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# Test 5: Intentar crear pedido con stock insuficiente
Write-Host "Test 5: Stock insuficiente..." -NoNewline
try {
    $pedidoData = @{
        id_usuario_cliente = $usuarioId
        items = @(
            @{
                id_producto = $producto1.id_producto
                cantidad = 99999
                precio_unitario = $producto1.precio
                subtotal = $producto1.precio * 99999
            }
        )
        total = $producto1.precio * 99999
        metodo_pago = "efectivo"
        notas = "Pedido con stock insuficiente"
        direccion_entrega = "Test"
        metodo_entrega = "delivery"
    }
    
    $response = Invoke-WebRequest -Uri "$baseUrl/pedidos" -Method POST -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } -Body ($pedidoData | ConvertTo-Json -Depth 10) -ErrorAction Stop
    
    Write-Host " FAIL - Deberia rechazar por stock insuficiente" -ForegroundColor Red
    $testsFailed++
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.message -like "*Stock insuficiente*") {
        Write-Host " PASS" -ForegroundColor Green
        Write-Host "  - Mensaje: $($errorResponse.message)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host " FAIL - Error inesperado: $($errorResponse.message)" -ForegroundColor Red
        $testsFailed++
    }
}

Start-Sleep -Milliseconds 500

# Test 6: Verificar que el stock se actualizo correctamente
Write-Host "Test 6: Verificar actualizacion de stock..." -NoNewline
try {
    $productoActual = Invoke-ApiRequest -Method "GET" -Endpoint "/productos"
    $productoVerificar = $productoActual.data | Where-Object { $_.id_producto -eq $producto1.id_producto }
    
    $stockAnterior = $producto1.stock
    $stockActual = $productoVerificar.stock
    
    if ($stockActual -eq ($stockAnterior - 1)) {
        Write-Host " PASS" -ForegroundColor Green
        Write-Host "  - Stock anterior: $stockAnterior, Stock actual: $stockActual" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host " FAIL - Stock no actualizado correctamente" -ForegroundColor Red
        Write-Host "  - Esperado: $($stockAnterior - 1), Actual: $stockActual" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host " FAIL - Error: $_" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# Test 7: Crear pedido con multiples productos
Write-Host "Test 7: Pedido con multiples productos..." -NoNewline
try {
    $pedidoData = @{
        id_usuario_cliente = $usuarioId
        items = @(
            @{
                id_producto = $producto1.id_producto
                cantidad = 1
                precio_unitario = $producto1.precio
                subtotal = $producto1.precio * 1
            },
            @{
                id_producto = $producto2.id_producto
                cantidad = 2
                precio_unitario = $producto2.precio
                subtotal = $producto2.precio * 2
            }
        )
        total = ($producto1.precio * 1) + ($producto2.precio * 2)
        metodo_pago = "transferencia"
        notas = "Pedido multiple"
        direccion_entrega = "Av. Principal 456"
        metodo_entrega = "delivery"
    }
    
    $pedidoResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/pedidos" -Body $pedidoData -Token $token
    
    if ($pedidoResponse.success -and $pedidoResponse.data.numero_pedido) {
        Write-Host " PASS" -ForegroundColor Green
        Write-Host "  - Numero de pedido: $($pedidoResponse.data.numero_pedido)" -ForegroundColor Gray
        Write-Host "  - Items: 2 productos" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host " FAIL - No se creo el pedido" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host " FAIL - Error: $_" -ForegroundColor Red
    $testsFailed++
}

# Resumen
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "           RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Pruebas exitosas: $testsPassed" -ForegroundColor Green
Write-Host "Pruebas fallidas: $testsFailed" -ForegroundColor Red
Write-Host "Total: $($testsPassed + $testsFailed)" -ForegroundColor Cyan

if ($testsFailed -eq 0) {
    Write-Host ""
    Write-Host "TODOS LOS TESTS PASARON (100%)" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Algunos tests fallaron" -ForegroundColor Red
}
