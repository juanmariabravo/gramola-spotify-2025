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
        this.feedbackMessage = 'Si tu email existe en nuestra base de datos, se te enviará un correo de recuperación.';
        
        // Limpiar formulario
        this.recoverForm.reset();
        
        // Redirigir a login tras 5 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },
      error: (error) => {
        this.isLoading = false;
        const status = error.status;
        
        if (status === 0) {
          // Error de red - servidor no disponible
          this.feedbackType = 'error';
          this.feedbackMessage = 'No se puede conectar con el servidor. Verifica tu conexión a internet o intenta más tarde.';
        } else if (status === 500) {
          this.feedbackType = 'error';
          this.feedbackMessage = 'Error del servidor. Por favor intenta de nuevo más tarde.';
        } else {
          // Por seguridad, mostramos el mismo mensaje para otros errores
          this.feedbackType = 'success'; // Mostramos como éxito visualmente
          this.feedbackMessage = 'Si tu email existe en nuestra base de datos, se te enviará un correo de recuperación.';
          this.recoverForm.reset();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 5000);
        }
        console.error('Recovery error (hidden from user):', error);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
