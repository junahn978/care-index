// thrown when the backend answers 403: the user is signed in, but their email isn't on the Allowlist
export class AccessDeniedError extends Error {}

// thrown when the backend answers 403 because an Admin suspended this account
export class AccountSuspendedError extends Error {}

// every route answers 403 with {"detail": {"code": ..., "message": ...}}. Decide by the code,
// since the message is only for people and can change
export async function forbiddenError(response: Response) {
  let code: unknown;
  try {
    const body = await response.json();
    code = body?.detail?.code;
  } catch {
    // not JSON: treat it like any other 403 below
  }

  if (code === "account_suspended") {
    return new AccountSuspendedError("Account suspended");
  }
  // "not_on_allowlist", and any 403 without a code we know
  return new AccessDeniedError("Access denied");
}
