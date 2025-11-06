import { Component } from '@angular/core';
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
export class Register {
  registerForm: FormGroup;

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

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.barName = this.registerForm.value.barName;
    this.email = this.registerForm.value.email;
    this.pwd1 = this.registerForm.value.pwd1;
    this.pwd2 = this.registerForm.value.pwd2;
    this.clientId = this.registerForm.value.clientId;
    this.clientSecret = this.registerForm.value.clientSecret;

    this.service.register(this.barName!, this.email!, this.pwd1!, this.pwd2!, this.clientId!, this.clientSecret!).subscribe(
      ok => {
        console.log('Registro exitoso', ok);
        this.registroExitoso = true;
        this.registerForm.reset();
      },
      error => {
        console.error('Error en el registro', error);
        this.registroExitoso = false;
      }
    );
  }
}
