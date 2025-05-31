import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService } from '../services/stripe.service';
import { Auth, user } from '@angular/fire/auth';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.scss']
})
export class UpgradeComponent {
  billingPeriod: 'monthly' | 'yearly' = 'monthly';
  loading = false;

  private auth = inject(Auth);

  constructor(private stripeService: StripeService) {}

  get priceLabel(): string {
    return this.billingPeriod === 'yearly' ? '$49.99/year' : '$4.99/month';
  }

  upgrade() {
    console.log('🔄 Upgrade process started');
    this.loading = true;

    user(this.auth).pipe(take(1)).subscribe(currentUser => {
      if (currentUser?.email) {
        console.log('✅ Logged in as:', currentUser.email);
        this.stripeService.createCheckoutSession(currentUser.email, this.billingPeriod).subscribe({
          next: (url: string) => {
            console.log('🔗 Stripe session URL received:', url);
            if (url) {
              window.location.href = url;
            } else {
              alert('No URL returned from Stripe.');
              this.loading = false;
            }
          },
          error: (err) => {
            console.error('❌ Stripe checkout error:', err);
            this.loading = false;
            alert('There was an issue with Stripe checkout.');
          }
        });
      } else {
        console.warn('⚠️ No user is currently logged in.');
        this.loading = false;
        alert('Please log in to upgrade.');
      }
    });
  }
}
