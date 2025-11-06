import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private registerUrl = environment.URL_API+'/users/register';
  private loginUrl = environment.URL_API+'/users/login';

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
    return this.http.post<any>(this.registerUrl, body, { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
  }

  login(email: string, password: string) {
    const payload = { email, password };
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    return this.http.post<any>(this.loginUrl, payload, { headers });
  }
}
