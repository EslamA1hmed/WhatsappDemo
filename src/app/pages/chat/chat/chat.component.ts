import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatSidebarComponent } from '../chat-sidebar/chat-sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { Contact } from '../../../services/contact.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ChatSidebarComponent, ChatWindowComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  selectedContact: Contact | null = null;

  onContactSelected(contact: Contact | null) {
    this.selectedContact = contact;
  }

  onBackToSidebar() {
    this.selectedContact = null;
  }

  isMobile(): boolean {
    return window.innerWidth <= 480;
  }
}