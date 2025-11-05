import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Music } from './music/music';
import { Callback } from './callback/callback';
import { Payments } from './payments/payments';
import { PlaylistAndDevices } from './playlist-and-devices/playlist-and-devices';

export const routes: Routes = [
	{ path: 'login', component: Login },
	{ path: 'register', component: Register },
	{ path: 'music', component: Music },
	{ path: 'payments', component: Payments },
	{ path: 'callback', component: Callback },
	{ path: 'playlist-and-devices', component: PlaylistAndDevices },
	{ path: '', redirectTo: 'register', pathMatch: 'full' }
];
