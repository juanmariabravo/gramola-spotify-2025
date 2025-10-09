import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/users/register';
  private loginUrl = 'http://localhost:8080/users/login';

  constructor(private http: HttpClient) {}

  register(email : string, pwd1 : string, pwd2 : string) {
    let info = {
      email : email,
      pwd1 : pwd1, 
      pwd2 : pwd2
    }
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    return this.http.post<any>(this.apiUrl, info, { headers });
  }

  login(email: string, password: string) {
    const payload = { email, password };
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    return this.http.post<any>(this.loginUrl, payload, { headers });
  }
}
