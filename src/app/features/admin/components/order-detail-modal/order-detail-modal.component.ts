// src/app/features/admin/components/order-detail-modal/order-detail-modal.component.ts
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AdminService } from "../../../../core/services/admin.service";
import { OrderDetail } from "../../../../shared/models/order.model";

@Component({
  selector: "app-order-detail-modal",
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: "./order-detail-modal.component.html",
  styleUrl: "./order-detail-modal.component.scss",
})
export class OrderDetailModalComponent implements OnInit {
  @Input({ required: true }) orderId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() statusUpdated = new EventEmitter<void>();

  private adminService = inject(AdminService);

  public orderDetails = signal<OrderDetail | null>(null);
  public isLoading = signal<boolean>(true);
  public selectedStatus: string = "";

  ngOnInit(): void {
    console.log(
      "🔍 OrderDetailModal: Cargando detalles del pedido",
      this.orderId,
    );

    this.adminService.getOrderDetails(this.orderId).subscribe({
      next: (response) => {
        console.log("✅ OrderDetailModal: Detalles recibidos:", response);

        this.orderDetails.set(response.pedido);
        this.selectedStatus = response.pedido.estado;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("❌ OrderDetailModal: Error al cargar detalles:", err);
        this.isLoading.set(false);
      },
    });
  }

  onUpdateStatus(): void {
    const order = this.orderDetails();
    if (!order) return;

    console.log("🔄 Actualizando estado a:", this.selectedStatus);

    this.adminService
      .updateOrderStatus(order.id, this.selectedStatus)
      .subscribe({
        next: (response) => {
          console.log("✅ Estado actualizado:", response);
          this.statusUpdated.emit();
        },
        error: (err) => {
          console.error("❌ Error al actualizar estado:", err);
          alert("Error al actualizar el estado del pedido");
        },
      });
  }

  onClose(): void {
    this.close.emit();
  }

  /**
   * Descargar factura del pedido en PDF
   */
  downloadInvoice(): void {
    const order = this.orderDetails();
    if (!order) return;

    console.log("📄 Descargando factura del pedido:", order.id);

    this.adminService.downloadInvoicePDF(order.id).subscribe({
      next: (blob: Blob) => {
        // Crear URL temporal del blob
        const url = window.URL.createObjectURL(blob);

        // Crear elemento <a> invisible
        const link = document.createElement("a");
        link.href = url;
        link.download = `factura-${order.id.substring(0, 8)}.pdf`;

        // Simular click para descargar
        document.body.appendChild(link);
        link.click();

        // Limpiar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log("✅ Factura descargada exitosamente");
      },
      error: (err) => {
        console.error("❌ Error al descargar factura:", err);
        alert("Error al descargar la factura");
      },
    });
  }
}

