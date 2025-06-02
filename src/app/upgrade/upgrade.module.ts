import { Component } from '@angular/core';
import { StripeService } from '../services/stripe.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.scss']
})
export class UpgradeComponent {
  billingPeriod: 'monthly' | 'yearly' = 'monthly';
  loading = false;

  constructor(
    private stripeService: StripeService,
    private afAuth: AngularFireAuth
  ) {}

  upgrade() {
    this.loading = true;

    this.afAuth.user.subscribe(user => {
      if (user?.email) {
        this.stripeService.createCheckoutSession(user.email, this.billingPeriod).subscribe({
          next: (url: string) => {
            window.location.href = url;
          },
          error: (err) => {
            console.error('Checkout error:', err);
            this.loading = false;
            alert('There was a problem creating your checkout session.');
          }
        });
      } else {
        this.loading = false;
        alert('Please sign in to upgrade your account.');
      }
    });
  }
}
