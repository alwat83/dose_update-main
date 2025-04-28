import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drug-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drug-details.component.html',
  styleUrls: ['./drug-details.component.scss']
})
export class DrugDetailsComponent implements OnInit {
  drugId: string | null = null;
  drug: Drug | null = null;
  errorMessage: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.drugId = this.route.snapshot.paramMap.get('rxcui');

    if (this.drugId) {
      this.drug = {
        id: this.drugId,
        name: 'Ibuprofen',
        description: 'Pain relief and anti-inflammatory',
        genericDosage: '200mg',
        frequency: 'Every 6-8 hours',
        indications: 'Pain, fever, inflammation',
        sideEffects: 'Nausea, dizziness, GI upset',
        precautions: 'Avoid alcohol and prolonged use',
        warnings: 'Not for use in late pregnancy or kidney issues',
        interactions: ['Aspirin', 'Warfarin'],
        drugClass: ['NSAID', 'Analgesic']
      };
    } else {
      this.errorMessage = 'Drug ID not found.';
    }
  }
}

interface Drug {
  id: string;
  name: string;
  description: string;
  genericDosage: string;
  frequency: string;
  indications: string;
  sideEffects: string;
  precautions: string;
  warnings?: string;
  interactions?: string[];
  drugClass?: string[];
}
