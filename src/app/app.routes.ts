// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DrugDetailsComponent } from './drug-details/drug-details.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TrackingListComponent } from './tracking-list/tracking-list.component';
import { MedicationSearchComponent } from './medication-search/medication-search.component';
import { DosageCorrectionComponent } from './dosage-correction/dosage-correction.component';
import { HomeComponent } from '../home/home.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { AdminTestComponent } from './admin-test.component'; 
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'drug-details/:rxcui', component: DrugDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'tracking-list', component: TrackingListComponent },
  { path: 'medication-search', component: MedicationSearchComponent },
  { path: 'dosage-correction', component: DosageCorrectionComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent }, // ✅ Comma added here
  { path: 'admin-test', component: AdminTestComponent }, 
  { path: 'forgot-password', component: ForgotPasswordComponent }, 
  { path: '**', redirectTo: '' }
];
