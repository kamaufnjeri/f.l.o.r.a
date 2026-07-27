export type AuditAction = "ADD" | "EDIT" | "DELETE";


export type AuditData = Record<string, unknown | null> | null;


export interface AuditTrail {
  id: string;
  action: AuditAction;
  model_name: string;
  object_id: string;

  before: AuditData;
  after: AuditData;

  created_at: string;

  changed_by: string;
  organisation: string;

  // if you add serializer fields for names
  changed_by_name?: string;
  organisation_name?: string;
}