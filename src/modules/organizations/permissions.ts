/** Better Auth can encode multiple roles as a comma-separated string. */
export function canManageProjects(role: string) {
  return role
    .split(",")
    .some((value) => ["owner", "admin"].includes(value.trim()));
}
