// src/app/shared/models/order.model.ts

// ====================================
// INTERFACES PARA LISTAR PEDIDOS
// ====================================

export interface OrdersApiResponse {
  success: boolean;
  records: Order[];
  total?: number;
}

export interface Order {
  id: string;
  usuario_id: string;
  subtotal: number;
  costo_envio: number;
  total: number;
  estado: 'procesando' | 'enviado' | 'completado' | 'cancelado';
  metodo_envio: 'standard' | 'express' | 'pickup';
  direccion_envio: string;
  fecha_pedido: string;
  usuario?: {
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
  };
}

// ====================================
// INTERFACES PARA DETALLE DE PEDIDO
// ====================================

export interface OrderDetailApiResponse {
  success: boolean;
  pedido: OrderDetail;  // ⬅️ El backend lo llama "pedido"
}

export interface OrderDetail {
  id: string;
  usuario_id: string;
  subtotal: number;
  costo_envio: number;
  total: number;
  estado: 'procesando' | 'enviado' | 'completado' | 'cancelado';
  metodo_envio: 'standard' | 'express' | 'pickup';
  direccion_envio: string;
  fecha_pedido: string;
  usuario: {
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
  };
  detalles: OrderItem[];  // ⬅️ El backend lo llama "detalles"
}

export interface OrderItem {
  id: number;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  producto: {
    nombre: string;
    consola: string;
    categoria: string;
    imagen_url: string | null;
  };
}