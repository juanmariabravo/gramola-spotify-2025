import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  constructor(private fb: FormBuilder, private service : UserService, private router: Router) {
    this.registerForm = this.fb.group({
      barName: [''],
      email: ['', [Validators.required, Validators.email]],
      pwd1: ['', [Validators.required, Validators.minLength(8)]],
      pwd2: ['', [Validators.required, Validators.minLength(8)]],
      clientId: [''],
      clientSecret: ['']
    });
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
    this.ctx?.fillRect(0, 0, canvas.width, canvas.height);
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
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Validar que haya firma
    if (!this.hasSignature) {
      alert('Por favor firma en el recuadro antes de registrarte');
      return;
    }

    // Capturar firma
    const signature = this.captureSignature();

    this.barName = this.registerForm.value.barName;
    this.email = this.registerForm.value.email;
    this.pwd1 = this.registerForm.value.pwd1;
    this.pwd2 = this.registerForm.value.pwd2;
    this.clientId = this.registerForm.value.clientId;
    this.clientSecret = this.registerForm.value.clientSecret;

    this.service.register(this.barName!, this.email!, this.pwd1!, this.pwd2!, this.clientId!, this.clientSecret!, signature!).subscribe(
      ok => {
        console.log('Registro exitoso', ok);
        this.registroExitoso = true;
        this.registerForm.reset();
        this.clearSignature();
      },
      error => {
        console.error('Error en el registro', error);
        this.registroExitoso = false;
      }
    );
  }

  toggleHelpModal() {
    this.showHelpModal = !this.showHelpModal;
  }

  closeHelpModal() {
    this.showHelpModal = false;
  }
}
