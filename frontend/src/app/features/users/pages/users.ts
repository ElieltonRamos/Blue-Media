import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { UsersService } from '../services/users.service';
import { NotificationService } from '../../../shared/toastr/notification.service';
import { alertConfirm } from '../../../shared/alerts/custom-alerts';
import { ModalEditEntity, FormField } from '../../../shared/modal-edit-entity/modal-edit-entity';
import { CreateUserDto, UpdateUserDto, User } from '../types/users';

interface UserFormEntity {
  id?: number;
  name: string;
  username: string;
  password: string;
  role: string;
  activeLabel: string;
}

const ROLE_OPTIONS = ['admin', 'operator'];
const ACTIVE_OPTIONS = ['Ativo', 'Inativo'];

const CREATE_FIELDS: FormField[] = [
  { name: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do usuário' },
  { name: 'username', label: 'Username', type: 'text', placeholder: 'username' },
  { name: 'password', label: 'Senha', type: 'password', placeholder: 'Digite a senha' },
  { name: 'role', label: 'Perfil', type: 'select', options: ROLE_OPTIONS },
];

const EDIT_FIELDS: FormField[] = [
  { name: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do usuário' },
  { name: 'username', label: 'Username', type: 'text', placeholder: 'username' },
  {
    name: 'password',
    label: 'Nova senha',
    type: 'password',
    placeholder: 'Deixe em branco pra manter',
  },
  { name: 'role', label: 'Perfil', type: 'select', options: ROLE_OPTIONS },
  { name: 'activeLabel', label: 'Status', type: 'select', options: ACTIVE_OPTIONS },
];

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ModalEditEntity],
  templateUrl: './users.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users implements OnInit {
  private usersService = inject(UsersService);
  private notification = inject(NotificationService);

  users = signal<User[]>([]);
  loading = signal(true);

  showModal = signal(false);
  modalTitle = signal('Novo Usuário');
  fields: FormField[] = CREATE_FIELDS;
  entity: UserFormEntity = {
    name: '',
    username: '',
    password: '',
    role: 'operator',
    activeLabel: 'Ativo',
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.usersService.findAll().subscribe({
      next: (res) => {
        this.users.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Não foi possível carregar os usuários');
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.entity = { name: '', username: '', password: '', role: 'operator', activeLabel: 'Ativo' };
    this.fields = CREATE_FIELDS;
    this.modalTitle.set('Novo Usuário');
    this.showModal.set(true);
  }

  openEdit(user: User): void {
    this.entity = {
      id: user.id,
      name: user.name,
      username: user.username,
      password: '',
      role: user.role,
      activeLabel: user.isActive ? 'Ativo' : 'Inativo',
    };
    this.fields = EDIT_FIELDS;
    this.modalTitle.set('Editar Usuário');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveEntity(entity: UserFormEntity): void {
    if (!entity.name || !entity.username) {
      this.notification.error('Preencha nome e username');
      return;
    }

    const role = entity.role as 'admin' | 'operator';

    if (!entity.id) {
      if (!entity.password) {
        this.notification.error('Senha é obrigatória');
        return;
      }

      const dto: CreateUserDto = {
        name: entity.name,
        username: entity.username,
        password: entity.password,
        role,
      };

      this.usersService.create(dto).subscribe({
        next: () => {
          this.notification.success('Usuário criado');
          this.showModal.set(false);
          this.load();
        },
        error: (err) => this.notification.error(this.mapUserError(err)),
      });
      return;
    }

    const dto: UpdateUserDto = {
      name: entity.name,
      username: entity.username,
      role,
      isActive: entity.activeLabel === 'Ativo',
      ...(entity.password ? { password: entity.password } : {}),
    };

    this.usersService.update(entity.id, dto).subscribe({
      next: () => {
        this.notification.success('Usuário atualizado');
        this.showModal.set(false);
        this.load();
      },
      error: (err) => this.notification.error(this.mapUserError(err)),
    });
  }

  async remove(user: User): Promise<void> {
    const confirmed = await alertConfirm(`Remover o usuário "${user.name}"?`);
    if (!confirmed) return;

    this.usersService.remove(user.id).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.id !== user.id));
        this.notification.success('Usuário removido');
      },
      error: () => {
        this.notification.error('Não foi possível remover o usuário');
      },
    });
  }

  private mapUserError(err: any): string {
    if (err.status === 409) return 'Nome ou username já cadastrado';
    if (err.status === 403) return 'Acesso restrito ao perfil admin';
    return 'Não foi possível salvar o usuário';
  }
}
