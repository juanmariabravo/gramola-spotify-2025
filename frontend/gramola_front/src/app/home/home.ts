import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements AfterViewInit {
  @ViewChild('vinylWrapper', { static: false }) vinylWrapper?: ElementRef<HTMLDivElement>;
  private audioContext?: AudioContext;
  private isPlaying = false;
  private audioContextInitialized = false;
  private beatInterval?: any;
  private currentBeat = 0;

  ngAfterViewInit() {
    if (this.vinylWrapper) {
      const wrapper = this.vinylWrapper.nativeElement;
      
      // Añadir listeners para el efecto de hover
      wrapper.addEventListener('mouseenter', this.handleVinylHover.bind(this));
      wrapper.addEventListener('mouseleave', this.handleVinylLeave.bind(this));
    }
  }

  private handleVinylHover() {
    if (this.vinylWrapper) {
      const wrapper = this.vinylWrapper.nativeElement;
      wrapper.classList.add('vibrating');
      
      // Inicializar AudioContext en el primer hover si no está inicializado
      if (!this.audioContextInitialized) {
        this.initAudioContext();
      }
      
      // Iniciar ritmo continuo (beat cada 400ms = 150 BPM)
      this.startBeatLoop();
    }
  }

  private handleVinylLeave() {
    if (this.vinylWrapper) {
      const wrapper = this.vinylWrapper.nativeElement;
      wrapper.classList.remove('vibrating');
      this.stopBeatLoop();
    }
  }
  
  private initAudioContext() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Intentar resumir el contexto (requerido por navegadores modernos)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          this.audioContextInitialized = true;
        }).catch((error) => {
          // Silenciar error - es esperado en el primer hover antes de interacción del usuario
        });
      } else {
        this.audioContextInitialized = true;
      }
    } catch (error) {
      // Silenciar error de inicialización
    }
  }

  private startBeatLoop() {
    if (this.beatInterval) return; // ya está corriendo
    
    // Reproducir primer beat inmediatamente
    this.playBeat();
    
    // Continuar reproduciendo beats cada 400ms (150 BPM)
    this.beatInterval = setInterval(() => {
      this.playBeat();
    }, 400);
  }

  private stopBeatLoop() {
    if (this.beatInterval) {
      clearInterval(this.beatInterval);
      this.beatInterval = undefined;
      this.currentBeat = 0;
    }
  }

  private playBeat() {
    if (!this.audioContext || !this.audioContextInitialized) return;

    try {
      // Verificar que el contexto esté en estado 'running'
      const ctx = this.audioContext;
      
      // Verificar que el contexto esté en estado 'running'
      if (ctx.state !== 'running') {
        ctx.resume().catch(() => {}); // Silenciar error
        return; // No reproducir beat si el contexto no está listo
      }
      
      const now = ctx.currentTime;
      
      // Alternar entre kick (graves) y snare (agudos) para crear ritmo
      const isKick = this.currentBeat % 2 === 0;
      this.currentBeat++;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (isKick) {
        // KICK: Bass drum (graves)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        
        gainNode.gain.setValueAtTime(0.7, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
      } else {
        // SNARE: sonido más agudo y corto
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.05);

        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        oscillator.start(now);
        oscillator.stop(now + 0.15);
      }
    } catch (error) {
    }
  }
}
