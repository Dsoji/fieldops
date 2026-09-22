export type Role = "admin" | "manager" | "field_worker";
export type Priority = "low" | "medium" | "high" | "critical";
export type AssetStatus = "operational" | "needs_attention" | "down" | "retired";
export type WorkOrderStatus = "open" | "assigned" | "in_progress" | "completed" | "cancelled";
export type WorkOrderKind = "inspection" | "maintenance" | "installation" | "repair";
export type IssueStatus = "open" | "acknowledged" | "in_progress" | "resolved";

export interface Organization {
  id: string;
  name: string;
  industry: string;
}

export interface Worker {
  id: string;
  fullName: string;
  role: Role;
  phone: string;
  baseSiteId: string;
  onShift: boolean;
}

export interface Site {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  capacityKw: number;
}

export interface AssetType {
  id: string;
  name: string;
  maintenanceIntervalDays: number;
}

export interface Asset {
  id: string;
  tag: string;
  name: string;
  typeId: string;
  siteId: string;
  manufacturer: string;
  model: string;
  status: AssetStatus;
  lastInspectedAt: string;
  nextMaintenanceOn: string;
}

export interface WorkOrder {
  id: string;
  reference: string;
  title: string;
  kind: WorkOrderKind;
  status: WorkOrderStatus;
  priority: Priority;
  siteId: string;
  assetId?: string;
  assignedTo?: string;
  sourceIssueId?: string;
  dueAt: string;
  checkedInAt?: string;
  checkInVerified?: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  reference: string;
  title: string;
  description: string;
  severity: Priority;
  status: IssueStatus;
  siteId: string;
  assetId?: string;
  reportedBy: string;
  reportedAt: string;
  photoCount: number;
  resolvedAt?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  kind: WorkOrderKind;
  summary: string;
  performedBy: string;
  performedAt: string;
}

export interface Activity {
  id: string;
  action:
    | "issue.reported"
    | "work_order.created"
    | "work_order.assigned"
    | "work_order.checked_in"
    | "work_order.completed"
    | "inspection.completed"
    | "issue.resolved";
  actorId: string;
  summary: string;
  siteId: string;
  createdAt: string;
}
