import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "cc_token";
const USER_KEY = "cc_user";

let _token: string | null = null;
let _user: any | null = null;

export async function init(): Promise<{ token: string | null; user: any | null }> {
  try {
    const [t, u] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);
    _token = t;
    _user = u ? JSON.parse(u) : null;
  } catch {
    _token = null;
    _user = null;
  }
  return { token: _token, user: _user };
}

export function setToken(token: string | null) {
  _token = token;
  if (token) AsyncStorage.setItem(TOKEN_KEY, token).catch(() => {});
  else AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
}

export function setUser(user: any | null) {
  _user = user;
  if (user) AsyncStorage.setItem(USER_KEY, JSON.stringify(user)).catch(() => {});
  else AsyncStorage.removeItem(USER_KEY).catch(() => {});
}

export function getToken() {
  return _token;
}

export function getUser() {
  return _user;
}

export default { init, setToken, setUser, getToken, getUser };
