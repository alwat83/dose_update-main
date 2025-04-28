import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DrugbankService {
  private baseUrl = environment.drugBankBaseUrl;
  private token = environment.drugBankToken;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
  }

  // 🔍 Medication name search
  searchByName(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/us/drug_names?q=${encodeURIComponent(name)}`, {
      headers: this.getHeaders()
    });
  }

  // 🧪 Ingredient name search
  searchByIngredient(ingredient: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/us/ingredient_names?q=${encodeURIComponent(ingredient)}`, {
      headers: this.getHeaders()
    });
  }

  // 📄 Full drug details by DrugBank ID (once you have it)
  getDrugById(drugbankId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/us/drugs/${drugbankId}`, {
      headers: this.getHeaders()
    });
  }
}
