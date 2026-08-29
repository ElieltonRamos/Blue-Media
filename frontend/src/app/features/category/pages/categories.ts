import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { NotificationService } from '../../../shared/toastr/notification.service';
import { ModalEditEntity, FormField } from '../../../shared/modal-edit-entity/modal-edit-entity';
import { CategoriesService } from '../services/category.service';
import { Category, CreateCategoryDto } from '../types/category';
import { alertConfirm } from '../../../shared/alerts/custom-alerts';

interface CategoryFormEntity {
  id?: number;
  name: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ModalEditEntity],
  templateUrl: './categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories implements OnInit {
  private categoriesService = inject(CategoriesService);
  private notification = inject(NotificationService);

  categories = signal<Category[]>([]);
  loading = signal(true);

  showModal = signal(false);
  modalTitle = signal('Nova Categoria');
  entity: CategoryFormEntity = { name: '' };

  fields: FormField[] = [
    { name: 'name', label: 'Nome', type: 'text', placeholder: 'Nome da categoria' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.categoriesService.findAll().subscribe({
      next: (res) => {
        this.categories.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Não foi possível carregar as categorias');
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.entity = { name: '' };
    this.modalTitle.set('Nova Categoria');
    this.showModal.set(true);
  }

  openEdit(category: Category): void {
    this.entity = { id: category.id, name: category.name };
    this.modalTitle.set('Editar Categoria');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveEntity(entity: CategoryFormEntity): void {
    if (!entity.name) {
      this.notification.error('Preencha o nome');
      return;
    }

    const dto: CreateCategoryDto = { name: entity.name };

    const request = entity.id
      ? this.categoriesService.update(entity.id, dto)
      : this.categoriesService.create(dto);

    request.subscribe({
      next: () => {
        this.notification.success(entity.id ? 'Categoria atualizada' : 'Categoria criada');
        this.showModal.set(false);
        this.load();
      },
      error: (err) => {
        const message =
          err.status === 409 ? 'Categoria já cadastrada' : 'Não foi possível salvar a categoria';
        this.notification.error(message);
      },
    });
  }

  async remove(category: Category): Promise<void> {
    const confirmed = await alertConfirm(`Remover a categoria "${category.name}"?`);
    if (!confirmed) return;

    this.categoriesService.remove(category.id).subscribe({
      next: () => {
        this.categories.update((list) => list.filter((c) => c.id !== category.id));
        this.notification.success('Categoria removida');
      },
      error: (err) => {
        const message =
          err.status === 409
            ? 'Categoria possui clientes vinculados'
            : 'Não foi possível remover a categoria';
        this.notification.error(message);
      },
    });
  }
}
