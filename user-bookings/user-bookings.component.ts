import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-bookings.component.html',
  styleUrls: ['./user-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  accEmail: string | null = '';
  refundMessage: string = '';
  checkedInIds: Set<number> = new Set();

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.accEmail = this.authService.getUserEmail(); // ✅ Use localStorage-based email

    if (this.accEmail) {
      this.bookingService.getBookingsByEmail(this.accEmail).subscribe({
        next: (data) => {
          console.log("Fetched bookings:", data);
          this.bookings = data;
        },
        error: (err) => {
          console.error('Failed to fetch bookings:', err);
        }
      });
    } else {
      console.warn('User email not found. Possibly not logged in.');
    }
  }

  confirmDelete(booking: any): void {
    const confirmDelete = confirm("Are you sure you want to cancel this booking?");

    if (confirmDelete) {
      this.bookingService.deleteBooking(booking.id, booking.flightId).subscribe({
        next: () => {
          this.bookings = this.bookings.filter(b => b.id !== booking.id);
          this.refundMessage = 'Your refund will be initiated shortly.';
          setTimeout(() => this.refundMessage = '', 4000);
        },
        error: (err) => {
          console.error('Failed to delete booking:', err);
        }
      });
    }
  }

  checkIn(booking: any): void {
    this.bookingService.checkInPassenger(booking.id).subscribe({
      next: (res: any) => {
        this.checkedInIds.add(booking.id);
        alert(res); // Optional: show confirmation
      },
      error: (err: any) => {
        console.error('Failed to check in:', err);
      }
    });
  }

  isCheckedIn(bookingId: number): boolean {
    return this.checkedInIds.has(bookingId);
  }
}
