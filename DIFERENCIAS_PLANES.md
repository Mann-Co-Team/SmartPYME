# 🎨 Guía de Diferencias Visuales entre Planes

Este documento detalla las diferencias visuales y funcionales entre los 3 planes de SmartPYME para facilitar la identificación y comparación.

---

## 📊 Comparativa Rápida

| Característica | Básico (Gratis) | Profesional ($29/mes) | Empresarial ($79/mes) |
|---------------|-----------------|----------------------|----------------------|
| **Color del Badge** | Gris | Azul con estrella ⭐ | Dorado con estrella 👑 |
| **Navbar** | Simple, blanco | Premium con carrito | Sticky premium con gradiente |
| **Hero/Carrusel** | Carrusel básico | Hero con overlay | Carrusel avanzado con controles |
| **Botones** | Negro básico | Azul con iconos 🛒 | Gradiente dorado ⭐ |
| **Productos visibles** | Máx 12 (límite) | Hasta 8 mostrados | 9+ con etiquetas premium |
| **Footer** | No incluido | Básico | Completo con newsletter |
| **Sidebar/Filtros** | ❌ No | ❌ No | ✅ Sí, con categorías expandibles |
| **Sección Blog** | ❌ No | ❌ No | ✅ Sí, banner destacado |
| **Etiquetas productos** | Sin etiquetas | Sin etiquetas | "PREMIUM" + "Envío Prioritario" |

---

## 🎯 Plan Básico (Gratis)

### Identificadores Visuales
- **Badge del plan**: Fondo gris `bg-gray-100`, texto gris `text-gray-700`, borde gris
  ```jsx
  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-300">
    Plan Básico
  </span>
  ```

### Características del Diseño
1. **Navbar**
   - Fondo blanco simple
   - Borde inferior gris
   - Buscador básico
   - Sin carrito visible

2. **Carrusel Hero**
   - Carrusel automático de 2 slides
   - Indicadores simples (puntos)
   - Botones de navegación blancos básicos

3. **Productos**
   - Grid 4 columnas
   - Botones negros simples
   - Mensaje de límite: "Mostrando hasta 50 productos (Límite Plan Básico)"
   - Solo muestra máximo 12 productos
   - Banner de upgrade si hay más productos:
     ```
     "Mostrando 12 de X productos"
     "El plan Básico tiene un límite de visualización"
     [Botón: ⬆️ Actualizar Plan]
     ```

4. **Categorías**
   - Grid simple 3 columnas
   - Sin descripciones extendidas
   - Click directo para filtrar

5. **Colores principales**
   - Negro: `#000000` (botones)
   - Gris: `#6B7280` (textos secundarios)
   - Blanco: `#FFFFFF` (fondos)

---

## ⭐ Plan Profesional ($29/mes)

### Identificadores Visuales
- **Badge del plan**: Gradiente azul `from-blue-500 to-blue-600`, texto blanco, con estrella
  ```jsx
  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-sm">
    ⭐ Plan Profesional
  </span>
  ```

### Características del Diseño
1. **Navbar**
   - Logo "SmartPYME LOGO" visible
   - Icono de carrito 🛒 visible
   - Shadow suave
   - Botones con bordes

2. **Banner de Características**
   - Barra azul superior con íconos:
     - 📊 Reportes Avanzados
     - 👥 Hasta 5 Empleados
     - 💾 5 GB Almacenamiento
     - 🎯 Soporte Prioritario

3. **Hero Section**
   - Imagen de fondo con gradiente oscuro overlay
   - Texto blanco sobre imagen
   - Botón "Contacto" prominente
   - Navegación del carrusel con flechas

4. **Sección de Promos**
   - 2 promos horizontales destacadas
   - Imágenes grandes a la izquierda
   - Botón azul: "🛒 Comprar Ahora"
   - Shadow mejorado en cards

