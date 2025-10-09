import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Music } from './music/music';
import { Payment } from './payment/payment';

export const routes: Routes = [
	{ path: 'login', component: Login },
	{ path: 'register', component: Register },
	{ path: 'music', component: Music },
	{ path: 'payment', component: Payment },
	{ path: '', redirectTo: 'register', pathMatch: 'full' }
];
