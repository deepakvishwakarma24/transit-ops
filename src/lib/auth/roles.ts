import { ApplicationRole } from "@prisma/client";

export const applicationRoles = [
  ApplicationRole.UNASSIGNED,
  ApplicationRole.FLEET_MANAGER,
  ApplicationRole.DISPATCHER,
  ApplicationRole.SAFETY_OFFICER,
  ApplicationRole.FINANCIAL_ANALYST,
] as const;

export type AppRole = (typeof applicationRoles)[number];

export const assignableRoles = applicationRoles.filter(
  (role) => role !== ApplicationRole.UNASSIGNED,
);

export function isApplicationRole(value: unknown): value is AppRole {
  return (
    typeof value === "string" &&
    applicationRoles.includes(value as AppRole)
  );
}
