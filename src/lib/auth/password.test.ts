import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies a password against its own hash", async () => {
    const hash = await hashPassword("correct horse battery staple");
    await expect(verifyPassword("correct horse battery staple", hash)).resolves.toBe(
      true,
    );
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    await expect(verifyPassword("Correct horse battery staple", hash)).resolves.toBe(
      false,
    );
  });

  it("salts each hash, so identical passwords are not linkable", async () => {
    const [first, second] = await Promise.all([
      hashPassword("shared-password"),
      hashPassword("shared-password"),
    ]);

    expect(first).not.toBe(second);
    await expect(verifyPassword("shared-password", first)).resolves.toBe(true);
    await expect(verifyPassword("shared-password", second)).resolves.toBe(true);
  });

  it("rejects a malformed stored hash instead of throwing", async () => {
    for (const malformed of ["", "not-a-hash", "scrypt$only-one-part", "bcrypt$a$b"]) {
      await expect(verifyPassword("anything", malformed)).resolves.toBe(false);
    }
  });
});
