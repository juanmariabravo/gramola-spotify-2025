import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpotiService } from '../spoti-service';
import { Navbar } from '../navbar/navbar';
import { UserService } from '../user-service';

interface TrackObject {
  id?: string;
  name?: string;
  uri?: string;
  album?: { name: string; images: { url: string }[] };
  artists?: { name: string }[];
  // add other fields you use (artists, album, duration_ms, etc.)
}

interface PlayList {
  id?: string;
  name?: string;
  // add other playlist fields you need
}

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './music.html',
  styleUrls: ['./music.css']
})

export class Music implements OnInit, OnDestroy {

  devices: any[] = [];
  currentDevice: any;
  playlists : PlayList[] = [];
  queue : TrackObject[] = [];
  tracks : TrackObject[] = []; // resultados de búsqueda

  currentTrack? : TrackObject
  songPrice: number = 50; // precio por canción en céntimos (se leerá de la base de datos desde el backend)

  private queuePollIntervalId?: any; // para cola en tiempo real
  private currentPlaylistPollIntervalId?: any; // para actualización periódica de la reproducción actual

  deviceError? : string
  playlistError? : string
  currentPlaylistError? : string
  songError? : string
  barName: string = 'Mi Bar';
  searchQuery: string = '';

  // Propiedades para reconocimiento de voz
  isListening: boolean = false;
  voiceTranscript: string = '';
  private recognition: any;
  private voiceTimeout: any;

  constructor(private spotiService: SpotiService, private userService: UserService) { }

  ngOnInit(): void {

    // lo primero, si no hay accessToken, redirigir a login
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      // Redirigir a la página de login
      window.location.href = '/login';
      return;
    }
    // Leer nombre del bar llamando a userservice.getCurrentUser()
    this.userService.getCurrentUser().subscribe({
      next: (result) => {
        this.barName = result.barName;
        this.songPrice = result.songPrice; // leer precio por canción desde el backend
      },
      error: (err) => {
        console.error('Error al obtener el usuario actual:', err);
      }
    });
    
    
    this.getDevices()
    this.getPlaylists()
    this.getCurrentPlayList();
    // también actualizar la lista actual cada 8000 ms
    this.currentPlaylistPollIntervalId = setInterval(() => this.getCurrentPlayList(), 8000);
    // obtener cola real de Spotify y mantenerla actualizada (cada 8000 ms)
    this.getQueue();
    this.queuePollIntervalId = setInterval(() => this.getQueue(), 8000);
    // leer precio por canción desde sessionStorage o backend
    const storedPrice = sessionStorage.getItem('songPrice');
    if (storedPrice) {
      this.songPrice = Number(storedPrice);
    }

    // Listener para cerrar búsqueda con ESC
    document.addEventListener('keydown', this.handleEscapeKey.bind(this));

