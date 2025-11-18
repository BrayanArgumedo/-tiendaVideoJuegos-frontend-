import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HeroBackgroundComponent } from '../../../shared/components/hero-background/hero-background.component';

type ComponentState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  currentCategory: string | null;
  currentConsole: string | null; // Nuevo estado para el filtro de consola
  currentSearchTerm: string | null;
};

interface Brand {
  name: string;
  logoUrl: string;
  link: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, RouterLink, CurrencyPipe, HeroBackgroundComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  state = signal<ComponentState>({
    products: [], loading: true, error: null,
    currentCategory: null, currentConsole: null, currentSearchTerm: null,
  });

  // ⬅️ NUEVO: Estado del carrusel
  carouselIndex = signal<number>(0);

  // La señal computada ahora prioriza el filtro por consola
  public filteredProducts = computed(() => {
    const s = this.state();
    let products = s.products;

    if (s.currentConsole) {
      products = products.filter(p => p.consola?.toLowerCase().includes(s.currentConsole!.toLowerCase()));
    } else if (s.currentCategory) {
      products = products.filter(p => p.categoria.toLowerCase() === s.currentCategory!.toLowerCase());
    }

    if (s.currentSearchTerm) {
      products = products.filter(p => p.nombre.toLowerCase().includes(s.currentSearchTerm!.toLowerCase()));
    }

    return products;
  });

  public featuredProducts = computed(() => {
    const featured = this.state().products.slice(0, 5);
    return featured.map(product => {
      const productWithFullUrl = { ...product };
      if (product.imagen_url && !product.imagen_url.startsWith('http')) {
        const baseUrl = environment.API_BASE_URL.replace(/\/api\/?$/, '');
        productWithFullUrl.imagen_url = `${baseUrl}${product.imagen_url}`;
      }
      return productWithFullUrl;
    });
  });

  // ⬅️ NUEVO: Calcular total de páginas
  public totalPages = computed(() => {
    const total = this.featuredProducts().length;
    const pages = Math.ceil(total / 2);
    return Array.from({ length: pages }, (_, i) => i); // [0, 1] para 4 productos
  });

  // ⬅️ CORREGIDO: Productos visibles en el carrusel (de 2 en 2, por páginas)
  public visibleProducts = computed(() => {
    const products = this.featuredProducts();
    const pageIndex = this.carouselIndex() * 2;
    return products.slice(pageIndex, pageIndex + 2);
  });

  // ⬅️ CORREGIDO: Controles del carrusel
  public canGoPrev = computed(() => this.carouselIndex() > 0);
  public canGoNext = computed(() => this.carouselIndex() < this.totalPages().length - 1);

  // ¡ACTUALIZADO! Los enlaces ahora apuntan a la nueva ruta de consola
  public brands: Brand[] = [
    { name: 'Nintendo', logoUrl: 'https://cdn.worldvectorlogo.com/logos/nintendo-switch-1.svg', link: '/productos/consola/Nintendo' },
    { name: 'PlayStation', logoUrl: 'https://cdn.worldvectorlogo.com/logos/playstation-logo-colour.svg', link: '/productos/consola/Playstation' },
    { name: 'Xbox', logoUrl: 'https://cdn.worldvectorlogo.com/logos/xbox-9.svg', link: '/productos/consola/Xbox' },
    { name: 'PC', logoUrl: 'https://cdn.brandfetch.io/idpMrsbxQj/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B', link: '/productos/consola/PC' }
  ];

  constructor() {
    // Escuchamos todos los parámetros relevantes de la URL
    combineLatest({
      params: this.route.paramMap,
      queryParams: this.route.queryParamMap
    })
    .pipe(takeUntilDestroyed())
    .subscribe(({ params, queryParams }) => {
      const category = params.get('category');
      const consoleName = params.get('name'); // Obtenemos el nuevo parámetro de consola
      const searchTerm = queryParams.get('q');

      this.state.update(current => ({
        ...current,
        currentCategory: category,
        currentConsole: consoleName, // Guardamos el nuevo estado
        currentSearchTerm: searchTerm
      }));
    });

    this.loadAllProducts();
  }

  loadAllProducts(): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.productService.getProducts().pipe(takeUntilDestroyed()).subscribe({
      next: (response) => {
        this.state.update(current => ({ ...current, products: response.records, loading: false }));
      },
      error: (err) => {
        this.state.update(current => ({ ...current, error: 'No se pudieron cargar los productos.', loading: false }));
        console.error(err);
      }
    });
  }

  // ⬅️ NUEVO: Señal para controlar la dirección de la animación
  slideDirection = signal<'left' | 'right'>('right');

// ⬅️ MEJORADO: Métodos de navegación del carrusel con dirección
nextSlide(): void {
  if (this.canGoNext()) {
    this.slideDirection.set('right');
    this.carouselIndex.update(i => i + 1);
  }
}

prevSlide(): void {
  if (this.canGoPrev()) {
    this.slideDirection.set('left');
    this.carouselIndex.update(i => i - 1);
  }
}

// ⬅️ NUEVO: Método para ir a una página específica
goToPage(pageIndex: number): void {
  if (pageIndex >= 0 && pageIndex < this.totalPages().length) {
    const currentIndex = this.carouselIndex();
    this.slideDirection.set(pageIndex > currentIndex ? 'right' : 'left');
    this.carouselIndex.set(pageIndex);
  }
}

}
