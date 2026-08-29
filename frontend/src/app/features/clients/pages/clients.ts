import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { NotificationService } from '../../../shared/toastr/notification.service';
import { ModalEditEntity, FormField } from '../../../shared/modal-edit-entity/modal-edit-entity';
import { ClientsService } from '../services/client.service';
import { CategoriesService } from '../../category/services/category.service';
import { Client, CreateClientDto } from '../types/client';
import { Category } from '../../category/types/category';
import { alertConfirm } from '../../../shared/alerts/custom-alerts';

interface ClientFormEntity {
  id?: number;
  name: string;
  categoryName: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [ModalEditEntity],
  templateUrl: './clients.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Clients implements OnInit {
  private clientsService = inject(ClientsService);
  private categoriesService = inject(CategoriesService);
  private notification = inject(NotificationService);

  clients = signal<Client[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  showModal = signal(false);
  modalTitle = signal('Novo Cliente');
  entity: ClientFormEntity = { name: '', categoryName: '' };

  fields: FormField[] = [
    { name: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do cliente' },
    { name: 'categoryName', label: 'Categoria', type: 'select', options: [] },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.clientsService.findAll().subscribe({
      next: (res) => {
        this.clients.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Não foi possível carregar os clientes');
        this.loading.set(false);
      },
    });

    this.categoriesService.findAll().subscribe({
      next: (res) => {
        this.categories.set(res);
        this.fields = [this.fields[0], { ...this.fields[1], options: res.map((c) => c.name) }];
      },
      error: () => {
        this.notification.error('Não foi possível carregar as categorias');
      },
    });
  }

  openCreate(): void {
    this.entity = { name: '', categoryName: this.categories()[0]?.name ?? '' };
    this.modalTitle.set('Novo Cliente');
    this.showModal.set(true);
  }

  openEdit(client: Client): void {
    this.entity = { id: client.id, name: client.name, categoryName: client.category.name };
    this.modalTitle.set('Editar Cliente');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveEntity(entity: ClientFormEntity): void {
    const categoryId = this.categories().find((c) => c.name === entity.categoryName)?.id;

    if (!entity.name || !categoryId) {
      this.notification.error('Preencha nome e categoria');
      return;
    }

    const dto: CreateClientDto = { name: entity.name, categoryId };

    const request = entity.id
      ? this.clientsService.update(entity.id, dto)
      : this.clientsService.create(dto);

    request.subscribe({
      next: () => {
        this.notification.success(entity.id ? 'Cliente atualizado' : 'Cliente criado');
        this.showModal.set(false);
        this.load();
      },
      error: (err) => {
        const message =
          err.status === 409 ? 'Cliente já cadastrado' : 'Não foi possível salvar o cliente';
        this.notification.error(message);
      },
    });
  }

  async remove(client: Client): Promise<void> {
    const confirmed = await alertConfirm(`Remover o cliente "${client.name}"?`);
    if (!confirmed) return;

    this.clientsService.remove(client.id).subscribe({
      next: () => {
        this.clients.update((list) => list.filter((c) => c.id !== client.id));
        this.notification.success('Cliente removido');
      },
      error: (err) => {
        const message =
          err.status === 409
            ? 'Cliente possui totens/mídia vinculados'
            : 'Não foi possível remover o cliente';
        this.notification.error(message);
      },
    });
  }
}
