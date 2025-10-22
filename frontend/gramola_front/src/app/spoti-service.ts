import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpotiService {

  // Use a safe any-cast for environment and provide sensible defaults to avoid TS2339
  private _env: any = (environment as any) || {};
  spoti_authUrl = this._env.spoti_authUrl || 'https://accounts.spotify.com/authorize';
  apiUrl = (this._env.URL_API ? (this._env.URL_API + '/spoti') : 'http://localhost:8080/spoti');
  redirectUri = this._env.redirectUri || 'http://127.0.0.1:4200/callback';
  spotiV1Url = this._env.spotiV1Url || 'https://api.spotify.com/v1';
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
    return this.http.get<any>(`${this.spotiV1Url}/me/player/currently-playing`, { headers });
  }

  getDevices() : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.spotiToken}`
    });

    let url = `${this.spotiV1Url}/me/player/devices`;
    return this.http.get<any>(url, { headers });
  }

  getPlaylists() : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.spotiToken}`
    });

    return this.http.get<any>(`${this.spotiV1Url}/me/playlists`, { headers });
  }
  getCurrentPlayList() : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.spotiToken}`
    });
    return this.http.get<any>(`${this.spotiV1Url}/me/player/currently-playing`, { headers });
  }

  getTracks(playlistId : string) : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.spotiToken}`
    });
    return this.http.get<any>(`${this.spotiV1Url}/playlists/${playlistId}/tracks`, { headers });
  }

  addToQueue(uri : string) : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.spotiToken}`
    });
    let url = `${this.spotiV1Url}/me/player/queue?uri=${encodeURIComponent(uri)}`;
    return this.http.post<any>(url, null, { headers, responseType: 'text' as 'json' });
  }

  searchTracks(query : string) : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.spotiToken}`
    });
    let url = `${this.spotiV1Url}/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
    return this.http.get<any>(url, { headers });
  }

  // Nuevo: obtener la cola real de reproducción desde Spotify (GET /me/player/queue)

  getQueue(): Observable<any> {
    if (!this.spotiToken) {
      throw new Error('Spotify token is not set.');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.spotiToken}`,
      'Accept': 'application/json'
    });
    return this.http.get<any>(`${this.spotiV1Url}/me/player/queue`, { headers });
  }
}