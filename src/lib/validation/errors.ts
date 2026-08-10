import type { z } from "zod";

// Shared by the route handlers and the forms so a validation error looks the
// same whether it was caught in the browser or on the server.
export function fieldErrorsFromZod(error: z.ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    // Issues with an empty path are about the object as a whole, not one input.
    const key = issue.path.length > 0 ? issue.path.map(String).join(".") : "_form";
    (fields[key] ??= []).push(issue.message);
  }

  return fields;
}
