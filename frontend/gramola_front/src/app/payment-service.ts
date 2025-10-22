import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private client: HttpClient) { }

  prepay(): Observable<any> {
    return this.client.get(`${environment.URL_API}/payments/prepay`, {
      withCredentials: true, // para enviar cookies
      observe: 'response', // queremos observar la respuesta completa
      responseType: 'text' // el cuerpo de la respuesta es texto
    });
  }

  confirm(response: any, transactionId: string, token: string): Observable<any> {
    response.transactionId = transactionId;
    response.token = token;
    return this.client.post(`${environment.URL_API}/payments/confirm`, response, {
      withCredentials: true, observe: 'response', responseType: 'text' 
    });
  }
}
