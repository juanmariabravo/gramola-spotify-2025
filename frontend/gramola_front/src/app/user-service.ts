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

  register(barName: string, email: string, pwd1: string, pwd2: string, clientId: string, clientSecret: string) {
    let info = {
      barName : barName,
      email : email,
      pwd1 : pwd1, 
      pwd2 : pwd2,
      clientId: clientId,
      clientSecret: clientSecret
    };
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    return this.http.post<any>(this.registerUrl, info, { headers });
  }

  login(email: string, password: string) {
    const payload = { email, password };
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    return this.http.post<any>(this.loginUrl, payload, { headers });
  }
}
