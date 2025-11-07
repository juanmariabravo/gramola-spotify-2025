import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../user-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recover-password.html',
  styleUrls: ['./recover-password.css']
})
export class RecoverPassword {
  recoverForm: FormGroup;
  isLoading = false;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.recoverForm.invalid) {
      this.recoverForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.feedbackMessage = '';
    this.feedbackType = '';

    const { email } = this.recoverForm.value;

    this.userService.recoverPassword(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.feedbackType = 'success';
        this.feedbackMessage = 'Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada.';
        
        // Limpiar formulario
        this.recoverForm.reset();
        
        // Redirigir a login tras 5 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },
      error: (error) => {
        this.isLoading = false;
        this.feedbackType = 'error';
        this.feedbackMessage = error?.error?.message || 'No se pudo enviar el correo de recuperación. Por favor verifica que el email sea correcto.';
        console.error('Recovery error:', error);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
