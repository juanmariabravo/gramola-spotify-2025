import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpotiService {
  spoti: any = {
    authUrl: 'https://accounts.spotify.com/authorize',
    redirectUri: 'http://localhost:4200/music'
  };
  scopes: any = ['user-read-private', 'user-read-email', 'playlist-read-private', 'playlist-read-collaborative', 'playlist-modify-public', 'playlist-modify-private', 'streaming', 'user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing', 'app-remote-control', 'user-read-recently-played', 'user-top-read'];
  
  constructor() { }

  private getToken() {
    let state = this.generateString()

    let params = "response_type=code";
    params += `&client_id=${sessionStorage.getItem("clientId")}`;
    params += `&scope=${encodeURIComponent(this.scopes.join(" "))}`;
    params += `&redirect_uri=${this.spoti.redirectUri}`;
    params += `&state=${state}`;

    sessionStorage.setItem("oauth_state", state);
    let url = this.spoti.authUrl + "?" + params;
    window.location.href = url
  }

  private generateString(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    sessionStorage.setItem("code", code);
    return code;
  }

}