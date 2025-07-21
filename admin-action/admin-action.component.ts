// src/app/Pages/admin-action/admin-action.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-admin-action',
  standalone: true,
  templateUrl: './admin-action.component.html',
  styleUrls: ['./admin-action.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AdminActionComponent implements OnInit {
  flightForm!: FormGroup;
  flights: any[] = [];
  allBookings: any[]=[];
  selectedFlight: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private bookingService: BookingService) {}

  ngOnInit(): void {
    this.flightForm = this.fb.group({
      flightCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}[0-9]{4}$/)]],
      airline: ['', Validators.required],
      source: ['', Validators.required],
      destination: ['', Validators.required],
      departureDate: ['', Validators.required],
      arrivalDate: ['', Validators.required],
      departureTime: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      baseFare: ['', [Validators.required, Validators.min(0)]],
      totalSeats: ['', [Validators.required, Validators.min(1)]]
    });

    this.getAllFlights();
  }

  getAllFlights(): void {
    this.http.get<any[]>('http://localhost:8081/flights/AllFlights').subscribe(data => {
      this.flights = data;
    });
  }

  addFlight(): void {
    const newFlight = [this.flightForm.value]; // wrap in list
    this.http.post<any[]>('http://localhost:8081/flights/AddFlight', newFlight).subscribe({
      next: () => {
        alert('Flight added successfully');
        this.flightForm.reset();
        this.getAllFlights();
      },
      error: (err) => {
        console.error('Error adding flight:', err);
      }
    });
  }

  deleteFlight(id: number | undefined): void {

    console.log(id);
    const decision = confirm('Are you sure you want to delete this flight?');
    console.log(decision);
    if (decision) {
      this.http.delete(`http://localhost:8081/flights/deleteFlight/${id}`).subscribe({
        next: () => {
          alert('Flight deleted successfully');
          this.getAllFlights();
        },
        error: (err) => {
          console.error('Error deleting flight:', err);
        }
      });
    }
  }
  showAllPassengers(flightCode: string) {
  this.bookingService.showAllBookings(flightCode).subscribe({
    next: (data) => {
      this.allBookings = data;
      this.selectedFlight = flightCode;
    },
    error: (err) => {
      console.error('Error fetching passengers:', err);
    }
  });
}


}
