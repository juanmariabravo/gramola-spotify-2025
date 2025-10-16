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


  constructor(private fb: FormBuilder, private userService: UserService, private router: Router, private spotiService: SpotiService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.log('Form invalid');
      return;
    }

    const { email, password } = this.loginForm.value;

    this.userService.login(email, password).subscribe({
      next: (response) => {
        // store client id in the shared SpotiService and sessionStorage
        //this.spotiService.clientId = response.client_id;
        //sessionStorage.setItem('mustPay', response.mustPay);
        sessionStorage.setItem('clientId', response.client_id);
        this.getToken();
      },
      error: (error) => {
        console.error('Login error:', error);
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
