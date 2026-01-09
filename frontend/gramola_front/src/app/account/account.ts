import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user-service';
import { DialogService } from '../dialog.service';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar],
  templateUrl: './account.html',
  styleUrls: ['./account.css']
})
export class Account implements OnInit {
  barNameForm: FormGroup;
  songPriceForm: FormGroup;
  passwordForm: FormGroup;
  
  barName: string = '';
  email: string = '';
  clientId: string = '';
  currentSignature?: string;
  currentSongPrice: number = 50;
  
  showPasswordSection = false;
  showBarNameSection = false;
  showPriceSection = false;
  
  isSubmittingBarName = false;
  isSubmittingPrice = false;
  isSubmittingPassword = false;
  isDeletingAccount = false;
  
  barNameSuccess?: boolean;
  barNameError?: string;
  priceSuccess?: boolean;
  priceError?: string;
  passwordSuccess?: boolean;
  passwordError?: string;
  deleteAccountError?: string;

  minPrice = 0;
  maxPrice = 500;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialogService: DialogService,
    private router: Router
  ) {
    this.barNameForm = this.fb.group({
      barName: ['', Validators.required]
    });

    this.songPriceForm = this.fb.group({
      songPrice: [50, [Validators.required, Validators.min(0), Validators.max(500)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  ngOnInit(): void {
    // Verificar autenticación
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar datos del usuario
    this.loadUserData();
  }

  loadUserData() {
    this.userService.getCurrentUser().subscribe({
      next: (userData) => {
        this.email = userData.email;
        this.barName = userData.barName || '';
        this.clientId = userData.clientId || '';
        this.currentSignature = userData.signature || undefined;
        this.currentSongPrice = Number(userData.songPrice || '50');

        // Prellenar formularios
        this.barNameForm.patchValue({
          barName: this.barName
        });

        this.songPriceForm.patchValue({
          songPrice: this.currentSongPrice
        });
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
        const status = error.status;
        const errorMessage = error.error?.message || '';
        
        if (status === 401) {
          // Sesión expirada, redirigir al login
          this.dialogService.alert(
            'Tu sesión ha expirado. Por favor inicia sesión de nuevo.',
            'Sesión expirada'
          ).then(() => {
            this.router.navigate(['/login']);
          });
        } else if (status === 500 && (errorMessage.includes('No autenticado') || errorMessage.includes('cookie inválida'))) {
          // Error de autenticación en el backend
          this.dialogService.alert(
            'Tu sesión no es válida. Por favor inicia sesión de nuevo.',
            'Error de autenticación'
          ).then(() => {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            this.router.navigate(['/login']);
          });
        } else if (status === 0) {
          // Error de conexión
          this.dialogService.alert(
            'No se puede conectar con el servidor. Verifica tu conexión a internet.',
            'Error de conexión'
          );
        }
      }
    });
  }

  passwordsMatchValidator(control: any) {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    if (confirmPassword.value === '') {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordsMismatch: true };
  }

  toggleBarNameSection() {
    this.showBarNameSection = !this.showBarNameSection;
    if (this.showBarNameSection) {
      this.barNameForm.patchValue({ barName: this.barName });
      this.barNameSuccess = undefined;
      this.barNameError = undefined;
    }
  }

  togglePriceSection() {
    this.showPriceSection = !this.showPriceSection;
    if (this.showPriceSection) {
      this.songPriceForm.patchValue({ songPrice: this.currentSongPrice });
      this.priceSuccess = undefined;
      this.priceError = undefined;
    }
  }

  togglePasswordSection() {
    this.showPasswordSection = !this.showPasswordSection;
    if (this.showPasswordSection) {
      this.passwordForm.reset();
      this.passwordSuccess = undefined;
      this.passwordError = undefined;
    }
  }

  onSubmitBarName() {
    this.barNameSuccess = undefined;
    this.barNameError = undefined;

    if (this.barNameForm.invalid) {
      this.barNameForm.markAllAsTouched();
      this.barNameError = 'Por favor introduce un nombre válido para el bar';
      return;
    }

    const newBarName = this.barNameForm.value.barName;
    
    if (newBarName === this.barName) {
      this.barNameError = 'El nombre es el mismo que el actual';
      return;
    }

    this.isSubmittingBarName = true;

    this.userService.updateBarName(newBarName).subscribe({
      next: (response) => {
        this.isSubmittingBarName = false;
        this.barNameSuccess = true;
        
        // Actualizar variable local
        this.barName = newBarName;
        
        setTimeout(() => {
          this.showBarNameSection = false;
          this.barNameSuccess = undefined;
        }, 3000);
      },
      error: (error) => {
        this.isSubmittingBarName = false;
        this.barNameSuccess = false;
        
        const status = error.status;
        const message = error.error?.message || error.message || '';
        
        if (status === 0) {
          this.barNameError = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
        } else if (status === 404) {
          this.barNameError = 'Usuario no encontrado';
        } else if (status === 400) {
          this.barNameError = 'Nombre de bar inválido';
        } else if (status === 500) {
          this.barNameError = 'Error del servidor. Por favor intenta de nuevo más tarde.';
        } else {
          this.barNameError = message || 'Error al actualizar el nombre del bar';
        }
      }
    });
  }

  onSubmitSongPrice() {
    this.priceSuccess = undefined;
    this.priceError = undefined;

    if (this.songPriceForm.invalid) {
      this.songPriceForm.markAllAsTouched();
      this.priceError = 'Por favor introduce un precio válido';
      return;
    }

    const newPrice = this.songPriceForm.value.songPrice;
    
    if (newPrice === this.currentSongPrice) {
      this.priceError = 'El precio es el mismo que el actual';
      return;
    }

    if (newPrice < this.minPrice || newPrice > this.maxPrice) {
      this.priceError = `El precio debe estar entre ${this.minPrice / 100}€ y ${this.maxPrice / 100}€`;
      return;
    }

    this.isSubmittingPrice = true;

    this.userService.updateSongPrice(newPrice).subscribe({
      next: (response) => {
        this.isSubmittingPrice = false;
        this.priceSuccess = true;
        
        // Actualizar variable local
        this.currentSongPrice = newPrice;
        
        setTimeout(() => {
          this.showPriceSection = false;
          this.priceSuccess = undefined;
        }, 3000);
      },
      error: (error) => {
        this.isSubmittingPrice = false;
        this.priceSuccess = false;
        
        const status = error.status;
        const message = error.error?.message || error.message || '';
        
        if (status === 0) {
          this.priceError = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
        } else if (status === 404) {
          this.priceError = 'Usuario no encontrado';
        } else if (status === 400 || status === 406) {
          this.priceError = 'Precio inválido. Debe estar entre 0€ y 5€';
        } else if (status === 500) {
          this.priceError = 'Error del servidor. Por favor intenta de nuevo más tarde.';
        } else {
          this.priceError = message || 'Error al actualizar el precio';
        }
      }
    });
  }

  onSubmitPassword() {
    this.passwordSuccess = undefined;
    this.passwordError = undefined;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      
      if (this.passwordForm.hasError('passwordsMismatch')) {
        this.passwordError = 'Las contraseñas nuevas no coinciden';
      } else {
        this.passwordError = 'Por favor completa todos los campos correctamente';
      }
      return;
    }

    this.isSubmittingPassword = true;

    const passwordData = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.userService.changePassword(passwordData).subscribe({
      next: (response) => {
        this.isSubmittingPassword = false;
        this.passwordSuccess = true;
        this.passwordForm.reset();
        
        setTimeout(() => {
          this.showPasswordSection = false;
          this.passwordSuccess = undefined;
        }, 3000);
      },
      error: (error) => {
        this.isSubmittingPassword = false;
        this.passwordSuccess = false;
        
        const status = error.status;
        const message = error.error?.message || error.message || '';
        
        if (status === 0) {
          this.passwordError = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
        } else if (status === 401) {
          this.passwordError = 'La contraseña actual es incorrecta';
        } else if (status === 406) {
          if (message.includes('8 caracteres')) {
            this.passwordError = 'La nueva contraseña debe tener al menos 8 caracteres';
          } else {
            this.passwordError = message;
          }
        } else if (status === 404) {
          this.passwordError = 'Usuario no encontrado';
        } else if (status === 500) {
          this.passwordError = 'Error del servidor. Por favor intenta de nuevo más tarde.';
        } else {
          this.passwordError = message || 'Error al cambiar la contraseña';
        }
      }
    });
  }

  getFormattedSongPrice(): string {
    return (this.songPriceForm.value.songPrice / 100).toFixed(2);
  }

  getFormattedCurrentPrice(): string {
    return (this.currentSongPrice / 100).toFixed(2);
  }

  goBack() {
    // Intentar volver a la página anterior, o a /music si no hay historial
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/music']);
    }
  }

  // Permitir 0. El siguiente salto 50. Luego 60, 70, 80... (Stripe no permite precios inferiores a 50 céntimos)
  onPriceChange() {
    if (this.songPriceForm.value.songPrice > 0 && this.songPriceForm.value.songPrice < 50) {
      this.songPriceForm.value.songPrice = 50;
    }
  }

  get passwordsMatch(): boolean {
    const newPwd = this.passwordForm.get('newPassword')?.value;
    const confirmPwd = this.passwordForm.get('confirmPassword')?.value;
    return newPwd === confirmPwd;
  }

  async onDeleteAccount() {
    this.deleteAccountError = undefined;

    try {
      // Mostrar diálogo de confirmación
      const confirmed = await this.dialogService.confirm(
        '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y perderás todos tus datos.',
        'Confirmar eliminación de cuenta'
      );

      if (!confirmed) {
        return;
      }

      this.isDeletingAccount = true;

      this.userService.deleteAccount().subscribe({
        next: () => {
          this.isDeletingAccount = false;

          // Limpiar todo el sessionStorage
          sessionStorage.clear();

          // Mostrar mensaje de éxito
          this.dialogService.alert(
            'Tu cuenta ha sido eliminada exitosamente.',
            'Cuenta eliminada'
          ).then(() => {
            // Redirigir al usuario a la página de registro
            this.router.navigate(['/register']);
          });
        },
        error: (error) => {
          this.isDeletingAccount = false;

          const status = error.status;
          const message = error.error?.message || error.message || '';

          if (status === 0) {
            this.deleteAccountError = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
          } else if (status === 401) {
            this.deleteAccountError = 'Sesión expirada. Por favor inicia sesión de nuevo.';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else if (status === 404) {
            this.deleteAccountError = 'Usuario no encontrado.';
          } else if (status === 500) {
            this.deleteAccountError = 'Error del servidor. Por favor intenta de nuevo más tarde.';
          } else {
            this.deleteAccountError = message || 'Error al eliminar la cuenta. Por favor intenta de nuevo.';
          }
        }
      });
    } catch (error) {
      console.error('Error al mostrar diálogo de confirmación:', error);
      this.deleteAccountError = 'Error al mostrar el diálogo de confirmación.';
    }
  }
}
