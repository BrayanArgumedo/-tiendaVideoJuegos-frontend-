import { Component, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { Order } from '../../../../shared/models/order.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderDetailModalComponent } from '../order-detail-modal/order-detail-modal.component';

type ComponentState = {
  orders: Order[];
  loading: boolean;
  error: string | null;
};

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, OrderDetailModalComponent],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent {
  private adminService = inject(AdminService);
  private destroyRef = inject(DestroyRef);

  public state = signal<ComponentState>({
    orders: [],
    loading: true,
    error: null,
  });

  public selectedOrderId = signal<string | null>(null);

  constructor() {
    this.loadOrders();
  }

  loadOrders(): void {
  console.log('🔄 OrderListComponent: Cargando pedidos...');
  this.state.set({ orders: [], loading: true, error: null });
  
  this.adminService.getOrders()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response) => {
        console.log('✅ OrderListComponent: Pedidos recibidos:', response);
        console.log('📊 Total de pedidos:', response.records?.length || 0);
        this.state.update(s => ({ ...s, orders: response.records, loading: false }));
      },
      error: (err) => {
        console.error('❌ OrderListComponent: Error al cargar pedidos:', err);
        this.state.update(s => ({ ...s, error: 'No se pudieron cargar los pedidos.', loading: false }));
      }
    });
}

  onViewDetails(orderId: string): void {
    this.selectedOrderId.set(orderId);
  }
  onCloseModal(): void {
    this.selectedOrderId.set(null);
  }
  onStatusUpdated(): void {
    this.onCloseModal();
    this.loadOrders(); // Recargamos la lista para ver el nuevo estado
  }


}
