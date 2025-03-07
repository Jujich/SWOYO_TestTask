import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-message',
  imports: [],
  templateUrl: './message.component.html',
  standalone: true,
  styleUrl: './message.component.css'
})
export class MessageComponent {
  @Input() text: string = '';
  @Input() username: string | null = '';
  @Input() date: string = '';
}
