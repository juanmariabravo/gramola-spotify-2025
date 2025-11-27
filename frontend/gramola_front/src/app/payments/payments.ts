import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../payment-service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { SpotiService } from '../spoti-service';

declare let Stripe: any

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [],
  templateUrl: './payments.html',
  styleUrls: ['./payments.css']
})
export class Payments implements OnInit {

  stripe: any;
  transactionDetails: any;
  token? : string
  amount? : number
  trackUri?: string;
  isSubscription = false;
  isSongPayment = false;
  paymentTitle = '';
  paymentDescription = '';
  paymentIcon = 'credit_card';

  constructor(private paymentService: PaymentService, private router : Router, private spotiService: SpotiService) { }

  ngOnInit(): void {
    const params = this.router.parseUrl(this.router.url).queryParams;
    this.token = params['token'] ?? '';
    this.amount = params['amount'];
    this.trackUri = params['trackUri'] ?? '';
    // Inicializar Stripe, llamando al backend para obtener la clave pública
    const publicKeySub = this.paymentService.getPublicKey().subscribe({
      next: (response: any) => {
        const publicKey = response.body;
        this.stripe = Stripe(publicKey);
          publicKeySub.unsubscribe();
      }
    });

    // Detectar tipo de pago
    const amountValue = Number(this.amount || 0);
    if (amountValue >= 1000) {
      this.isSubscription = true;
      this.paymentTitle = 'Suscripción a esipotify';
      this.paymentDescription = 'Acceso ilimitado a todas las funciones de nuestra gramola';
      this.paymentIcon = 'star';
    } else if (amountValue > 0 && amountValue < 1000) {
      this.isSongPayment = true;
      this.paymentTitle = 'Añadir canción a la cola';
      this.paymentDescription = 'Tu canción se reproducirá después de las actuales';
      this.paymentIcon = 'music_note';
    } else {
      this.paymentTitle = 'Pago';
      this.paymentDescription = 'Completa tu pago de forma segura';
      this.paymentIcon = 'credit_card';
    }

    // Iniciar proceso de pago automáticamente
    this.prepay();
  }

  getFormattedAmount(): string {
    const amountValue = Number(this.amount || 0) / 100;
    return amountValue.toFixed(2);
  }

  prepay() {
    this.paymentService.prepay(this.amount).subscribe({
      next: (response: any) => {
        this.transactionDetails = JSON.parse(response.body)
        this.showForm()
      },
      error: (response: any) => {
        console.error('Error en prepay:', response);
        alert('Error al iniciar el pago. Por favor intenta de nuevo.');
        // si el pago es de suscripción, redirigir a /login
        if (this.isSubscription) {
          this.router.navigate(['/login']);
          return;
        }
        // si el pago es de canción, redirigir a /music
          this.router.navigate(['/music']);
      },
    })
  }

  showForm() {
    let elements = this.stripe.elements()
    let style = {
      base: {
        color: "#32325d", fontFamily: 'Arial, sans-serif',
        fontSmoothing: "antialiased", fontSize: "16px",
        "::placeholder": {
          color: "#32325d"
        }
      },
      invalid: {
        fontFamily: 'Arial, sans-serif', color: "#fa755a",
        iconColor: "#fa755a"
      }
    }
    // Configurar card element sin solicitar código postal
    let card = elements.create("card", {
      style: style,
      hidePostalCode: true  // deshabilitar solicitud de código postal
    })
    card.mount("#card-element")
    card.on("change", function (event: any) {
      document.querySelector("button")!.disabled = event.empty;
      document.querySelector("#card-error")!.textContent =
        event.error ? event.error.message : "";
    });
    let self = this
    let form = document.getElementById("payment-form");
    form!.addEventListener("submit", function (event) {
      event.preventDefault();
      self.payWithCard(card);
    });
    form!.style.display = "block";
    // ocultar spinner de carga
    const loadingEl = document.getElementById("loading-prepay");
    if (loadingEl) loadingEl.style.display = "none";
  }

