import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpotiService {
  authUrl = 'https://accounts.spotify.com/authorize';
  redirectUri = 'http://localhost:4200/music';
  clientId: string = '';
  constructor() { }


}