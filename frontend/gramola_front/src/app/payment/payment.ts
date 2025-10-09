import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  recommended?: boolean;
  savings?: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface CardInfo {
  number: string;
  expiry: string;
  cvv: string;
  holder: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css']
})
export class Payment implements OnInit {
  token: string = '';
  barName: string = 'Mi Bar';
  
  subscriptionPlans: SubscriptionPlan[] = [];
  selectedPlan: SubscriptionPlan | null = null;
  
  paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Tarjeta de crédito', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🔵' },
    { id: 'bank', name: 'Transferencia', icon: '🏦' }
  ];
  selectedPaymentMethod: string = 'card';
  
  cardInfo: CardInfo = {
    number: '',
    expiry: '',
    cvv: '',
    holder: ''
  };
  
  acceptedTerms: boolean = false;
  processing: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtener token de confirmación de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        console.warn('No se encontró token de confirmación');
        // En producción, redirigir a error o registro
      }
    });

    // Cargar planes desde el backend (simulado)
    this.loadSubscriptionPlans();
  }

  loadSubscriptionPlans() {
    // Simular carga de planes desde la base de datos
    this.subscriptionPlans = [
      {
        id: 'monthly-basic',
        name: 'Plan Mensual',
        price: 29.99,
        period: 'monthly',
        features: [
          'Gramola virtual completa',
          'Hasta 100 canciones/mes incluidas',
          'Soporte por email',
          'Panel de administración básico'
        ]
      },
      {
        id: 'yearly-premium',
        name: 'Plan Anual Premium',
        price: 299.99,
        period: 'yearly',
        recommended: true,
        savings: 15,
        features: [
          'Gramola virtual completa',
          'Canciones ilimitadas',
          'Soporte prioritario 24/7',
          'Panel de administración avanzado',
          'Estadísticas de uso',
          '2 meses gratis'
        ]
      },
      {
        id: 'yearly-business',
        name: 'Plan Anual Business',
        price: 499.99,
        period: 'yearly',
        savings: 20,
        features: [
          'Todo lo del Plan Premium',
          'Múltiples usuarios administradores',
          'API de integración',
          'Branding personalizado',
          'Asistente dedicado',
          '3 meses gratis'
        ]
      }
    ];
  }

  selectPlan(plan: SubscriptionPlan) {
    this.selectedPlan = plan;
  }

  selectPaymentMethod(methodId: string) {
    this.selectedPaymentMethod = methodId;
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      this.cardInfo.number = parts.join(' ');
    } else {
      this.cardInfo.number = value;
    }
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.cardInfo.expiry = value;
  }

  processPayment() {
    if (!this.selectedPlan || !this.selectedPaymentMethod || !this.acceptedTerms) {
      return;
    }

    this.processing = true;

    // Simular procesamiento de pago
    setTimeout(() => {
      this.processing = false;
      
      // En una implementación real, aquí se conectaría con el servicio de pagos
      console.log('Procesando pago con:', {
        token: this.token,
        plan: this.selectedPlan,
        paymentMethod: this.selectedPaymentMethod,
        cardInfo: this.selectedPaymentMethod === 'card' ? this.cardInfo : null
      });

      // Simular pago exitoso
      this.handlePaymentSuccess();
    }, 3000);
  }

  handlePaymentSuccess() {
    // Guardar suscripción en el backend y redirigir al dashboard
    console.log('Pago procesado exitosamente');
    
    // Redirigir al dashboard o página de éxito
    this.router.navigate(['/dashboard'], {
      queryParams: { 
        success: 'true',
        plan: this.selectedPlan?.id 
      }
    });
  }

  validateForm(): boolean {
    if (!this.selectedPlan) {
      alert('Por favor, selecciona un plan de suscripción');
      return false;
    }

    if (!this.selectedPaymentMethod) {
      alert('Por favor, selecciona un método de pago');
      return false;
    }

    if (!this.acceptedTerms) {
      alert('Debes aceptar los términos y condiciones');
      return false;
    }

    if (this.selectedPaymentMethod === 'card') {
      if (!this.validateCard()) {
        return false;
      }
    }

    return true;
  }

  validateCard(): boolean {
    if (!this.cardInfo.number || this.cardInfo.number.replace(/\s/g, '').length !== 16) {
      alert('Por favor, introduce un número de tarjeta válido (16 dígitos)');
      return false;
    }

    if (!this.cardInfo.expiry || !/^\d{2}\/\d{2}$/.test(this.cardInfo.expiry)) {
      alert('Por favor, introduce una fecha de expiración válida (MM/AA)');
      return false;
    }

    if (!this.cardInfo.cvv || this.cardInfo.cvv.length !== 3) {
      alert('Por favor, introduce un CVV válido (3 dígitos)');
      return false;
    }

    if (!this.cardInfo.holder) {
      alert('Por favor, introduce el nombre del titular de la tarjeta');
      return false;
    }

    return true;
  }
}