import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpotiService {
  authUrl = 'https://accounts.spotify.com/authorize';
  redirectUri = 'http://127.0.0.1:4200/callback';
  clientId: string = '';
  constructor() { }


}