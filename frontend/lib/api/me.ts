import { Me } from "../types";
import { authHeaders } from "./auth-headers";
import { forbiddenError } from "./errors";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Shape of GET /me as the FastAPI backend sends it
type ApiMeResponse = {
  is_admin: boolean;
};

// convert api response of /me from snake case to camel case
function convertToMe(me: ApiMeResponse) {
  const result: Me = {
    isAdmin: me.is_admin,
  };
  return result;
}

// asked once per app load to choose the screen: suspended, access denied, or the app itself
export async function getMe(): Promise<Me> {
  const url = `${API_URL}/me`;

  const response = await fetch(url, {
    headers: { ...(await authHeaders()) },
  });
  if (response.status === 403) {
    throw await forbiddenError(response);
  }
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const me: ApiMeResponse = await response.json();
  return convertToMe(me);
}
