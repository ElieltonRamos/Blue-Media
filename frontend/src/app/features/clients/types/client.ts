export interface Client {
  id: number;
  name: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: { id: number; name: string };
  _count: { totems: number };
}

export interface CreateClientDto {
  name: string;
  categoryId: number;
}

export type UpdateClientDto = Partial<CreateClientDto>;
