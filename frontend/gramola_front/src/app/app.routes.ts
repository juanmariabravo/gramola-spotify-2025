import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Music } from './music/music';
import { Callback } from './callback/callback';
import { Payments } from './payments/payments';
import { PlaylistAndDevices } from './playlist-and-devices/playlist-and-devices';
import { Geolocalizacion } from './geolocalizacion/geolocalizacion';
import { RecoverPassword } from './recover-password/recover-password';
import { ResetPassword } from './reset-password/reset-password';
import { Home } from './home/home';
import { Account } from './account/account';

export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'login', component: Login },
	{ path: 'register', component: Register },
	{ path: 'recover-password', component: RecoverPassword },
	{ path: 'reset-password', component: ResetPassword },
	{ path: 'music', component: Music },
	{ path: 'payments', component: Payments },
	{ path: 'callback', component: Callback },
	{ path: 'playlist-and-devices', component: PlaylistAndDevices },
	{ path: 'geolocalizacion', component: Geolocalizacion },
	{ path: 'account', component: Account },
	{ path: '', redirectTo: 'register', pathMatch: 'full' }
];
