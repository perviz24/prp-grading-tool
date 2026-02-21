function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnvVar(name: string): string | undefined {
  return process.env[name] || undefined;
}

// Client-side vars are optional so the app can render without providers during setup
export const env = {
  NEXT_PUBLIC_CONVEX_URL: getOptionalEnvVar("NEXT_PUBLIC_CONVEX_URL"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: getOptionalEnvVar(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  ),
  CLERK_SECRET_KEY:
    typeof window === "undefined"
      ? getOptionalEnvVar("CLERK_SECRET_KEY")
      : undefined,
} as const;
