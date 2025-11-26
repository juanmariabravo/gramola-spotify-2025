import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpotiService } from '../spoti-service';
import { UserService } from '../user-service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Navbar } from '../navbar/navbar';

interface Device {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

interface Playlist {
  id: string;
  name: string;
  images?: { url: string }[];
}

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

  constructor(private spotiService: SpotiService, private userService: UserService, private router: Router) { }

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
      error: (err) => {
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
      error: (err) => {
        this.deviceError = err?.message || 'No se pudieron cargar los dispositivos';
      }
    });

    // cargar playlists del usuario
    this.spotiService.getPlaylists().subscribe({
      next: (res) => {
        this.myPlaylists = res.items || [];
        this.loading = false;
      },
      error: (err) => {
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
        error: () => {}
      });
      },
      error: (err) => {
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

  getDeviceIcon(type: string): string {
    const icons: { [key: string]: string } = {
      computer: '💻',
      smartphone: '📱',
      tablet: '📟',
      speaker: '🔊',
      tv: '📺'
    };
    return icons[type.toLowerCase()] || '📱';
  }

  // Filtrar playlists según la búsqueda
  filteredPlaylists(): Playlist[] {
    const query = (this.playlistSearchQuery || '').trim().toLowerCase();
    if (!query) {
      // si no hay búsqueda, mostrar solo las playlists del usuario
      return this.myPlaylists;
    }
    // combinar: primero las del usuario que coincidan, luego las públicas encontradas
    const myFiltered = this.myPlaylists.filter(p => p.name.toLowerCase().includes(query));
    // evitar duplicados (por si una playlist pública ya está en myPlaylists)
    // filtrar elementos nulos/sin id antes de comparar para evitar "Cannot read properties of null"
    const publicFiltered = this.searchedPlaylists
      .filter(sp => sp && sp.id) // validar que sp existe y tiene id
      .filter(sp => !this.myPlaylists.some(mp => mp && mp.id === sp.id));
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

  confirmSelection() {
    // validar que haya seleccionado al menos un dispositivo
    if (!this.selectedDeviceId) {
      alert('Por favor selecciona un dispositivo de reproducción');
      return;
    }
    // validar precio
    // Permitir precio 0 (gratis) o dentro del rango 10-500 céntimos
    if (this.songPrice < 0 || this.songPrice > this.maxPrice) {
      alert(`El precio por canción debe estar entre 0€ (gratis) y ${this.maxPrice / 100}€`);
      return;
    }
    // opcional: validar playlist (permitir continuar sin playlist)
    if (!this.selectedPlaylistId) {
      const proceed = confirm('No has seleccionado una playlist por defecto. Se reanudará la reproducción actual. ¿Continuar?');
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
        const proceed = confirm('No se pudo guardar el precio en la base de datos. ¿Deseas continuar de todas formas?');
        if (proceed) {
          this.proceedWithPlayback();
        }
      }
    });
  }

  private proceedWithPlayback() {
    // guardar selección en sessionStorage
    sessionStorage.setItem('defaultDeviceId', this.selectedDeviceId!);
    if (this.selectedPlaylistId) {
      sessionStorage.setItem('defaultPlaylistId', this.selectedPlaylistId);
    }

    // construir playlistUri si se seleccionó una playlist (formato: spotify:playlist:ID)
    const playlistUri = this.selectedPlaylistId ? `spotify:playlist:${this.selectedPlaylistId}` : undefined;

    // iniciar reproducción en el dispositivo seleccionado
    this.spotiService.startPlayback(this.selectedDeviceId!, playlistUri).subscribe({
      next: () => {
        // redirigir a /music tras iniciar reproducción
        this.router.navigate(['/music']);
      },
      error: (err) => {
        console.warn('No se pudo iniciar la reproducción:', err);
        // informar al usuario pero permitir continuar (puede que la reproducción ya estuviera activa)
        const msg = err?.error?.error?.message || err?.message || 'Error al iniciar reproducción';
        alert(`Aviso: ${msg}\nPuedes continuar pero verifica que el dispositivo esté disponible.`);
        // redirigir de todas formas
        this.router.navigate(['/music']);
      }
    });
  }
}
