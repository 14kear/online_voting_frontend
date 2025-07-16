import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

interface LogEntry {
  ID: number;
  UserID: number;
  Action: string;
  PollID: number | null;
  OptionID: number | null;
  ResultID: number | null;
  CreatedAt: string;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  logs: LogEntry[] = [];
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.error = null;
    this.http.get<{ logs: LogEntry[] }>('http://localhost:8081/api/voting/logs').subscribe({
      next: res => {
        this.logs = res.logs;
        this.loading = false;
      },
      error: err => {
        this.error = 'Ошибка загрузки логов';
        this.loading = false;
      }
    });
  }
}
