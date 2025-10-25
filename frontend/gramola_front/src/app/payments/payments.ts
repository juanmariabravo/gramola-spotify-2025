import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../payment-service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
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

  stripe = new Stripe(environment.StripePublicKey)
  transactionDetails: any;
  token? : string
  amount? : number
  trackUri?: string;

  constructor(private paymentService: PaymentService, private router : Router, private spotiService: SpotiService) { }

  ngOnInit(): void {
    const params = this.router.parseUrl(this.router.url).queryParams;
    this.token = params['token'] ?? '';
    this.amount = params['amount'];
    this.trackUri = params['trackUri'] ?? '';
  }

  prepay() {
    this.paymentService.prepay(this.amount).subscribe({
      next: (response: any) => {
        this.transactionDetails = JSON.parse(response.body)
        this.showForm()
      },
      error: (response: any) => {
        alert(response)
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
    let card = elements.create("card", { style: style })
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
    form!.style.display = "block"
    // ocultar el botón "Go to payment" al aparecer el formulario
    const prepayBtn = document.getElementById("prepay-btn");
    if (prepayBtn) {
      prepayBtn.style.display = "none";
    }
  }

  payWithCard(card: any) {
    console.log("Paying with card...");
    let self = this;
    this.stripe.confirmCardPayment(this.transactionDetails.data.client_secret, {
      payment_method: {
        card: card
      }
    }).then(function (response: any) {
      if (response.error) {
        console.log(response.error.message);
      } else {
        if (response.paymentIntent.status === 'succeeded') {
          self.paymentService.confirm(response, self.transactionDetails.id, self.token!).subscribe({
            next: (response: any) => {
              self.feedback_PagoRealizado(); // 

              // Si tenemos una trackUri, intentar añadir la canción a la cola de Spotify
              if (self.trackUri) {
                try {
                  self.spotiService.addToQueue(self.trackUri).subscribe({
                    next: (res) => {
                      console.info('Canción añadida a la cola de Spotify:', self.trackUri, res);
                      // (no bloqueamos la navegación principal)
                    },
                    error: (err) => {
                      console.warn('No se pudo añadir la canción tras el pago:', err);
                    }
                  });
                } catch (err) {
                  console.warn('addToQueue falló:', err);
                }
              }

              setTimeout(() => {
                // lo siguiente es una chapuza que hay que arreglar
                const amountValue = Number(self.amount);
                if (amountValue === 1000) {
                  self.router.navigate(['/login']);
                } else if (amountValue === 50) {
                  self.router.navigate(['/music']);
                }
              }, 3000);

              return;
            },
            error: (error: any) => {
              console.error('Error confirming payment:', error);
            }
          })
        }
      }
    });
  }

  feedback_PagoRealizado() {
    // mostrar feedback visual, ocultar formulario y redirigir tras 3s
              const form = document.getElementById('payment-form');
              if (form) form.style.display = 'none';

              let msg = document.getElementById('payment-success') as HTMLElement | null;
              if (!msg) {
                msg = document.createElement('div');
                msg.id = 'payment-success';
                msg.style.cssText = 'padding:16px;border-radius:6px;background:#e6ffed;color:#064e28;margin-top:12px;text-align:center;font-weight:600';
                const parent = document.getElementById('payment-form')?.parentElement ?? document.body;
                parent.appendChild(msg);
              }
              msg.textContent = 'Pago realizado con éxito.';

              // spinner pequeño
              const spinner = document.createElement('span');
              spinner.style.cssText = 'display:inline-block;width:14px;height:14px;margin-left:10px;border:3px solid rgba(0,0,0,0.15);border-top-color:#064e28;border-radius:50%;animation:spin 0.8s linear infinite';
              msg.appendChild(spinner);

              // añadir keyframes una sola vez
              if (!document.getElementById('payment-success-spinner-style')) {
                const style = document.createElement('style');
                style.id = 'payment-success-spinner-style';
                style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
                document.head.appendChild(style);
              }
  }
}