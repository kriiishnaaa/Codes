import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking',
  standalone: true,
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css'],
  imports: [CommonModule, ReactiveFormsModule], 
})
export class BookingComponent implements OnInit {
  bookingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const flightCode = this.route.snapshot.queryParamMap.get('flightCode') || '';
    const accEmail = this.route.snapshot.queryParamMap.get('accEmail') || '';

    this.bookingForm = this.fb.group({
      flightCode: [flightCode, Validators.required],
      accEmail: [accEmail, [Validators.required, Validators.email]],
      passengers: this.fb.array([this.createPassenger()])
    });
  }

  get passengers(): FormArray {
    return this.bookingForm.get('passengers') as FormArray;
  }

  createPassenger(): FormGroup {
    return this.fb.group({
      fullName: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(1)]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required]
    });
  }

  addPassenger(): void {
    this.passengers.push(this.createPassenger());
  }

  removePassenger(index: number): void {
    if (this.passengers.length > 1) {
      this.passengers.removeAt(index);
    }
  }

  onSubmit(): void {
  if (this.bookingForm.valid) {
    const { flightCode, accEmail, passengers } = this.bookingForm.value;

    // Step 1: Call bookPassenger to get Stripe Payment URL
    this.http.post(`http://localhost:8082/booking/bookPassenger?flightCode=${flightCode}&accEmail=${accEmail}`, passengers, { responseType: 'text' })
      .subscribe({
        next: (url: string) => {
          // Step 2: Store the booking details temporarily (for use after payment)
          sessionStorage.setItem('pendingBooking', JSON.stringify({ flightCode, accEmail, passengers }));

          // Step 3: Redirect to Stripe Checkout
          window.location.href = url;
        },
        error: (error) => {
          console.error("Payment session creation failed", error);
          alert("Failed to initiate payment session.");
        }
      });
  }
}

}
