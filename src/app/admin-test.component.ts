// admin-test.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrugbankService } from './services/drugbank.service';  // ← swap in DrugbankService
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-test.component.html',
  styleUrls: ['./admin-test.component.scss']
})
export class AdminTestComponent implements OnInit {
  testResult: any = null;
  errorMessage = '';

  constructor(private drugbank: DrugbankService) {}

  ngOnInit(): void {}

  runTest(): void {
    this.errorMessage = '';
    this.testResult = null;
    this.drugbank.searchByName('aspirin')
      .subscribe({
        next: (res: any) => this.testResult = res,
        error: (err: any) => this.errorMessage = err.message || 'Unknown error'
      });
  }
}
