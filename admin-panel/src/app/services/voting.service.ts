import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VotingService {
  private api = 'http://localhost:8081/api/voting';

  constructor(private http: HttpClient) {}

  createPoll(data: { title: string; description: string; status: string }) {
    return this.http.post<{ poll_id: number }>(`${this.api}/polls`, data);
  }

  createOption(pollId: number, data: { text: string }) {
    return this.http.post<{ option_id: number }>(`${this.api}/polls/${pollId}/options`, data);
  }
}