5. **Productos**
   - Grid 4 columnas mejorado
   - Botones azules: `bg-blue-600` con sombra
   - Texto del botón: "🛒 Añadir al carrito"
   - Hover effects más pronunciados

6. **Información de límites**
   - "Hasta 500 productos • Pedidos ilimitados • 5 empleados"
   - Badge: "✨ Características Profesionales Activas"

7. **Footer**
   - Footer básico negro
   - Copyright simple

8. **Colores principales**
   - Azul: `#2563EB` (botones y acentos)
   - Blanco: `#FFFFFF`
   - Negro: `#1F2937` (textos)

---

## 👑 Plan Empresarial ($79/mes)

### Identificadores Visuales
- **Badge del plan**: Gradiente dorado `from-amber-400 via-yellow-500 to-amber-500`, texto blanco, estrella y sombra
  ```jsx
  <span className="px-3 py-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-md flex items-center space-x-1">
    <svg>⭐</svg>
    <span>Plan Empresarial</span>
  </span>
  ```

### Características del Diseño
1. **Navbar Sticky Premium**
   - Posición fija: `sticky top-0 z-50`
   - Logo "SmartPYME LOGO EMPRESA"
   - Badge dorado premium prominente
   - Sombra suave permanente

2. **Hero Carrusel Avanzado**
   - Altura mayor: 500px
   - Controles grandes con sombra
   - Gradiente overlay más sofisticado
   - Indicadores animados

3. **Banner de Características Empresariales**
   - Gradiente de fondo: `from-amber-50 to-yellow-50`
   - Borde dorado: `border-amber-300`
   - Icono de estrella grande (12x12)
   - Grid 2 columnas con checkmarks verdes
   - Características destacadas:
     - ✓ Productos ilimitados
     - ✓ Pedidos ilimitados
     - ✓ Empleados ilimitados
     - ✓ Soporte 24/7
     - ✓ 50 GB Almacenamiento
     - ✓ API Personalizada

4. **Sidebar con Filtros** (Exclusivo Empresarial)
   - Ancho: 256px (lg:w-64)
   - Sticky position: `sticky top-20`
   - Categorías expandibles (accordion)
   - Icono de chevron animado
   - Borde inferior en cada categoría

5. **Productos Premium**
   - Etiquetas dobles en cada producto:
     - Superior derecha: "⭐ PREMIUM" (gradiente dorado)
     - Superior izquierda: "🚀 Envío Prioritario" (negro opaco)
   - Botón gradiente dorado con efecto hover scale:
     ```jsx
     className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 transform hover:scale-105"
     ```
   - Texto del botón: "⭐ Añadir al carrito Premium"

6. **Información de capacidades**
   - Badges circulares:
     - "∞ Productos Ilimitados" (fondo amber-100)
     - "∞ Sin Restricciones" (fondo green-100)
   - Selector de ordenamiento ampliado con más opciones

7. **Footer Premium Completo**
   - Grid 4 columnas
   - Secciones:
     - Sobre Nosotros
     - Enlaces
     - Contacto
     - Newsletter con input
   - Borde superior decorativo
   - Copyright centrado

8. **Colores principales**
   - Dorado/Amber: `#F59E0B` (acentos principales)
   - Amarillo: `#EAB308` (degradados)
   - Negro: `#111827` (textos)
   - Blanco: `#FFFFFF`

---

## 🎨 Paleta de Colores por Plan

### Básico
```css
/* Principales */
--primary: #000000;        /* Negro */
--secondary: #6B7280;      /* Gris */
--background: #FFFFFF;     /* Blanco */
--border: #D1D5DB;         /* Gris claro */

/* Badge */
--badge-bg: #F3F4F6;       /* Gris 100 */
--badge-text: #374151;     /* Gris 700 */
```

### Profesional
```css
/* Principales */
--primary: #2563EB;        /* Azul 600 */
--secondary: #3B82F6;      /* Azul 500 */
--background: #FFFFFF;     /* Blanco */
--accent: #1E40AF;         /* Azul 800 */

/* Badge */
--badge-bg: linear-gradient(to right, #3B82F6, #2563EB);
--badge-text: #FFFFFF;

/* Banner características */
--feature-banner: #2563EB;
```

