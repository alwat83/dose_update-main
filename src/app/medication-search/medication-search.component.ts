// src/app/medication-search/medication-search.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { TrackingService, TrackedMedication } from '../services/tracking.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-medication-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './medication-search.component.html',
  styleUrls: ['./medication-search.component.scss']
})
export class MedicationSearchComponent implements OnInit {
  searchTerm: string = '';
  searchResults: { name: string; description: string; rxcui: string }[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  trackingMessage: string = '';

  constructor(
    private http: HttpClient,
    private trackingService: TrackingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  /** 🔍 Perform a search using RxNav API */
  searchDrugs(): void {
    if (!this.searchTerm.trim()) {
      this.searchResults = [];
      return;
    }

    const apiUrl = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(this.searchTerm)}`;
    this.loading = true;
    this.errorMessage = '';
    this.searchResults = [];

    this.http.get(apiUrl).pipe(
      map((response: any) => {
        if (!response?.drugGroup?.conceptGroup) return [];

        return response.drugGroup.conceptGroup.flatMap((group: any) => {
          if (!group?.conceptProperties) return [];
          return group.conceptProperties.map((prop: any) => ({
            name: prop.name,
            description: prop.synonym || '',
            rxcui: prop.rxcui || ''
          }));
        });
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ RxNav API error:', err);
        this.errorMessage = 'Failed to fetch medications.';
        this.loading = false;
      }
    });
  }

  /** ✅ Track selected medication if not already tracked */
  trackMedication(drug: { name: string; description: string; rxcui: string }) {
    this.trackingMessage = '';
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        alert('You must be logged in to track medications.');
        return;
      }

      this.trackingService.isMedicationTracked(drug.rxcui).then(isTracked => {
        if (isTracked) {
          this.trackingMessage = `${drug.name} is already being tracked.`;
          return;
        }

        const medication: TrackedMedication = {
          name: drug.name,
          description: drug.description,
          rxcui: drug.rxcui,
          addedAt: new Date()
        };

        this.trackingService.addTrackedMedication(medication)
          .then(() => {
            this.trackingMessage = `${drug.name} has been added to your tracked medications.`;
          })
          .catch(error => {
            console.error('Error tracking medication:', error);
            this.trackingMessage = 'An error occurred while tracking the medication.';
          });
      });
    });
  }
}
