import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.URL_API+'/users';

  constructor(private http: HttpClient) {}

  register(barName: string, email: string, pwd1: string, pwd2: string, clientId: string, clientSecret: string, signature: string) {
    const body = {
      barName,
      email,
      pwd1,
      pwd2,
      clientId,
      clientSecret,
      signature
    };
    return this.http.post<any>(`${this.apiUrl}/register`, body, { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
  }

  login(email: string, password: string) {
    const payload = { email, password };
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    return this.http.post<any>(`${this.apiUrl}/login`, payload, { headers });
  }

  recoverPassword(email: string): Observable<any> {
    const body = { email };
    return this.http.post(`${this.apiUrl}/recover-password`, body, {
      withCredentials: true,
      observe: 'response',
      responseType: 'text'
    });
  }

  validateResetToken(email: string, token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate-reset-token`, {
      params: { email, token },
      withCredentials: true,
      observe: 'response',
      responseType: 'text'
    });
  }

  resetPassword(email: string, token: string, newPassword: string): Observable<any> {
    const body = { email, token, newPassword };
    return this.http.post(`${this.apiUrl}/reset-password`, body, {
      withCredentials: true,
      observe: 'response',
      responseType: 'text'
    });
  }
}
