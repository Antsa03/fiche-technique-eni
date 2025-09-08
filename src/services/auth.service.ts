export interface User {
  id: string;
  email: string;
  nom: string;
  prenoms: string;
  contact: string;
  role: {
    id: number;
    name: string;
  };
  titre: {
    code_titre: string;
    description_titre: string;
  };
  status: {
    id: number;
    name: string;
  };
}

export interface AuthData {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: User;
}

export class AuthService {
  private static readonly TOKEN_KEY = "authToken";
  private static readonly REFRESH_TOKEN_KEY = "refreshToken";
  private static readonly TOKEN_EXPIRES_KEY = "tokenExpires";
  private static readonly USER_KEY = "user";

  static isAuthenticated(): boolean {
    const token = this.getToken();
    const expires = this.getTokenExpires();

    if (!token || !expires) {
      return false;
    }

    // Vérifier si le token n'est pas expiré
    return Date.now() < expires;
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getTokenExpires(): number | null {
    const expires = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    return expires ? parseInt(expires, 10) : null;
  }

  static getUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static setAuthData(authData: AuthData): void {
    localStorage.setItem(this.TOKEN_KEY, authData.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken);
    localStorage.setItem(
      this.TOKEN_EXPIRES_KEY,
      authData.tokenExpires.toString()
    );
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
  }
}
