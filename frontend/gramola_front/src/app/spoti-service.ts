import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpotiService {

  // Use a safe any-cast for environment and provide sensible defaults to avoid TS2339
  private _env: any = (environment as any) || {};
  spoti_authUrl = this._env.spoti_authUrl;
  apiUrl = this._env.URL_API + '/spoti';
  redirectUri = this._env.redirectUri;
  spotiV1Url = this._env.spotiV1Url;
  clientId?: string = '';
  //queue: TrackObject[] = [];
  constructor(private http: HttpClient) { }

  getAuthorizationToken(code : string) : Observable<any> {
      let url = `${this.apiUrl}/getAuthorizationToken?code=${code}&clientId=${sessionStorage.getItem("clientId")}`;
      return this.http.get(url);
  }

  getSpotifyToken(): string | null {
    // leer de sessionStorage
    let token = sessionStorage.getItem('accessToken');
    return token;
  }
  
  getCurrentlyPlaying(): Observable<any> {
    if (!this.getSpotifyToken()) {
      throw new Error('Spotify token is not set.');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getSpotifyToken()}`,
      'Accept': 'application/json'
    });
    return this.http.get<any>(`${this.spotiV1Url}/me/player/currently-playing`, { headers });
  }

  getDevices() : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getSpotifyToken()}`
    });
    let url = `${this.spotiV1Url}/me/player/devices`;
    return this.http.get<any>(url, { headers });
  }

  setCurrentDevice(deviceId : string) : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getSpotifyToken()}`,
      'Content-Type': 'application/json'
    });

    let body = JSON.stringify({ device_ids: [deviceId] });
    return this.http.put<any>(`${this.spotiV1Url}/me/player`, body, { headers });
  }

  // Iniciar reproducción en un dispositivo específico, opcionalmente con una playlist (context_uri)
  startPlayback(deviceId: string, playlistUri?: string): Observable<any> {
    if (!this.getSpotifyToken()) {
      throw new Error('Spotify token is not set.');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getSpotifyToken()}`,
      'Content-Type': 'application/json'
    });
    // body: si hay playlistUri usarlo como context_uri; si no, body vacío para reanudar lo pausado
    const body = playlistUri ? { context_uri: playlistUri } : {};
    const url = `${this.spotiV1Url}/me/player/play?device_id=${encodeURIComponent(deviceId)}`;
    return this.http.put<any>(url, body, { headers, responseType: 'text' as 'json' });
  }

  getPlaylists() : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getSpotifyToken()}`
    });

    return this.http.get<any>(`${this.spotiV1Url}/me/playlists`, { headers });
  }
  getCurrentPlayList() : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getSpotifyToken()}`
    });
    return this.http.get<any>(`${this.spotiV1Url}/me/player/currently-playing`, { headers });
  }

  getTracks(playlistId : string) : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getSpotifyToken()}`
    });
    return this.http.get<any>(`${this.spotiV1Url}/playlists/${playlistId}/tracks`, { headers });
  }

  addToQueue(uri : string) : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getSpotifyToken()}`
    });
    let url = `${this.spotiV1Url}/me/player/queue?uri=${encodeURIComponent(uri)}`;
    return this.http.post<any>(url, null, { headers, responseType: 'text' as 'json' });
  }

  searchTracks(query : string) : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getSpotifyToken()}`
    });
    let url = `${this.spotiV1Url}/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
    return this.http.get<any>(url, { headers });
  }

  // Buscar playlists públicas (además de las del usuario)
  searchPlaylists(query: string): Observable<any> {
    if (!this.getSpotifyToken()) {
      throw new Error('Spotify token is not set.');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getSpotifyToken()}`,
      'Accept': 'application/json'
    });
    const url = `${this.spotiV1Url}/search?q=${encodeURIComponent(query)}&type=playlist&limit=20`;
    return this.http.get<any>(url, { headers });
  }

  // Nuevo: obtener la cola real de reproducción desde Spotify (GET /me/player/queue)
  getQueue(): Observable<any> {
    if (!this.getSpotifyToken()) {
      throw new Error('Spotify token is not set.');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getSpotifyToken()}`,
      'Accept': 'application/json'
    });
    return this.http.get<any>(`${this.spotiV1Url}/me/player/queue`, { headers });
  }

  // Notificar al backend que una canción se ha añadido correctamente a la cola
  notifySongAdded(trackId: string, userToken: string): Observable<any> {
    let url = `${this.apiUrl}/notifySongAdded`;
    const body = { 
      trackId: trackId,
      userToken: userToken 
    };
    return this.http.post<any>(url, body);
  }
}