export interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
}

export type AnyObject = Record<string, unknown>;

export interface RequestResult<T = unknown> {
  success: boolean;
  error?: string | null;
  data?: T;
  message?: string;
  redirectTo?: string;
};

export type ApiErrorData = {
  details?: unknown;
  [key: string]: unknown;
};

export interface ApiErrorShape {
  response?: {
    data?:  ApiErrorData;
  };
  message?: string;
};

export type Organisation = {
  id: number;
  org_name: string;
  org_email?: string;
  org_phone_number?: string;
  country?: string;
  currency?: string;
};

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  user_organisations?: Organisation[];
  current_organisation?: Organisation | null;
};