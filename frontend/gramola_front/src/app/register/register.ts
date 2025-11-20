import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../user-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements AfterViewInit {
  registerForm: FormGroup;
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx?: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  signatureDataUrl?: string;
  hasSignature = false;
  showHelpModal = false;

  barName? : string
  email? : string
  pwd1? : string
  pwd2? : string
  clientId? : string
  clientSecret? : string
  
  registroExitoso? : boolean
  errorMessage?: string;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private service : UserService, private router: Router) {
    this.registerForm = this.fb.group({
      barName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pwd1: ['', [Validators.required, Validators.minLength(8)]],
      pwd2: ['', [Validators.required]],
      clientId: ['', Validators.required],
      clientSecret: ['', Validators.required]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  // Validador personalizado para verificar que las contraseñas coincidan
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pwd1 = control.get('pwd1');
    const pwd2 = control.get('pwd2');

    if (!pwd1 || !pwd2) {
      return null;
    }

    if (pwd2.value === '') {
      return null;
    }

    return pwd1.value === pwd2.value ? null : { passwordsMismatch: true };
  }

  ngAfterViewInit() {
    this.initCanvas();
  }

  initCanvas() {
    const canvas = this.signatureCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Configurar canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    
    // Configurar estilo de dibujo
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Fondo blanco
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Event listeners para mouse
    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    
    // Event listeners para touch (móvil)
    canvas.addEventListener('touchstart', this.handleTouch.bind(this));
    canvas.addEventListener('touchmove', this.handleTouch.bind(this));
    canvas.addEventListener('touchend', this.stopDrawing.bind(this));
  }

  startDrawing(e: MouseEvent) {
    this.isDrawing = true;
    const rect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
  }

  draw(e: MouseEvent) {
    if (!this.isDrawing || !this.ctx) return;
    
    const rect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    
    this.lastX = x;
    this.lastY = y;
    this.hasSignature = true;
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  handleTouch(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    
    if (e.type === 'touchstart') {
      this.isDrawing = true;
      this.lastX = touch.clientX - rect.left;
      this.lastY = touch.clientY - rect.top;
    } else if (e.type === 'touchmove' && this.isDrawing && this.ctx) {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      
      this.lastX = x;
      this.lastY = y;
      this.hasSignature = true;
    }
  }

  clearSignature() {
    const canvas = this.signatureCanvas.nativeElement;
    if (this.ctx) {
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    this.hasSignature = false;
    this.signatureDataUrl = undefined;
  }

  captureSignature() {
    if (!this.hasSignature) {
      return undefined;
    }
    // Convertir canvas a base64
    this.signatureDataUrl = this.signatureCanvas.nativeElement.toDataURL('image/png');
    return this.signatureDataUrl;
  }

  onSubmit() {
    // Reset estados
    this.registroExitoso = undefined;
    this.errorMessage = undefined;

    // Validar firma
    if (!this.hasSignature) {
      this.errorMessage = 'Por favor firma en el recuadro antes de registrarte';
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      
      // Mensaje específico según el error
      if (this.registerForm.hasError('passwordsMismatch')) {
        this.errorMessage = 'Las contraseñas no coinciden';
      } else {
        this.errorMessage = 'Por favor completa todos los campos correctamente';
      }
      return;
    }

    // Capturar firma
    const signature = this.captureSignature();
    if (!signature) {
      this.errorMessage = 'Error al capturar la firma. Por favor intenta de nuevo';
      return;
    }

    this.barName = this.registerForm.value.barName;
    this.email = this.registerForm.value.email;
    this.pwd1 = this.registerForm.value.pwd1;
    this.pwd2 = this.registerForm.value.pwd2;
    this.clientId = this.registerForm.value.clientId;
    this.clientSecret = this.registerForm.value.clientSecret;

    this.isSubmitting = true;

    this.service.register(this.barName!, this.email!, this.pwd1!, this.pwd2!, this.clientId!, this.clientSecret!, signature).subscribe({
      next: (response) => {
        console.log('Registro exitoso', response);
        this.isSubmitting = false;
        this.registroExitoso = true;
        this.errorMessage = undefined;
        this.registerForm.reset();
        this.clearSignature();
      },
      error: (error) => {
        console.error('Error en el registro', error);
        this.isSubmitting = false;
        this.registroExitoso = false;
        
        // Extraer mensaje de error específico del backend
        const status = error.status;
        const message = error.error?.message || error.message || '';
        
        if (status === 400) {
          // Bad Request - Faltan parámetros
          this.errorMessage = 'Faltan parámetros obligatorios. Por favor completa todos los campos.';
        } else if (status === 406) {
          // Not Acceptable - Validaciones específicas
          if (message.includes('contraseñas no coinciden')) {
            this.errorMessage = 'Las contraseñas no coinciden. Por favor verifica e intenta de nuevo.';
          } else if (message.includes('al menos 8 caracteres')) {
            this.errorMessage = 'La contraseña debe tener al menos 8 caracteres.';
          } else if (message.includes('Email inválido')) {
            this.errorMessage = 'El formato del correo electrónico no es válido. Debe contener "@" y un dominio válido.';
          } else {
            this.errorMessage = message;
          }
        } else if (status === 409) {
          // Conflict - Email ya registrado
          this.errorMessage = 'El correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo.';
        } else if (status === 500) {
          this.errorMessage = 'Error del servidor. Por favor intenta de nuevo más tarde.';
        } else if (status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
        } else {
          this.errorMessage = message || 'Error desconocido en el registro. Por favor intenta de nuevo.';
        }
      }
    });
  }

  toggleHelpModal() {
    this.showHelpModal = !this.showHelpModal;
  }

  closeHelpModal() {
    this.showHelpModal = false;
  }

  // Método helper para verificar si las contraseñas coinciden (para el template)
  get passwordsMatch(): boolean {
    const pwd1 = this.registerForm.get('pwd1')?.value;
    const pwd2 = this.registerForm.get('pwd2')?.value;
    return pwd1 === pwd2;
  }
}
