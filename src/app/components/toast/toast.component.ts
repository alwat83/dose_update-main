import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  message: ToastMessage | null = null;
  isVisible = false;
  timeout: any;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toastState$.subscribe((msg) => {
      this.message = msg;
      this.isVisible = true;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.isVisible = false;
      }, 3000);
    });
  }
}
