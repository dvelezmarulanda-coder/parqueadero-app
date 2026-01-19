# 🅿️ Sistema de Gestión de Parqueadero

Aplicación web profesional y minimalista para la gestión de parqueaderos, desarrollada con HTML, CSS, JavaScript y Supabase.

## 🎨 Características

- **Dashboard en Tiempo Real**: Visualiza vehículos actuales, espacios libres y recaudo diario
- **Alertas Inteligentes**: Sistema de colores (naranja/rojo) para tickets próximos a vencer o vencidos
- **Registro Rápido**: Formulario intuitivo con selector visual de tipo de vehículo
- **Módulo de Salida**: Marca pagos y libera puestos con un clic
- **Reportes Completos**: Filtros por fecha y exportación a PDF
- **Diseño Responsive**: Optimizado para móviles y PC
- **UX Simplificada**: Interfaz clara para usuarios con bajo nivel tecnológico

## 🎨 Paleta de Colores

- **Gris Oscuro**: `#2d3436`
- **Negro**: `#000000`
- **Azul Oscuro**: `#0984e3`
- **Naranja (Alerta)**: `#e67e22`
- **Rojo (Vencido)**: `#e74c3c`

## 📋 Requisitos Previos

1. **Cuenta de Supabase**: Crea una cuenta gratuita en [supabase.com](https://supabase.com)
2. **Navegador Web Moderno**: Chrome, Firefox, Safari o Edge

## 🚀 Instalación y Configuración

### Paso 1: Configurar Supabase

1. Crea un nuevo proyecto en Supabase
2. Ve a **SQL Editor** en el panel de Supabase
3. Copia y pega el contenido completo del archivo `database_schema.sql`
4. Ejecuta el script (botón "Run")
5. Verifica que la tabla `tickets` se haya creado correctamente

### Paso 2: Obtener Credenciales de Supabase

1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon public** key (la clave pública anónima)

### Paso 3: Configurar la Aplicación

1. Abre el archivo `config.js` en un editor de texto
2. Reemplaza los valores de configuración:

```javascript
supabase: {
    url: 'TU_URL_DE_SUPABASE',  // Pega tu Project URL aquí
    anonKey: 'TU_CLAVE_ANONIMA' // Pega tu anon public key aquí
}
```

3. (Opcional) Ajusta la capacidad total del parqueadero:

```javascript
parking: {
    totalSpaces: 50,  // Cambia este número según tu capacidad
    carSpaces: 35,
    motoSpaces: 15
}
```

### Paso 4: Ejecutar la Aplicación

1. Abre el archivo `index.html` en tu navegador web
2. La aplicación debería cargar correctamente
3. Si ves un mensaje de error de configuración, verifica que hayas completado el Paso 3 correctamente

## 📁 Estructura de Archivos

```
APP PARQUEADERO/
├── index.html              # Estructura HTML principal
├── styles.css              # Estilos y diseño
├── app.js                  # Lógica de la aplicación
├── config.js               # Configuración (credenciales de Supabase)
├── database_schema.sql     # Schema de base de datos para Supabase
└── README.md              # Este archivo
```

## 🎯 Uso de la Aplicación

### Dashboard

- **Vehículos Actuales**: Muestra el número de vehículos en el parqueadero
- **Espacios Libres**: Calcula automáticamente los espacios disponibles
- **Recaudo Diario**: Suma de todos los pagos del día actual
- **Tickets Activos**: Lista de vehículos con alertas de color:
  - 🟢 **Verde**: Tiempo normal
  - 🟠 **Naranja**: Salida estimada en menos de 1 hora
  - 🔴 **Rojo**: Tiempo de salida vencido

### Registro de Vehículo

1. Haz clic en **"➕ Nuevo Registro"**
2. Completa el formulario:
   - Placa del vehículo
   - Nombre del cliente
   - Número de celular
   - Tipo de vehículo (selecciona con un clic)
   - Puesto de parqueo
   - Fecha/hora de ingreso (auto-completada, editable)
   - Fecha/hora de salida estimada
   - Total a pagar
3. Haz clic en **"✅ Registrar Vehículo"**

### Marcar como Pagado

1. En el Dashboard, localiza el ticket del vehículo
2. Haz clic en **"✅ Marcar como Pagado"**
3. Confirma la acción
4. El ticket se marcará como pagado y se liberará el espacio

### Reportes

1. Haz clic en **"📈 Reportes"**
2. Selecciona el rango de fechas
3. Filtra por estado de pago (Todos/Pagado/Pendiente)
4. Haz clic en **"🔍 Aplicar Filtros"**
5. Para exportar, haz clic en **"📄 Exportar a PDF"**

## 🔧 Configuración Avanzada

### Ajustar Tiempo de Alerta

En `config.js`, modifica:

```javascript
alerts: {
    warningMinutes: 60  // Cambia a los minutos que prefieras
}
```

### Cambiar Intervalo de Actualización

En `config.js`, modifica:

```javascript
refresh: {
    dashboardInterval: 30000  // Tiempo en milisegundos (30000 = 30 segundos)
}
```

## 🗄️ Estructura de la Base de Datos

### Tabla: `tickets`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único (auto-generado) |
| `placa` | TEXT | Placa del vehículo |
| `nombre_cliente` | TEXT | Nombre del cliente |
| `celular` | TEXT | Número de celular |
| `tipo_vehiculo` | ENUM | 'carro' o 'moto' |
| `puesto` | TEXT | Número del puesto de parqueo |
| `fecha_ingreso` | TIMESTAMP | Fecha/hora de ingreso (auto) |
| `fecha_salida_estimada` | TIMESTAMP | Fecha/hora estimada de salida |
| `estado_pago` | BOOLEAN | true = pagado, false = pendiente |
| `total` | NUMERIC | Monto total a pagar |

## 🛡️ Seguridad

- La aplicación utiliza Row Level Security (RLS) de Supabase
- Las políticas actuales permiten acceso público para facilitar el uso
- Para producción, considera implementar autenticación de usuarios

## 📱 Compatibilidad

- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Dispositivos móviles (iOS/Android)

## 🐛 Solución de Problemas

### Error: "Configuración Requerida"

**Solución**: Verifica que hayas configurado correctamente `config.js` con tus credenciales de Supabase.

### No se cargan los datos

**Solución**: 
1. Verifica que hayas ejecutado `database_schema.sql` en Supabase
2. Revisa la consola del navegador (F12) para ver errores
3. Confirma que las credenciales en `config.js` sean correctas

### Los tickets no se actualizan

**Solución**: 
1. Recarga la página (F5)
2. Verifica tu conexión a internet
3. Revisa que Supabase esté funcionando correctamente

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador (F12 → Console)
2. Verifica que Supabase esté activo
3. Confirma que todas las credenciales sean correctas

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y comercial.

---

**Desarrollado con ❤️ para facilitar la gestión de parqueaderos**
