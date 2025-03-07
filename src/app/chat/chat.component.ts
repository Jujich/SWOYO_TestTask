import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Message } from '../message/message.interface';
import {MessageComponent} from '../message/message.component';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: true,
  imports: [
    MessageComponent,
    ReactiveFormsModule,
    NgForOf
  ],
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  private channel!: BroadcastChannel;
  messages: Message[] = [];
  username: string | null = null;
  messageForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.username = localStorage.getItem('username');

    if (!this.username) {
      this.router.navigate(['/login']).then(r => {
        window.location.reload();
      });
      return;
    }

    this.initializeBroadcastChannel();
    this.loadMessages();
  }

  private initializeBroadcastChannel(): void {
    this.channel = new BroadcastChannel('chat_channel');

    this.channel.onmessage = (event: MessageEvent) => {
      this.ngZone.run(() => {
        if (event.data.type === 'messages_update') {
          this.handleExternalUpdate(event.data.payload);
          this.cdr.markForCheck();
        }
      });
    };
  }

  private loadMessages(): void {
    try {
      const stored = localStorage.getItem('messages');
      this.messages = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
      this.messages = [];
    }
  }

  private handleExternalUpdate(newMessages: Message[]): void {
    if (Array.isArray(newMessages)) {
      this.messages = [...newMessages];
      this.saveToStorage();
    }
  }

  private broadcastUpdate(): void {
    this.channel.postMessage({
      type: 'messages_update',
      payload: this.messages
    });
  }

  private saveToStorage(): void {
    localStorage.setItem('messages', JSON.stringify(this.messages));
  }

  onSubmit(): void {
    if (this.messageForm.valid) {
      const formData = this.messageForm.value;
      const timestamp = new Date();

      const messageData: Message = {
        text: formData.message,
        username: this.username!,
        timestamp: `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}`
      };

      this.messages = [messageData, ...this.messages];
      this.saveToStorage();
      this.broadcastUpdate();
      this.messageForm.reset();
    }
  }

  ngOnDestroy(): void {
    if (this.channel) {
      this.channel.close();
    }
  }
}