### Empresarial
```css
/* Principales */
--primary: #F59E0B;        /* Amber 500 */
--secondary: #EAB308;      /* Yellow 500 */
--background: #FFFFFF;     /* Blanco */
--accent: #D97706;         /* Amber 600 */

/* Badge */
--badge-bg: linear-gradient(to right, #FBBF24, #EAB308, #F59E0B);
--badge-text: #FFFFFF;

/* Banner características */
--feature-banner-bg: linear-gradient(to right, #FEF3C7, #FEF9C3);
--feature-border: #FCD34D;
```

---

## 🔍 Cómo Identificar Rápidamente el Plan

### A Primera Vista (1 segundo)
1. **Color del badge en navbar**:
   - Gris = Básico
   - Azul = Profesional
   - Dorado = Empresarial

2. **Presencia de sidebar izquierdo**:
   - No tiene = Básico o Profesional
   - Tiene = Empresarial

### En 3 segundos
3. **Color de botones principales**:
   - Negro simple = Básico
   - Azul con iconos = Profesional
   - Gradiente dorado = Empresarial

4. **Banner de características en header**:
   - No tiene = Básico
   - Azul horizontal = Profesional
   - Dorado con checkmarks = Empresarial

### Mirando productos
5. **Etiquetas en productos**:
   - Sin etiquetas = Básico o Profesional
   - "PREMIUM" dorado + "Envío Prioritario" = Empresarial

6. **Texto en botones de productos**:
   - "Agregar" = Básico
   - "🛒 Añadir al carrito" = Profesional
   - "⭐ Añadir al carrito Premium" = Empresarial

---

## 📱 URLs de Prueba

Puedes visitar estas URLs para ver cada plan en acción:

- **Plan Básico**: http://localhost:5173/tienda/techstore-basico
- **Plan Profesional**: http://localhost:5173/tienda/fashion-store-pro
- **Plan Empresarial**: http://localhost:5173/tienda/megamarket-empresarial

---

## 🛠️ Componentes por Plan

### Archivos
```
TiendaHomeBasico.jsx       → Plan Básico
TiendaHomeProfesional.jsx  → Plan Profesional
TiendaHomeEmpresarial.jsx  → Plan Empresarial
TiendaHome.jsx             → Router que decide qué renderizar
```

### Lógica de Enrutamiento
```javascript
// En TiendaHome.jsx
const planLower = tenant.plan?.toLowerCase();

if (planLower === 'basico') {
  return <TiendaHomeBasico {...props} />;
} else if (planLower === 'profesional') {
  return <TiendaHomeProfesional {...props} />;
} else if (planLower === 'empresarial') {
  return <TiendaHomeEmpresarial {...props} />;
}
```

---

## 🎯 Resumen de Diferencias Clave

| Elemento | Básico | Profesional | Empresarial |
|----------|--------|-------------|-------------|
| **Complejidad** | Mínima | Media | Alta |
| **Componentes** | 4-5 secciones | 6-7 secciones | 8+ secciones |
| **Interactividad** | Baja | Media | Alta |
| **Personalización** | Limitada | Mejorada | Completa |
| **Experiencia UX** | Funcional | Profesional | Premium |

---

## 💡 Mejoras Futuras Sugeridas

### Plan Básico
- [ ] Animaciones sutiles en hover
- [ ] Mejora de tipografía

### Plan Profesional
- [ ] Integración con analytics
- [ ] Sección de reviews de productos
- [ ] Wishlist visible

### Plan Empresarial
- [ ] Chat en vivo 24/7
- [ ] Comparador de productos
- [ ] Recomendaciones personalizadas con IA
- [ ] Preview 3D de productos
- [ ] Programa de fidelización visible

---

*Última actualización: Noviembre 24, 2025*
