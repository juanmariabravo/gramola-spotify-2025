import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpotiService {
  spoti_authUrl = 'https://accounts.spotify.com/authorize';
  redirectUri = 'http://127.0.0.1:4200/callback';
  getAuthUrl = 'http://127.0.0.1:8080/spoti/getAuthorizationToken';
  //clientId: string = '';
  spotiToken: string = '';

  constructor(private http: HttpClient) { }

  getAuthorizationToken(code: string, clientId: string) {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const body = { code, clientId };
    // El intercambio de código por token debe realizarse vía POST (no enviar el code en la URL)
    return this.http.post<any>(this.getAuthUrl, body, { headers });
  }
}