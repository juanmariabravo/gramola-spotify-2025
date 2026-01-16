import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpotiService } from '../spoti-service';
import { UserService } from '../user-service';
import { DialogService } from '../dialog.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Navbar } from '../navbar/navbar';
import { Device } from '../model/Device';
import { Playlist } from '../model/Playlist';

@Component({
  selector: 'app-playlist-and-devices',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './playlist-and-devices.html',
  styleUrls: ['./playlist-and-devices.css']
})
export class PlaylistAndDevices implements OnInit {
  devices: Device[] = [];
  myPlaylists: Playlist[] = [];
  searchedPlaylists: Playlist[] = [];
  selectedDeviceId?: string;
  selectedPlaylistId?: string;
  playlistSearchQuery: string = '';
  private searchSubject = new Subject<string>();
  songPrice: number = 50; // precio por canción en céntimos (0.50€ por defecto)
  minPrice = 0;    // 0.00€ (gratis)
  maxPrice = 500;  // 5.00€
  userSignature?: string; // firma del usuario en base64
  barName?: string; // nombre del bar
  showAllPlaylists = false; // controlar si mostrar todas las playlists

  deviceError?: string;
  playlistError?: string;
  loading = true;

  constructor(private spotiService: SpotiService, private userService: UserService, private router: Router, private dialogService: DialogService) { }

  async handleSpotifyAuthError(error: any): Promise<void> {
    const status = error.status;
    if (status === 401) {
      sessionStorage.clear();
      await this.dialogService.alert(
        'Tu sesión de Spotify ha expirado. Por favor, vuelve a iniciar sesión.',
        'Sesión expirada'
      );
      window.location.href = '/login';
      return;
    }
  }

  ngOnInit(): void {
    // lo primero, si no hay accessToken, redirigir a login
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      // Redirigir a la página de login
      window.location.href = '/login';
      return;
    }

    // Cargar el precio actual del usuario desde la BD
    this.userService.getCurrentUser().subscribe({
      next: (userData) => {
        this.songPrice = Number(userData.songPrice || '50');
        this.barName = userData.barName;
        this.userSignature = userData.signature;
      },
      error: (err) => {
        console.error('Error al cargar datos del usuario:', err);
        const status = err.status;
        const errorMessage = err.error?.message || '';

        if (status === 0) {
          // Error de CORS o servidor no disponible
          console.error('Error de CORS: El servidor backend no está configurado correctamente para permitir peticiones desde el frontend. Verifica la configuración CORS del backend.');
        } else if (status === 401) {
          // Sesión expirada
          this.dialogService.alert(
            'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
            'Sesión expirada'
          ).then(() => {
            this.router.navigate(['/login']);
          });
          return;
        } else if (status === 500 && (errorMessage.includes('No autenticado') || errorMessage.includes('cookie inválida'))) {
          // Error de autenticación en el backend
          this.dialogService.alert(
            'Tu sesión no es válida. Por favor, inicia sesión de nuevo.',
            'Error de autenticación'
          ).then(() => {
            sessionStorage.clear();
            this.router.navigate(['/login']);
          });
          return;
        }

        // Usar valor por defecto si falla
        this.songPrice = 50;
      }
    });

