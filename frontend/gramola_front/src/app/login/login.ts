import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { UserService } from '../user-service';
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
  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.log('Form invalid');
      return;
    }

    const { email, password } = this.loginForm.value;
    console.log('Login form submitted');
    console.log('Email:', email);
    console.log('Password:', password);

    this.userService.login(email, password).subscribe({
      next: (res) => {
        console.log('Login success', res);
        // if backend returns token, store it
        if (res?.token) {
          localStorage.setItem('auth_token', res.token);
        }
        // navigate to home or dashboard
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        console.error('Login error', err);
        // TODO: show user-facing error message
      }
    });
  }
}
