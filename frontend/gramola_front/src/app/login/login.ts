import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../user-service';
import { SpotiService } from '../spoti-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  loginForm: FormGroup;
  scopes : string[] = ["user-read-private", "user-read-email", "playlist-read-private", "playlist-read-collaborative", "user-read-playback-state", "user-modify-playback-state", "user-read-currently-playing", "user-library-read", "user-library-modify", "user-read-recently-played", "user-top-read", "app-remote-control", "streaming"];

  isLoading = false;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';
  userSignature?: string; // firma del usuario en base64

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router, private spotiService: SpotiService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.feedbackMessage = '';
    this.feedbackType = '';

    const { email, password } = this.loginForm.value;

    this.userService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.feedbackType = 'success';
        this.feedbackMessage = '¡Bienvenido! Redirigiendo...';

        // store client id in the shared SpotiService and sessionStorage
        //this.spotiService.clientId = response.client_id;
        //sessionStorage.setItem('mustPay', response.mustPay);
        sessionStorage.setItem('clientId', response.client_id);
        sessionStorage.setItem('userToken', response.user_token);
        // guardar firma del usuario si viene en la respuesta
        if (response.signature) {
          this.userSignature = response.signature;
        }

        if (sessionStorage.getItem('accessToken')) {
          // si ya tenemos token de acceso, redirigir a la app directamente
          this.router.navigate(['/playlist-and-devices']);
          return;
        }
        this.getToken(); // redirigir a Spotify para autorización si no hay token de acceso
      },
      error: (error) => {
        this.isLoading = false;
        this.feedbackType = 'error';
        
        // Distinguir entre error de conexión y error de credenciales
        const status = error.status;
        
        if (status === 0) {
          // Error de red - servidor no disponible
          this.feedbackMessage = 'No se puede conectar con el servidor. Verifica tu conexión a internet o intenta más tarde.';
        } else if (status === 401) {
          // Credenciales inválidas
          this.feedbackMessage = 'Email o contraseña inválidos';
        } else if (status === 403) {
          // Usuario no verificado
          this.feedbackMessage = 'Tu cuenta no ha sido verificada. Revisa tu correo para el enlace de verificación.'; 
        } else if (status === 500) {
          this.feedbackMessage = 'Error del servidor. Por favor intenta de nuevo más tarde.';
        } else {
          this.feedbackMessage = error.error?.message || 'Error al iniciar sesión. Por favor intenta de nuevo.';
        }
      }
    });
  }
  private getToken() {
    
    let state = this.generateString()

    let params = 'response_type=code';
    params += `&client_id=${sessionStorage.getItem('clientId')}`;
    params += `&scope=${encodeURIComponent(this.scopes.join(' '))}`;
    params += `&redirect_uri=${this.spotiService.redirectUri}`;
    params += `&state=${state}`;

    sessionStorage.setItem("oauth_state", state);
    let url = this.spotiService.spoti_authUrl + '?' + params;
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
