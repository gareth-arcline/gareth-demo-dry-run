import { useMsal, useAccount } from "@azure/msal-react";
import { loginRequest, apiRequest } from "../config/authConfig";

export function useAuth() {
  const { instance, accounts, inProgress } = useMsal();
  const account = useAccount(accounts[0] || null);

  const isAuthenticated = accounts.length > 0;

  const login = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getAccessToken = async () => {
    if (!account) return null;
    // Try API scope first, fall back to login scope
    for (const request of [apiRequest, loginRequest]) {
      try {
        const response = await instance.acquireTokenSilent({
          ...request,
          account: account,
        });
        return response.accessToken;
      } catch {
        // try next scope
      }
    }
    // All silent attempts failed, redirect
    try {
      await instance.acquireTokenRedirect(apiRequest);
    } catch (redirectError) {
      console.error("Token redirect failed:", redirectError);
    }
    return null;
  };

  const getUser = () => {
    if (!account) return null;
    return {
      name: account.name,
      email: account.username,
      id: account.localAccountId,
    };
  };

  return {
    isAuthenticated,
    login,
    logout,
    getAccessToken,
    getUser,
    inProgress,
    account,
  };
}
