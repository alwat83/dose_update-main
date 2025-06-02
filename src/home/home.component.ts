import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChildren
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  searchQuery: string = '';
  searchResults: { name: string; description: string }[] = [];

  isLoggedIn: boolean = true; // Toggle to test different states

  @ViewChildren('animatedCard', { read: ElementRef }) cards!: QueryList<ElementRef>;

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.1 }
    );

    this.cards.forEach(card => observer.observe(card.nativeElement));
  }

  searchDrugs(): void {
    if (this.searchQuery.trim()) {
      this.searchResults = [
        { name: 'Acetaminophen', description: 'Pain reliever and fever reducer' },
        { name: 'Ibuprofen', description: 'Anti-inflammatory used to treat pain and swelling' },
      ].filter(drug =>
        drug.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.searchResults = [];
    }
  }
}