    // Inicializar Web Speech API
    this.initVoiceRecognition();
  }

  // para cola en tiempo real
  ngOnDestroy(): void {
    if (this.queuePollIntervalId) {
      clearInterval(this.queuePollIntervalId);
    }
    if (this.currentPlaylistPollIntervalId) {
      clearInterval(this.currentPlaylistPollIntervalId);
    }
    // Remover listener de ESC
    document.removeEventListener('keydown', this.handleEscapeKey.bind(this));

    // Detener reconocimiento de voz
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  handleEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.tracks.length > 0) {
      this.clearSearch();
    }
  }

  getDevices() {
    this.resetErrors()
    this.spotiService.getDevices().subscribe({
      next: (result) => {
        this.devices = result.devices;
        this.currentDevice = this.devices.find(d => d.is_active);
        if (!this.currentDevice)
          this.deviceError = "No hay ningún dispositivo conectado"
      },
      error: (err) => {
        this.deviceError = err.message;
      }
    });
  }

  // Selecciona un dispositivo (si es distinto del actual) y llama al backend de Spotify para transferir la reproducción
  selectDevice(device: any) {
    this.resetErrors();
    if (!device || !device.id) {
      this.deviceError = 'Dispositivo inválido';
      return;
    }
    // Si ya es el dispositivo activo, no hacer nada
    if (this.currentDevice && this.currentDevice.id === device.id) {
      return;
    }

    this.spotiService.setCurrentDevice(device.id).subscribe({
      next: () => {
        // Refrescar lista de dispositivos y marcar el seleccionado como activo
        // Spotify puede tardar en transferir; pedir de nuevo los dispositivos
        this.getDevices();
      },
      error: (err) => {
        this.deviceError = err?.message || 'Error al seleccionar el dispositivo';
      }
    });
  }

  getPlaylists() {
    this.resetErrors();
    this.spotiService.getPlaylists().subscribe({
      next: (result) => {
        this.playlists = result.items;
      },
      error: (err) => {
        this.playlistError = err.message;
      }
    });
  }

  getCurrentPlayList() {
    this.resetErrors();
    this.spotiService.getCurrentlyPlaying().subscribe({
      next: (result) => {
        if (result && result.item) {
          this.currentTrack = result.item;
        }
      },
      error: (err) => {
        this.currentPlaylistError = err.message;
      }
    });

  }

  resetErrors() {
    this.deviceError = undefined;
    this.playlistError = undefined;
    this.currentPlaylistError = undefined;
    this.songError = undefined;
  }

  // Métodos adicionales
  getArtists(track: TrackObject): string {
    return track.artists?.map(artist => artist.name).join(', ') || 'Artista desconocido';
  }

  getDeviceIcon(deviceType: string): string {
    const icons: { [key: string]: string } = {
      'computer': 'computer',
      'smartphone': 'smartphone',
      'tablet': 'tablet',
      'speaker': 'speaker',
      'tv': 'tv'
    };
    return icons[deviceType.toLowerCase()] || 'devices';
  }

  searchTracks() {
    if (!this.searchQuery.trim()) return;
    
    this.resetErrors();
    this.spotiService.searchTracks(this.searchQuery).subscribe({
      next: (result) => {
        this.tracks = result.tracks.items;
      },
      error: (err) => {
        this.songError = err.message;
      }
    });
  }

  clearSearch() {
    this.tracks = [];
    this.searchQuery = '';
    this.songError = undefined;
  }

  addToQueue(track: TrackObject) {
    this.resetErrors();
    if (this.songPrice <= 0) {
      // Si el precio es 0 o negativo, añadir directamente a la cola sin pago
      this.spotiService.addToQueue(track.uri || '').subscribe({
        next: () => {
          alert(`La canción "${track.name}" ha sido añadida a la cola.`);
          // Cerrar resultados de búsqueda
          this.clearSearch();
          this.getQueue();  // Actualizar la cola después de añadir
          
          // Notificar al backend (si la canción es gratis también queremos registrarlo)
          const userToken = sessionStorage.getItem('userToken') || '';
          if (track.id && userToken) {
            this.spotiService.notifySongAdded(track.id, userToken).subscribe({
              next: () => {
                //console.info('Backend notificado de canción gratis. TrackId:', track.id, 'User:', userToken);
              },
              error: (err) => {
                console.warn('No se pudo notificar al backend:', err);
              }
            });
          }
        },
        error: (err) => {
          this.songError = err.message || 'Error al añadir la canción a la cola';
        }
      });
    }
    else {
      // Confirmación de pago antes de proceder
      const priceFormatted = (this.songPrice / 100).toFixed(2);
      const proceed = confirm(`La canción "${track.name}" cuesta ${priceFormatted}€. ¿Deseas pagar ahora?`);
      if (!proceed) {
        return;
      }

    // Redirigir a la página de pagos con el importe (y opcionalmente la URI de la pista para uso posterior)
    const params = new URLSearchParams({
      token: sessionStorage.getItem('userToken') || '',
      amount: String(this.songPrice).padStart(4, '0'),
      trackUri: track.uri || ''
    });
    // usar location.href para forzar la navegación completa (la página de pagos procesa el pago)
    window.location.href = `http://127.0.0.1:4200/payments?${params.toString()}`;
  }
}

