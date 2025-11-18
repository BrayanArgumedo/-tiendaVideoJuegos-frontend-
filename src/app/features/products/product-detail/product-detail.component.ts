//src/app/features/products/product-detail/product-detail.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../shared/models/product.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface Review {
  author: string;
  avatarUrl: string;
  rating: number;
  date: string;
  comment: string;
}

type ComponentState = {
  product: Product | null;
  loading: boolean;
  error: string | null;
  reviews: Review[];
  averageRating: number;
};

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  state = signal<ComponentState>({
    product: null,
    loading: true,
    error: null,
    reviews: [],
    averageRating: 0
  });

  constructor() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.state.set({ ...this.state(), loading: false, error: 'No se proporcionó un ID de producto.' });
          throw new Error('ID no encontrado');
        }
        return this.productService.getProductById(id);
      }),
      takeUntilDestroyed()
    ).subscribe({
      next: (product) => {
        if (product.imagen_url && !product.imagen_url.startsWith('http')) {
          const baseUrl = environment.API_BASE_URL.replace(/\/api\/?$/, '');
          product.imagen_url = `${baseUrl}${product.imagen_url}`;
        }
        this.generateMockReviews();
        this.state.update(s => ({ ...s, product, loading: false, error: null }));
      },
      error: (err) => {
        this.state.update(s => ({ ...s, product: null, loading: false, error: 'Producto no encontrado.' }));
        console.error(err);
      }
    });
  }

  // ⬅️ ÚNICO CAMBIO: VALIDAR LOGIN ANTES DE AGREGAR
  addToCart(): void {
    // Si NO está logueado, redirigir al login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Si SÍ está logueado, agregar al carrito normalmente
    const product = this.state().product;
    if (product) {
      this.cartService.addItem(product);
    }
  }

  private generateMockReviews(): void {
    const mockReviews: Review[] = [
      { author: 'GamerPro_88', avatarUrl: 'https://placehold.co/40x40/7c3aed/FFFFFF?text=G', rating: 5, date: 'Hace 2 días', comment: '¡Increíble! Un juego que redefine el género. Lo he disfrutado de principio a fin. 100% recomendado.' },
      { author: 'Elena_RM', avatarUrl: 'https://placehold.co/40x40/db2777/FFFFFF?text=E', rating: 4, date: 'Hace 1 semana', comment: 'Muy buen juego, aunque la historia podría ser un poco más profunda. Gráficamente es una maravilla.' },
      { author: 'PixelMaster', avatarUrl: 'https://placehold.co/40x40/16a34a/FFFFFF?text=P', rating: 5, date: 'Hace 3 semanas', comment: 'La jugabilidad es perfecta. Horas y horas de diversión garantizadas. No te lo puedes perder.' }
    ];
    const avgRating = mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length;

    this.state.update(s => ({ ...s, reviews: mockReviews, averageRating: parseFloat(avgRating.toFixed(1)) }));
  }
}