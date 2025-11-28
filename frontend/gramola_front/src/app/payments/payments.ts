import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../payment-service';
import { Router } from '@angular/router';
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
  token?: string
  amount?: number
  trackUri?: string;
  isSubscription = false;
  isSongPayment = false;
  paymentTitle = '';
  paymentDescription = '';
  paymentIcon = 'credit_card';
  paymentSuccess = false;

  constructor(private paymentService: PaymentService, private router: Router, private spotiService: SpotiService) { }

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
        // Iniciar proceso de pago automáticamente
        this.prepay();
      }
    });

    // Detectar tipo de pago
    const amountValue = Number(this.amount || 0);
    if (amountValue >= 1000) {
      this.isSubscription = true;
      this.paymentTitle = 'Suscripción a esipotify';
      this.paymentDescription = 'Acceso ilimitado a todas las funciones de nuestra gramola';
      this.paymentIcon = 'star star star star star';
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
  }

  getFormattedAmount(): string {
    const amountValue = Number(this.amount || 0) / 100;
    return amountValue.toFixed(2);
  }

  prepay() {
    this.paymentService.prepay(this.amount).subscribe({
      next: (response: any) => {
        this.transactionDetails = JSON.parse(response.body);
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
    if (!this.stripe) {
      console.error('Stripe not initialized');
      return;
    }
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
      const btn = document.querySelector("button");
      if (btn) btn.disabled = event.empty;
      const err = document.querySelector("#card-error");
      if (err) err.textContent = event.error ? event.error.message : "";
    });
    let self = this
    let form = document.getElementById("payment-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const submitBtn = document.getElementById("submit") as HTMLButtonElement;
        if (submitBtn) {
          submitBtn.disabled = true;
          const spinner = document.getElementById("spinner");
          if (spinner) spinner.classList.remove("hidden");
        }
        self.payWithCard(card);
      });
      form.style.display = "block";
    }
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
    }).then((response: any) => {
      if (response.error) {
        console.log("Error al confirmar el pago:", response.error, "client_secret:", this.transactionDetails.data.client_secret);
        // mostrar error al usuario
        const cardErrorEl = document.getElementById('card-error');
        if (cardErrorEl) {
          cardErrorEl.textContent = response.error.message;
        }

        // Reactivar botón
        const submitBtn = document.getElementById("submit") as HTMLButtonElement;
        if (submitBtn) {
          submitBtn.disabled = false;
          const spinner = document.getElementById("spinner");
          if (spinner) spinner.classList.add("hidden");
        }
      } else {
        if (response.paymentIntent.status === 'succeeded') {
          self.paymentService.confirm(response, self.transactionDetails.id, self.token!).subscribe({
            next: (response: any) => {
              // console.log('Payment confirmed by backend');
              // ocultar formulario
              const form = document.getElementById('payment-form');
              if (form) form.style.display = 'none';

              self.paymentSuccess = true; // Mostrar feedback de pago exitoso
              if (self.isSongPayment && self.trackUri) {
                // Pago de canción: añadir a cola y redirigir a /music tras 3s
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
                }, 2000);

              } else {
                // Algo salió mal, redirigir a login
                setTimeout(() => {
                  self.router.navigate(['/login']);
                }, 2000);
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