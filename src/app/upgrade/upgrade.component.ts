import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.scss']
})
export class UpgradeComponent {
  billingPeriod: 'monthly' | 'yearly' = 'monthly';

  // ✅ Add this getter to eliminate the template error
  get priceLabel(): string {
    return this.billingPeriod === 'yearly' ? '$49.99/year' : '$4.99/month';
  }

  upgrade() {
    alert(`Redirecting to ${this.priceLabel} plan checkout...`);
  }
}
