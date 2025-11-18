// src/app/features/admin/components/reports/reports.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';

type ReportState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  private adminService = inject(AdminService);

  // Estados de descarga por tipo de reporte
  salesReportState = signal<ReportState>('idle');
  inventoryReportState = signal<ReportState>('idle');

  // Fechas para el reporte de ventas
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');

  /**
   * Descarga el reporte de ventas
   */
  downloadSalesReport(): void {
    console.log('🔄 Descargando reporte de ventas...');
    this.salesReportState.set('loading');

    this.adminService.downloadSalesReportPDF(
      this.fechaInicio() || undefined,
      this.fechaFin() || undefined
    ).subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, 'reporte-ventas.pdf');
        this.salesReportState.set('success');
        console.log('✅ Reporte de ventas descargado');
      },
      error: (error) => {
        console.error('❌ Error al descargar reporte de ventas:', error);
        this.salesReportState.set('error');
        alert('Error al descargar el reporte de ventas');
      }
    });
  }

  /**
   * Descarga el reporte de inventario
   */
  downloadInventoryReport(): void {
    console.log('🔄 Descargando reporte de inventario...');
    this.inventoryReportState.set('loading');

    this.adminService.downloadInventoryReportPDF().subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, 'reporte-inventario.pdf');
        this.inventoryReportState.set('success');
        console.log('✅ Reporte de inventario descargado');
      },
      error: (error) => {
        console.error('❌ Error al descargar reporte de inventario:', error);
        this.inventoryReportState.set('error');
        alert('Error al descargar el reporte de inventario');
      }
    });
  }

  /**
   * Método auxiliar para descargar archivos Blob
   */
  private downloadFile(blob: Blob, filename: string): void {
    // Crear URL temporal del blob
    const url = window.URL.createObjectURL(blob);
    
    // Crear elemento <a> invisible
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Simular click para descargar
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Resetear estado después de 3 segundos
   */
  private resetStateAfterDelay(stateSignal: any): void {
    setTimeout(() => {
      stateSignal.set('idle');
    }, 3000);
  }
}