// Nuevo: solicita la cola real a Spotify y la asigna a this.queue
  getQueue() {
    this.resetErrors();
    try {
      this.spotiService.getQueue().subscribe({
        next: (res) => {
           // La respuesta de Spotify suele incluir una propiedad `queue` con los elementos.
           // Si no existe, dejar la cola vacía.
          const spotifyQueue = (res && (res.queue || res.items)) ? (res.queue || res.items) : [];
           // Mapear a TrackObject si es necesario (la estructura suele ser track o item.track)
          this.queue = spotifyQueue.map((qItem: any) => {
            const t = qItem.track ? qItem.track : qItem;
            return {
              id: t.id,
              name: t.name,
              uri: t.uri,
              album: t.album,
              artists: t.artists,
            } as TrackObject;
          });
        },
        error: (err) => {
          // No mostrar error intrusivo si 204 o similar; guardar mensaje para debugging
          this.songError = err?.message || 'No se pudo obtener la cola de Spotify';
        }
      });
    } catch (e: any) {
      this.songError = e?.message || String(e);
    }
  }
  

  clearQueue() {
    this.queue = [];
  }

  // Inicializar reconocimiento de voz
  initVoiceRecognition() {
    // Verificar compatibilidad del navegador
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Mostrar feedback al usuario en lugar de solo consola
      setTimeout(() => {
        alert('El reconocimiento de voz no está soportado en este navegador. Por favor, usa Chrome, Edge o Safari.');
      }, 100);
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'es-ES'; // Español
    this.recognition.continuous = true; // Reconocimiento continuo
    this.recognition.interimResults = true; // Resultados intermedios en tiempo real

    // Evento cuando se recibe un resultado
    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Actualizar transcripción en tiempo real
      this.voiceTranscript = interimTranscript || finalTranscript;
      this.searchQuery = (finalTranscript || interimTranscript).trim();

      // Si hay una transcripción final, realizar la búsqueda
      if (finalTranscript.trim()) {
        this.searchTracks();
      }
    };

    // Evento cuando termina el reconocimiento
    this.recognition.onend = () => {
      if (this.isListening) {
        // Reiniciar automáticamente si aún está en modo escucha
        this.recognition.start();
      }
    };

    // Evento de error
    this.recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        this.voiceTranscript = 'No se detectó voz. Intenta de nuevo.';
        setTimeout(() => this.voiceTranscript = '', 3000);
      } else if (event.error === 'not-allowed') {
        this.voiceTranscript = 'Permiso de micrófono denegado';
        this.isListening = false;
        alert('Permiso de micrófono denegado.\n\nPor favor, permite el acceso al micrófono en la configuración de tu navegador para usar esta función.');
      } else if (event.error === 'network') {
        this.voiceTranscript = 'Error de conexión';
        this.isListening = false;
        alert('Error de red. Verifica tu conexión a internet.');
      } else if (event.error === 'aborted') {
        this.voiceTranscript = 'Reconocimiento cancelado';
        this.isListening = false;
      } else {
        this.voiceTranscript = 'Error en el reconocimiento de voz';
        this.isListening = false;
        alert(`Error en el reconocimiento de voz: ${event.error}`);
      }
    };
  }

  // Alternar reconocimiento de voz
  toggleVoiceSearch() {
    if (!this.recognition) {
      alert('El reconocimiento de voz no está soportado en este navegador. Por favor, usa Chrome, Edge o Safari.');
      return;
    }

    if (this.isListening) {
      // Detener reconocimiento
      this.recognition.stop();
      this.isListening = false;
      this.voiceTranscript = '';

      // Limpiar timeout si existe
      if (this.voiceTimeout) {
        clearTimeout(this.voiceTimeout);
        this.voiceTimeout = null;
      }
    } else {
      // Iniciar reconocimiento
      this.voiceTranscript = '';
      this.recognition.start();
      this.isListening = true;

      // Establecer timeout de 8 segundos
      this.voiceTimeout = setTimeout(() => {
        if (this.isListening) {
          this.recognition.stop();
          this.isListening = false;
          // Si hay algo escrito, realizar la búsqueda
          if (this.searchQuery.trim()) {
            this.searchTracks();
          }
          this.voiceTranscript = '';
        }
      }, 8000);
    }
  }

}