import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  barName: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.barName = sessionStorage.getItem('barName') || 'Mi Gramola';
  }

  navigateToAccount() {
    // Redirigir a página de cuenta (por implementar)
    this.router.navigate(['/account']);
  }

  logout() {
    const confirmLogout = confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmLogout) {
      // Limpiar sessionStorage
      sessionStorage.clear();
      // Redirigir a home
      this.router.navigate(['/']);
    }
  }
}
