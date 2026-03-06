import type { LucideIcon } from "lucide-react";

export interface TitleInterface {
  title: string;
  subtitle: string;
}

export interface TitlesInterface {
  create: TitleInterface;
  update: TitleInterface;
  delete: TitleInterface;
}

export interface ModelInterface {
  name: string;
  plural?: string;
  /**
   * true for feminine (e.g., "la", "una") and false for masculine (e.g., "el", "un").
   * Indicates the grammatical gender of the model name for correct article usage in Spanish.
   */
  gender: boolean;
  message?: string;
}

export interface ModelComplete<T = undefined> {
  MODEL: ModelInterface;
  ICON: LucideIcon;
  ENDPOINT: string;
  QUERY_KEY: string;
  ROUTE: string;
  ABSOLUTE_ROUTE: string;
  ROUTE_ADD: string;
  ROUTE_UPDATE: string;
  ROUTE_DASHBOARD?: string;
  EMPTY?: T;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface Option {
  label: string | (() => React.ReactNode);
  value: string;
  description?: string;
  searchCode?: string; // Campo adicional para búsqueda por código
}

export type Action = "create" | "edit" | "delete";
