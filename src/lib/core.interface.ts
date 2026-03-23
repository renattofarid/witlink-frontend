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
  ROUTE_ADD?: string;
  ROUTE_UPDATE?: string;
  ROUTE_DASHBOARD?: string;
  EMPTY?: T;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface PaginationResponse<T> {
  data: T[];
  links: Links;
  meta: Meta;
}

export interface Links {
  first: string;
  last: string;
  prev: null;
  next: null;
}

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  links: Link[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}
export interface Link {
  url: null | string;
  label: string;
  active: boolean;
}

export interface Option {
  label: string | (() => React.ReactNode);
  value: string;
  description?: string;
  searchCode?: string; // Campo adicional para búsqueda por código
}

export type Action = "create" | "edit" | "delete" | "restore";
