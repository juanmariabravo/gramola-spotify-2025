import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpotiService {
  spoti_authUrl = 'https://accounts.spotify.com/authorize';
  apiUrl = 'http://localhost:8080/spoti';
  redirectUri = 'http://127.0.0.1:4200/callback';
  spotiToken: string = '';
  clientId?: string = '';
  //queue: TrackObject[] = [];
  constructor(private http: HttpClient) { }

  getAuthorizationToken(code : string) : Observable<any> {
      let url = `${this.apiUrl}/getAuthorizationToken?code=${code}&clientId=${sessionStorage.getItem("clientId")}`;
      return this.http.get(url);
  }

  getCurrentlyPlaying(): Observable<any> {
    if (!this.spotiToken) {
      throw new Error('Spotify token is not set.');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.spotiToken}`,
      'Accept': 'application/json'
    });
    return this.http.get<any>('https://api.spotify.com/v1/me/player/currently-playing', { headers });
  }
}