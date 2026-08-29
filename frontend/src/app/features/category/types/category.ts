export interface Category {
  id: number;
  name: string;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
