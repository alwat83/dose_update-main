import { Injectable, inject } from '@angular/core';
import { httpsCallable, Functions } from '@angular/fire/functions';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private functions = inject(Functions); // ✅ Modular Functions inject

  createCheckoutSession(email: string, billingPeriod: 'monthly' | 'yearly'): Observable<string> {
    const callable = httpsCallable(this.functions, 'createCheckoutSession');
    return from(callable({ email, billingPeriod })).pipe(
      map((result: any) => result.data.url)
    );
  }
}
