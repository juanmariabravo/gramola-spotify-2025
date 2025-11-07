import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotiService } from '../spoti-service';

@Component({
  selector: 'app-callback',
  imports: [],
  templateUrl: './callback.html',
  styleUrl: './callback.css'
})
export class Callback {
  showError = false;
  errorMessage = '';
  isInvalidClient = false;

  constructor(private route: ActivatedRoute, private router: Router, public spotiService: SpotiService) {}

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const code = qp.get('code');
    const state = qp.get('state');
    const error = qp.get('error');

    if (error) {
      this.handleSpotifyError(error);
      return;
    }
    if (!code || !state) {
      this.showErrorMessage('Faltan parámetros de autorización. Por favor intenta iniciar sesión de nuevo.');
      this.router.navigate(['/login']);
      return;
    }

    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      console.error('State mismatch. oauth_state:', storedState, 'state:', state);
      this.showErrorMessage('Error de seguridad en la autorización. Por favor intenta de nuevo.');
      return;
    }

    history.replaceState({}, '', '/callback');

    const clientId = sessionStorage.getItem('clientId');
    console.log("clientId:", clientId);
    if (!clientId) {
      this.showErrorMessage('No se encontró el Client ID. Por favor inicia sesión de nuevo.');
      return;
    }

    // Ask Spotify for the Authorization Token
    this.spotiService.getAuthorizationToken(code).subscribe({
      next: (data) => {
        console.log('Authorization token received:', data);
        sessionStorage.setItem('accessToken', data.access_token);
        this.router.navigateByUrl('/playlist-and-devices');
      },
      error: (error) => {
        console.error('Error fetching authorization token:', error);
        this.handleAuthorizationError(error);
      }
    });
  }

  handleSpotifyError(error: string) {
    if (error === 'access_denied') {
      this.showErrorMessage('Has cancelado la autorización de Spotify. Para usar la aplicación, debes autorizar el acceso.');
    } else {
      this.showErrorMessage(`Error de Spotify: ${error}`);
    }
  }

  handleAuthorizationError(error: any) {
    const errorMsg = error?.error?.message || error?.message || '';
    
    // Detectar error de "Invalid client"
    if (errorMsg.toLowerCase().includes('invalid') && errorMsg.toLowerCase().includes('client')) {
      this.isInvalidClient = true;
      this.errorMessage = `
        <strong>Error: Correo electrónico, Client ID o Client Secret inválidos</strong><br><br>
        Las credenciales de Spotify registradas no coinciden con tu cuenta de Spotify.<br><br>
        <strong>¿Qué hacer?</strong><br>
        1. Asegúrate de que la cuenta de Spotify usada para crear la app es la misma que usas para iniciar sesión (mismo correo electrónico).<br>
        2. Ve a <a href="https://developer.spotify.com/dashboard" target="_blank" style="color:#1DB954;">Spotify Developer Dashboard</a> y verifica que el Client ID y Client Secret sean correctos.<br>
        3. Vuelve a registrarte con las credenciales correctas.
      `;
    } else {
      this.errorMessage = `Error al obtener el token de autorización: ${errorMsg}`;
    }
    
    this.showError = true;
  }

  showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
  }

  goToRegister() {
    // Limpiar sessionStorage para evitar datos obsoletos
    sessionStorage.clear();
    this.router.navigate(['/register']);
  }

  goToLogin() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