  payWithCard(card: any) {
    //console.log("Paying with card...");
    let self = this;
    this.stripe.confirmCardPayment(this.transactionDetails.data.client_secret, {
      payment_method: {
        card: card
      }
    }).then( (response: any) => {
      if (response.error) {
        console.log(response.error.message);
        // mostrar error al usuario
        const cardErrorEl = document.getElementById('card-error');
        if (cardErrorEl) {
          cardErrorEl.textContent = response.error.message;
        }
      } else {
        if (response.paymentIntent.status === 'succeeded') {
          self.paymentService.confirm(response, self.transactionDetails.id, self.token!).subscribe({
            next: (response: any) => {
              // console.log('Payment confirmed by backend');
              // ocultar formulario
              const form = document.getElementById('payment-form');
              if (form) form.style.display = 'none';

              // Mostrar feedback específico según tipo de pago
              if (self.isSongPayment && self.trackUri) {
                // Pago de canción: añadir a cola y redirigir a /music tras 3s
                self.showSongPaymentSuccess();
                
                // intentar añadir la canción a la cola de Spotify
                try {
                  self.spotiService.addToQueue(self.trackUri).subscribe({
                    next: (res) => {
                      // Comunicar al backend que la canción se añadió correctamente
                      if (self.trackUri && self.token) {
                        const trackId = self.trackUri.split(':').pop() || self.trackUri;
                        self.spotiService.notifySongAdded(trackId, self.token).subscribe({
                          next: () => {
                          },
                          error: (errNotify) => {
                            console.warn('No se pudo notificar al backend del añadido de canción:', errNotify);
                          }
                        });
                      } else {
                        console.warn('No se puede notificar al backend: falta trackId o userToken');
                      }
                    },
                    error: (err) => {
                      console.warn('No se pudo añadir la canción tras el pago:', err);
                    }
                  });
                } catch (err) {
                  console.warn('addToQueue falló:', err);
                }

                setTimeout(() => {
                  self.router.navigate(['/music']);
                }, 3000);

              } else if (self.isSubscription) {
                // Pago de suscripción: mostrar mensaje con link a login (sin redirección automática)
                self.showSubscriptionPaymentSuccess();
              } else {
                // Pago genérico (fallback)
                self.showGenericPaymentSuccess();
                setTimeout(() => {
                  self.router.navigate(['/login']);
                }, 3000);
              }
            },
            error: (error: any) => {
              console.error('Error confirming payment:', error);
              alert('Error al confirmar el pago. Por favor contacta con soporte.');
            }
          })
        }
      }
    });
  }

  showSongPaymentSuccess() {
    let msg = document.getElementById('payment-success') as HTMLElement | null;
    if (!msg) {
      msg = document.createElement('div');
      msg.id = 'payment-success';
      msg.style.cssText = 'padding:20px;border-radius:12px;background:#e6ffed;color:#064e28;margin-top:20px;text-align:center;font-weight:600;font-size:1.1rem;';
      const parent = document.querySelector('.payment-card') ?? document.body;
      parent.appendChild(msg);
    }
    msg.innerHTML = '<div style="font-size:2.5rem;margin-bottom:10px;"><span class="material-icons" style="font-size:2.5rem;">music_note</span></div><p style="margin:0 0 10px 0;">¡Gracias! Añadiendo tu canción a la cola...</p>';
    
    // spinner pequeño
    const spinner = document.createElement('span');
    spinner.style.cssText = 'display:inline-block;width:16px;height:16px;margin-left:8px;border:3px solid rgba(0,0,0,0.15);border-top-color:#064e28;border-radius:50%;animation:spin 0.8s linear infinite;';
    msg.appendChild(spinner);
    
    this.addSpinnerStyles();
  }

  showSubscriptionPaymentSuccess() {
    let msg = document.getElementById('payment-success') as HTMLElement | null;
    if (!msg) {
      msg = document.createElement('div');
      msg.id = 'payment-success';
      msg.style.cssText = 'padding:25px;border-radius:12px;background:#e6ffed;color:#064e28;margin-top:20px;text-align:center;font-weight:600;';
      const parent = document.querySelector('.payment-card') ?? document.body;
      parent.appendChild(msg);
    }
    msg.innerHTML = `
      <div style="font-size:3rem;margin-bottom:15px;"><span class="material-icons" style="font-size:3rem;">star</span></div>
      <h3 style="margin:0 0 10px 0;color:#064e28;font-size:1.3rem;">¡Gracias!</h3>
      <p style="margin:0 0 20px 0;font-size:1rem;line-height:1.5;">Tu pago se ha confirmado correctamente y ya puedes disfrutar de nuestro servicio.</p>
      <a href="/login" style="display:inline-block;padding:12px 30px;background:#1DB954;color:white;text-decoration:none;border-radius:25px;font-weight:600;transition:background 0.3s ease;" onmouseover="this.style.background='#1ed760'" onmouseout="this.style.background='#1DB954'">Inicia sesión para comenzar</a>
    `;
  }

  showGenericPaymentSuccess() {
    let msg = document.getElementById('payment-success') as HTMLElement | null;
    if (!msg) {
      msg = document.createElement('div');
      msg.id = 'payment-success';
      msg.style.cssText = 'padding:20px;border-radius:12px;background:#e6ffed;color:#064e28;margin-top:20px;text-align:center;font-weight:600;';
      const parent = document.querySelector('.payment-card') ?? document.body;
      parent.appendChild(msg);
    }
    msg.innerHTML = '<div style="font-size:2.5rem;margin-bottom:10px;"><span class="material-icons" style="font-size:2.5rem;">check_circle</span></div><p style="margin:0;">Pago realizado con éxito.</p>';
  }

  addSpinnerStyles() {
    if (!document.getElementById('payment-success-spinner-style')) {
      const style = document.createElement('style');
      style.id = 'payment-success-spinner-style';
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }
  }

  goBack() {
    // Cancelar el pago y volver a la página anterior
    const confirmCancel = confirm('¿Estás seguro de que deseas cancelar el pago?');
    if (confirmCancel) {
      // Intentar volver a la página anterior, o a /music si no hay historial
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Si es pago de suscripción, ir a login
        if (this.isSubscription) {
          this.router.navigate(['/login']);
        } else {
          // Si es pago de canción, ir a music
          this.router.navigate(['/music']);
        }
      }
    }
  }
}