/** Error payload every endpoint returns with a non-2xx status. */
export interface ApiErrorBody {
  code: string;
  message: string;
  /** Per-field validation messages, keyed by request field name. */
  fieldErrors?: Record<string, string>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
