import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private client: HttpClient) { }

  prepay(amount?: number): Observable<any> {
    return this.client.get(`${environment.URL_API}/payments/prepay/${amount ? amount : ''}`, {
      withCredentials: true, // para enviar cookies
      observe: 'response', // queremos observar la respuesta completa
      responseType: 'text' // el cuerpo de la respuesta es texto
    });
  }

  confirm(response: any, transactionId: string, token: string): Observable<any> {
    response.transactionId = transactionId;
    //console.log('Confirming payment with token:', token, 'and response:', response);
    response.token = token;
    return this.client.post(`${environment.URL_API}/payments/confirm`, response, {
      withCredentials: true, observe: 'response', responseType: 'text' 
    });
  }
}
