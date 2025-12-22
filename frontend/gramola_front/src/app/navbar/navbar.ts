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
    this.router.navigate(['/account']);
  }

  navigateToMusic() {
    this.router.navigate(['/music']);
  }

  navigateToPlaylistAndDevices() {
    this.router.navigate(['/playlist-and-devices']);
  }

  navigateToGramola() {
    this.router.navigate(['/music']);
  }

  logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    // Limpiar sessionStorage inmediatamente
      sessionStorage.clear();

      // Navegar inmediatamente a /home
      this.router.navigate(['/']);

      // Enviar petición al backend en segundo plano para invalidar cookie
      setTimeout(() => {
        this.userService.logout().subscribe({
          error: (err) => console.warn('Error en logout backend (ignorable):', err)
        });
      }, 10);
    }
  }
}
