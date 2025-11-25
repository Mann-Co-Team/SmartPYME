const nodemailer = require('nodemailer');

// Configuración SMTP desde variables de entorno o valores por defecto
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@smartpyme.com';

// Crear transportador
let transporter = null;

function getTransporter() {
  if (!transporter && SMTP_CONFIG.auth.user && SMTP_CONFIG.auth.pass) {
    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporter;
}

const EmailService = {
  // Verificar configuración SMTP
  async testConnection() {
    try {
      const transport = getTransporter();
      if (!transport) {
        return { success: false, message: 'Configuración SMTP no disponible' };
      }

      await transport.verify();
      return { success: true, message: 'Conexión SMTP exitosa' };
    } catch (error) {
      console.error('Error al verificar conexión SMTP:', error);
      return { success: false, message: error.message };
    }
  },

  // Enviar email genérico
  async sendEmail(to, subject, text, html = null) {
    try {
      const transport = getTransporter();
      if (!transport) {
        console.warn('⚠️ Email no enviado: SMTP no configurado');
        return { success: false, message: 'SMTP no configurado' };
      }

      const mailOptions = {
        from: EMAIL_FROM,
        to,
        subject,
        text,
        html: html || text
      };

      const info = await transport.sendMail(mailOptions);
      console.log('✅ Email enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      return { success: false, message: error.message };
    }
  },

  // Email: Nuevo pedido (para admin/empleados)
  async sendNewOrderEmail(pedido, cliente) {
    try {
      const adminEmails = process.env.ADMIN_EMAILS || 'admin@smartpyme.com';
      
      const subject = `🛒 Nuevo Pedido #${pedido.id_pedido}`;
      
      const text = `
Nuevo Pedido Recibido

Número de Pedido: #${pedido.id_pedido}
Cliente: ${cliente.nombre} ${cliente.apellido || ''}
Email: ${cliente.email}
Teléfono: ${cliente.telefono || 'No especificado'}
Total: $${parseFloat(pedido.total).toLocaleString('es-CL')}
Método de Pago: ${pedido.metodo_pago}
Tipo de Entrega: ${pedido.tipo_entrega || 'No especificado'}
${pedido.direccion_entrega ? `Dirección: ${pedido.direccion_entrega}` : ''}

Fecha: ${new Date(pedido.fecha_pedido).toLocaleString('es-CL')}

Notas del cliente:
${pedido.notas || 'Sin notas'}

---
SmartPYME - Sistema de Gestión
      `.trim();

      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .info-row { margin: 10px 0; }
    .label { font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 Nuevo Pedido Recibido</h1>
    </div>
    <div class="content">
      <div class="info-row">
        <span class="label">Número de Pedido:</span> #${pedido.id_pedido}
      </div>
      <div class="info-row">
        <span class="label">Cliente:</span> ${cliente.nombre} ${cliente.apellido || ''}
      </div>
      <div class="info-row">
        <span class="label">Email:</span> ${cliente.email}
      </div>
      <div class="info-row">
        <span class="label">Teléfono:</span> ${cliente.telefono || 'No especificado'}
      </div>
      <div class="info-row">
        <span class="label">Total:</span> $${parseFloat(pedido.total).toLocaleString('es-CL')}
      </div>
      <div class="info-row">
        <span class="label">Método de Pago:</span> ${pedido.metodo_pago}
      </div>
      <div class="info-row">
        <span class="label">Tipo de Entrega:</span> ${pedido.tipo_entrega || 'No especificado'}
      </div>
      ${pedido.direccion_entrega ? `
      <div class="info-row">
        <span class="label">Dirección:</span> ${pedido.direccion_entrega}
      </div>
      ` : ''}
      <div class="info-row">
        <span class="label">Fecha:</span> ${new Date(pedido.fecha_pedido).toLocaleString('es-CL')}
      </div>
      ${pedido.notas ? `
      <div class="info-row">
        <span class="label">Notas:</span><br>
        ${pedido.notas}
      </div>
      ` : ''}
    </div>
    <div class="footer">
      SmartPYME - Sistema de Gestión
    </div>
  </div>
</body>
</html>
      `.trim();

      return await this.sendEmail(adminEmails, subject, text, html);
    } catch (error) {
      console.error('Error al enviar email de nuevo pedido:', error);
      return { success: false, message: error.message };
    }
  },

  // Email: Cambio de estado (para cliente)
  async sendOrderStatusEmail(pedido, cliente, nuevoEstado) {
    try {
      const subject = `📦 Actualización de Pedido #${pedido.id_pedido}`;
      
      const estadoMensajes = {
        'Pendiente': 'Tu pedido ha sido recibido y está siendo procesado.',
        'En Proceso': 'Tu pedido está siendo preparado por nuestro equipo.',
        'Listo para Retiro': 'Tu pedido está listo para ser retirado.',
        'En Camino': 'Tu pedido está en camino. ¡Pronto llegará!',
        'Completado': '¡Tu pedido ha sido completado con éxito! Gracias por tu compra.',
        'Cancelado': 'Tu pedido ha sido cancelado.'
      };

      const mensaje = estadoMensajes[nuevoEstado] || 'El estado de tu pedido ha cambiado.';

      const text = `
Hola ${cliente.nombre},

${mensaje}

Detalles del Pedido:
- Número de Pedido: #${pedido.id_pedido}
- Estado: ${nuevoEstado}
- Total: $${parseFloat(pedido.total).toLocaleString('es-CL')}
- Fecha: ${new Date(pedido.fecha_pedido).toLocaleString('es-CL')}

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos,
Equipo SmartPYME
      `.trim();

      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .status { background: #007bff; color: white; padding: 10px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
    .info-row { margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Actualización de Pedido</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${cliente.nombre}</strong>,</p>
      <p>${mensaje}</p>
      
      <div class="status">${nuevoEstado}</div>
      
      <div class="info-row">
        <strong>Número de Pedido:</strong> #${pedido.id_pedido}
      </div>
      <div class="info-row">
        <strong>Total:</strong> $${parseFloat(pedido.total).toLocaleString('es-CL')}
      </div>
      <div class="info-row">
        <strong>Fecha:</strong> ${new Date(pedido.fecha_pedido).toLocaleString('es-CL')}
      </div>
      
      <p style="margin-top: 20px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p>Saludos,<br><strong>Equipo SmartPYME</strong></p>
    </div>
    <div class="footer">
      SmartPYME - Sistema de Gestión
    </div>
  </div>
</body>
</html>
      `.trim();

      return await this.sendEmail(cliente.email, subject, text, html);
    } catch (error) {
      console.error('Error al enviar email de cambio de estado:', error);
      return { success: false, message: error.message };
    }
  },

  // Email: Stock crítico (para admin/empleados)
  async sendLowStockEmail(producto, stockActual) {
    try {
      const adminEmails = process.env.ADMIN_EMAILS || 'admin@smartpyme.com';
      
      const subject = `⚠️ Alerta de Stock Bajo: ${producto.nombre}`;
      
      const text = `
ALERTA: Stock Bajo

Producto: ${producto.nombre}
Stock Actual: ${stockActual} unidades
Estado: Stock Crítico

Es recomendable reabastecer este producto pronto para evitar quiebres de stock.

---
SmartPYME - Sistema de Gestión
      `.trim();

      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #fff3cd; }
    .alert { background: #dc3545; color: white; padding: 15px; text-align: center; font-size: 18px; margin: 15px 0; }
    .info-row { margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Alerta de Stock Bajo</h1>
    </div>
    <div class="content">
      <div class="alert">STOCK CRÍTICO</div>
      
      <div class="info-row">
        <strong>Producto:</strong> ${producto.nombre}
      </div>
      <div class="info-row">
        <strong>Stock Actual:</strong> ${stockActual} unidades
      </div>
      
      <p style="margin-top: 20px;">
        Es recomendable reabastecer este producto pronto para evitar quiebres de stock.
      </p>
    </div>
    <div class="footer">
      SmartPYME - Sistema de Gestión
    </div>
  </div>
</body>
</html>
      `.trim();

      return await this.sendEmail(adminEmails, subject, text, html);
    } catch (error) {
      console.error('Error al enviar email de stock bajo:', error);
      return { success: false, message: error.message };
    }
  }
};

module.exports = EmailService;
