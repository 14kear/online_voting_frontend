import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule} from '@angular/forms';
import { VotingService } from '../services/voting.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-poll',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.css']
})
export class CreatePollComponent {
  pollForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(private fb: FormBuilder, private votingService: VotingService) {
    this.pollForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['active', Validators.required],
      options: this.fb.array([
        this.fb.control('', Validators.required)
      ])
    });
  }

  get options(): FormArray {
    return this.pollForm.get('options') as FormArray;
  }

  addOption(): void {
    this.options.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number): void {
    if (this.options.length > 1) {
      this.options.removeAt(index);
    }
  }

  submit(): void {
    // Показываем ошибки, если форма невалидна
    if (this.pollForm.invalid) {
      this.pollForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const { title, description, status, options } = this.pollForm.value;

    this.votingService.createPoll({ title, description, status }).subscribe({
      next: (res) => {
        const pollId = res.poll_id;

        const optionRequests = options
          .filter((opt: string) => opt.trim())
          .map((opt: string) =>
            this.votingService.createOption(pollId, { text: opt.trim() }).toPromise()
          );

        Promise.all(optionRequests)
          .then(() => {
            this.success = 'Опрос успешно создан!';
            this.pollForm.reset({
              title: '',
              description: '',
              status: 'active',
              options: ['']
            });

            // Сбросить все поля, кроме первого варианта
            while (this.options.length > 1) {
              this.options.removeAt(1);
            }
          })
          .catch(() => {
            this.error = 'Ошибка при добавлении вариантов';
          })
          .finally(() => {
            this.loading = false;
          });
      },
      error: () => {
        this.error = 'Ошибка при создании опроса';
        this.loading = false;
      }
    });
  }
}
