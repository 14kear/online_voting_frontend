import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { VotingService } from '../services/voting.service';

@Component({
  selector: 'app-create-poll',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.css']
})
export class CreatePollComponent {
  pollForm: FormGroup;

  constructor(private fb: FormBuilder, private votingService: VotingService) {
    this.pollForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['active', Validators.required],
      options: this.fb.array([this.fb.control('', Validators.required)])
    });
  }

  get options() {
    return this.pollForm.get('options') as FormArray;
  }

  addOption() {
    this.options.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  submit() {
    if (this.pollForm.invalid) return;

    const { title, description, status, options } = this.pollForm.value;

    this.votingService.createPoll({ title, description, status }).subscribe((res) => {
      const pollId = res.poll_id;
      options.forEach((opt: string) => {
        this.votingService.createOption(pollId, { text: opt }).subscribe();
      });
    });
  }
}
