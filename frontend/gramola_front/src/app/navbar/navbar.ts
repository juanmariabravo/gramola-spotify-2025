import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../user-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  barName: string = '';

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit(): void {
  }

  navigateToAccount() {
    // Redirigir a página de cuenta (por implementar)
    this.router.navigate(['/account']);
  }

  navigateToMusic() {
    // Redirigir a página de música (por implementar)
    this.router.navigate(['/music']);
  }

  logout() {
    const confirmLogout = confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmLogout) {
      // Limpiar sessionStorage
      sessionStorage.clear();
      // Enviar petición al backend para que elimine la cookie
      this.userService.logout().subscribe();
      // Redirigir a home
      this.router.navigate(['/']);
    }
  }
}