    this.loadDevicesAndPlaylists();
    // suscribirse a cambios en la búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        const trimmed = (query || '').trim();
        if (!trimmed) {
          // limpiar resultados de búsqueda pública
          this.searchedPlaylists = [];
          return [];
        }
        return this.spotiService.searchPlaylists(trimmed);
      })
    ).subscribe({
      next: (res: any) => {
        if (res && res.playlists && res.playlists.items) {
          this.searchedPlaylists = res.playlists.items;
        } else {
          this.searchedPlaylists = [];
        }
      },
      error: async (err) => {
        if (err.status === 401) {
          await this.handleSpotifyAuthError(err);
          return;
        }
        this.playlistError = err?.message || 'Error al buscar playlists públicas';
        this.searchedPlaylists = [];
      }
    });
  }

  loadDevicesAndPlaylists() {
    this.loading = true;
    this.deviceError = undefined;
    this.playlistError = undefined;

    // cargar dispositivos
    this.spotiService.getDevices().subscribe({
      next: (res) => {
        this.devices = res.devices || [];
        const active = this.devices.find(d => d.is_active);
        if (active) {
          this.selectedDeviceId = active.id;
        }
      },
      error: async (err) => {
        if (err.status === 401) {
          await this.handleSpotifyAuthError(err);
          return;
        }
        this.deviceError = err?.message || 'No se pudieron cargar los dispositivos';
      }
    });

    // cargar playlists del usuario
    this.spotiService.getPlaylists().subscribe({
      next: (res) => {
        this.myPlaylists = res.items || [];
        this.loading = false;
      },
      error: async (err) => {
        if (err.status === 401) {
          await this.handleSpotifyAuthError(err);
          return;
        }
        this.playlistError = err?.message || 'No se pudieron cargar las playlists';
        this.loading = false;
      }
    });
  }

  selectDevice(deviceId: string) {
    if (this.selectedDeviceId === deviceId) return;
    this.deviceError = undefined;

    this.spotiService.setCurrentDevice(deviceId).subscribe({
      next: () => {
      this.selectedDeviceId = deviceId;
      // actualizar lista de dispositivos para reflejar cambio
      this.spotiService.getDevices().subscribe({
        next: (res) => {
        this.devices = res.devices || [];
        },
        error: async (err) => {
          if (err.status === 401) {
            await this.handleSpotifyAuthError(err);
          }
        }
      });
      },
      error: async (err) => {
        if (err?.status === 401) {
          await this.handleSpotifyAuthError(err);
          return;
        }
        if (err?.status === 404) {
          this.deviceError = 'Dispositivo no encontrado. Asegúrate de que está encendido y tiene conexión.';
        } else {
          this.deviceError = err?.message || 'Error al seleccionar dispositivo';
        }
      }
    });
  }

  selectPlaylist(playlistId: string) {
    this.selectedPlaylistId = playlistId;
  }

  // Filtrar playlists según la búsqueda
  filteredPlaylists(): Playlist[] {
    const query = (this.playlistSearchQuery || '').trim().toLowerCase();
    if (!query) {
      // si no hay búsqueda, mostrar solo las playlists del usuario
      return this.myPlaylists;
    }
    // combinar: primero las del usuario que coincidan, luego las públicas encontradas
    const myFiltered = this.myPlaylists.filter(p => p.name?.toLowerCase().includes(query));
    // evitar duplicados (por si una playlist pública ya está en myPlaylists)
    const publicFiltered = this.searchedPlaylists
      .filter(sp => sp?.id) // validar que sp existe y tiene id
      .filter(sp => !this.myPlaylists.some(mp => mp?.id === sp.id));
    return [...myFiltered, ...publicFiltered];
  }

  // Obtener las playlists visibles (limitadas o todas según toggle)
  getVisiblePlaylists(): Playlist[] {
    const filtered = this.filteredPlaylists();
    // Si hay búsqueda activa o el usuario pidió ver todas, mostrar todas
    if (this.showAllPlaylists) {
      return filtered;
    }
    // Sino, limitar a 6 playlists
    return filtered.slice(0, 6);
  }

  // llamar cuando el usuario escribe en la barra de búsqueda
  onSearchChange(query: string) {
    this.playlistSearchQuery = query;
    this.searchSubject.next(query);
  }

  // Formatear el precio para mostrarlo al usuario
  getFormattedSongPrice(): string {
    return (this.songPrice / 100).toFixed(2);
  }

  // Permitir 0. El siguiente salto 50. Luego 60, 70, 80... (Stripe no permite precios inferiores a 50 céntimos)
  onPriceChange() {
    if (this.songPrice > 0 && this.songPrice < 50) {
      this.songPrice = 50;
    }
  }

  async confirmSelection() {
    // validar que haya seleccionado al menos un dispositivo
    if (!this.selectedDeviceId) {
      await this.dialogService.alert('Por favor, selecciona un dispositivo de reproducción', 'Dispositivo no seleccionado');
      return;
    }
    // validar precio
    // Permitir precio 0 (gratis) o dentro del rango 10-500 céntimos
    if (this.songPrice < 0 || this.songPrice > this.maxPrice) {
      await this.dialogService.alert(`El precio por canción debe estar entre 0€ (gratis) y ${this.maxPrice / 100}€`, 'Precio inválido');
      return;
    }
    // opcional: validar playlist (permitir continuar sin playlist)
    if (!this.selectedPlaylistId) {
      const proceed = await this.dialogService.confirm('No has seleccionado una playlist por defecto. Se reanudará la reproducción actual. ¿Continuar?', 'Continuar sin playlist');
      if (!proceed) return;
    }

    // Primero guardar el precio en la base de datos
    this.userService.updateSongPrice(this.songPrice).subscribe({
      next: () => {
        // Precio guardado exitosamente, continuar con la configuración
        this.proceedWithPlayback();
      },
      error: (err) => {
        console.error('Error al guardar el precio:', err);
        this.dialogService.confirm('No se pudo guardar el precio en la base de datos. ¿Deseas continuar de todas formas?', 'Error al guardar precio').then((proceed) => {
          if (proceed) {
            this.proceedWithPlayback();
          }
        });
      }
    });
  }

  private proceedWithPlayback() {
    // construir playlistUri si se seleccionó una playlist (formato: spotify:playlist:ID)
    const playlistUri = this.selectedPlaylistId ? `spotify:playlist:${this.selectedPlaylistId}` : undefined;

    // iniciar reproducción en el dispositivo seleccionado
    this.spotiService.startPlayback(this.selectedDeviceId!, playlistUri).subscribe({
      next: () => {
        // redirigir a /music tras iniciar reproducción
        this.router.navigate(['/music']);
      },
      error: async (err) => {
        if (err?.status === 401) {
          await this.handleSpotifyAuthError(err);
          return;
        }
        // informar al usuario pero permitir continuar (puede que la reproducción ya estuviera activa)
        const msg = err?.error?.error?.message || err?.message || 'Error al iniciar reproducción';
        this.dialogService.alert(msg, 'Error al iniciar reproducción');
        // redirigir de todas formas
        this.router.navigate(['/music']);
      }
    });
  }
}
