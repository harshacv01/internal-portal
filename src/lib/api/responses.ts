import { NextResponse } from "next/server";
import type { z } from "zod";

import { fieldErrorsFromZod } from "@/lib/validation/errors";

export type ApiErrorCode = "bad_request" | "unauthorized" | "forbidden";

// One envelope for every route so the client has a single shape to parse.
export type ApiErrorBody = {
  error: {
    message: string;
    code: ApiErrorCode;
    /** Per-field messages keyed by form field name, on validation failures. */
    fields?: Record<string, string[]>;
  };
};

export function ok<T>(data: T) {
  return NextResponse.json(data, { status: 200 });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

function error(
  status: number,
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string[]>,
) {
  const body: ApiErrorBody = { error: { message, code, ...(fields && { fields }) } };
  return NextResponse.json(body, { status });
}

export function badRequest(message: string, fields?: Record<string, string[]>) {
  return error(400, "bad_request", message, fields);
}

export function unauthorized(message = "Authentication required") {
  return error(401, "unauthorized", message);
}

export function forbidden(message = "You do not have access to this resource") {
  return error(403, "forbidden", message);
}

export function validationFailed(zodError: z.ZodError) {
  return badRequest(
    "Please correct the highlighted fields",
    fieldErrorsFromZod(zodError),
  );
}
