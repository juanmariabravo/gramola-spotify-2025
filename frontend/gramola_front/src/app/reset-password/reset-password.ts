import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user-service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword implements OnInit {
  resetForm: FormGroup;
  email?: string;
  token?: string;
  isLoading = false;
  isValidatingToken = true;
  tokenValid = false;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    // Leer email y token de query params
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      this.token = params['token'];

      if (!this.email || !this.token) {
        this.feedbackType = 'error';
        this.feedbackMessage = 'Enlace de recuperación inválido. Por favor solicita uno nuevo.';
        this.isValidatingToken = false;
        return;
      }

      // Validar token con el backend
      this.validateToken();
    });
  }

  validateToken() {
    this.userService.validateResetToken(this.email!, this.token!).subscribe({
      next: (response) => {
        this.isValidatingToken = false;
        this.tokenValid = true;
      },
      error: (error) => {
        this.isValidatingToken = false;
        this.tokenValid = false;
        this.feedbackType = 'error';
        this.feedbackMessage = error?.error?.message || 'El enlace de recuperación ha expirado o no es válido. Por favor solicita uno nuevo.';
      }
    });
  }

  passwordsMatch(): boolean {
    const pwd = this.resetForm.get('password')?.value;
    const confirm = this.resetForm.get('confirmPassword')?.value;
    return pwd === confirm;
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    if (!this.passwordsMatch()) {
      this.feedbackType = 'error';
      this.feedbackMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;
    this.feedbackMessage = '';
    this.feedbackType = '';

    const { password } = this.resetForm.value;

    this.userService.resetPassword(this.email!, this.token!, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.feedbackType = 'success';
        this.feedbackMessage = '¡Contraseña restablecida con éxito! Redirigiendo al inicio de sesión...';
        
        // Limpiar formulario
        this.resetForm.reset();
        
        // Redirigir a login tras 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.feedbackType = 'error';
        this.feedbackMessage = error?.error?.message || 'No se pudo restablecer la contraseña. Por favor intenta de nuevo.';
        console.error('Reset password error:', error);
      }
    });
  }

  goToRecover() {
    this.router.navigate(['/recover-password']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
