export type UserRole = "SUPER_ADMIN" | "SALES_LEAD" | "SALES_MANAGER" | "COLLABORATOR";

export interface SessionUser {
  id: string;
  orgId: string;
  teamId: string | null;
  role: UserRole;
  name: string;
  email: string;
  jobTitle?: string;
  locale: string;
  timezone: string;
  countries?: string[];
}

export const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: "Admin",
  SALES_LEAD: "Sales Lead",
  SALES_MANAGER: "Sales Manager",
  COLLABORATOR: "Collaborator",
};
