import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../payment-service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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

  constructor(private paymentService: PaymentService, private router : Router) { }

  ngOnInit(): void {
    const params = this.router.parseUrl(this.router.url).queryParams;
    this.token = params['token'] ?? '';
    this.amount = params['amount'];
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
    let self = this
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
              self.router.navigate(["/login"])
            },
            error: (error: any) => {
              console.error('Error confirming payment:', error);
            }
          })
        }
      }
    });
  }
}
