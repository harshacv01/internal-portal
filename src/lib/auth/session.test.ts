import { SignJWT } from "jose/jwt/sign";
import { describe, expect, it } from "vitest";

import { type SessionUser, signSessionToken, verifySessionToken } from "./session";

const user: SessionUser = {
  sub: "6f1b7d84-1c3f-4a2b-9f3e-8d1a5c2b7e40",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
};

describe("session tokens", () => {
  it("round-trips a signed session", async () => {
    const token = await signSessionToken(user);
    await expect(verifySessionToken(token)).resolves.toEqual(user);
  });

  it("returns null when there is no token", async () => {
    await expect(verifySessionToken(undefined)).resolves.toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await signSessionToken({ ...user, role: "member" });
    const [header, payload, signature] = token.split(".");

    // Re-encode the claims with an escalated role, keeping the old signature.
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    const forged = Buffer.from(JSON.stringify({ ...decoded, role: "admin" })).toString(
      "base64url",
    );

    await expect(
      verifySessionToken(`${header}.${forged}.${signature}`),
    ).resolves.toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const foreign = await new SignJWT({ ...user })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.sub)
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("a-completely-different-secret-value-32"));

    await expect(verifySessionToken(foreign)).resolves.toBeNull();
  });

  it("rejects an expired token", async () => {
    const expired = await new SignJWT({
      email: user.email,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.sub)
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(new TextEncoder().encode(process.env.SESSION_SECRET!));

    await expect(verifySessionToken(expired)).resolves.toBeNull();
  });

  it("rejects a validly signed token whose claims no longer fit the schema", async () => {
    // Tokens outlive deploys, so a stale claim set must fail closed.
    const stale = await new SignJWT({ email: "admin@example.com", role: "wizard" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.sub)
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(process.env.SESSION_SECRET!));

    await expect(verifySessionToken(stale)).resolves.toBeNull();
  });
});
