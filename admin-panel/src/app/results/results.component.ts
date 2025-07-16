import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Result {
  ID: number;
  PollID: number;
  OptionID: number;
  UserID: number;
  UserEmail: string,
  VotedAt: string;
}

interface ResultsByPoll {
  [pollId: number]: Result[];
}

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
  imports: [CommonModule, RouterModule]
})
export class ResultsComponent implements OnInit {
  results: Result[] = [];
  groupedResults: ResultsByPoll = {};
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadResults();
  }

  loadResults() {
    this.loading = true;
    this.error = '';
    this.http.get<{ results: Result[] }>('http://localhost:8081/api/voting/results')
      .subscribe({
        next: (res) => {
          this.results = res.results;
          this.groupResultsByPoll();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Ошибка загрузки результатов';
          this.loading = false;
        }
      });
  }

  private groupResultsByPoll() {
    this.groupedResults = this.results.reduce((groups, result) => {
      if (!groups[result.PollID]) {
        groups[result.PollID] = [];
      }
      groups[result.PollID].push(result);
      return groups;
    }, {} as ResultsByPoll);
  }

  get sortedPollIds(): number[] {
    return Object.keys(this.groupedResults)
      .map(id => +id)
      .sort((a, b) => a - b);
  }
}
