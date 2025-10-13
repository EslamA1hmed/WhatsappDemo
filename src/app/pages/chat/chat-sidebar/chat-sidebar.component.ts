import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, Contact } from '../../../services/contact.service';
import { ChatMessageService, ChatMessage } from '../../../services/chat-message.service';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

// Extended Contact interface for local use
interface ExtendedContact extends Contact {
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-sidebar.component.html',
  styleUrls: ['./chat-sidebar.component.css']
})
export class ChatSidebarComponent implements OnInit {
  @Output() contactSelected = new EventEmitter<ExtendedContact | null>();
  
  private contactService = inject(ContactService);
  private messageService = inject(ChatMessageService);

  contacts: ExtendedContact[] = [];
  filteredContacts: ExtendedContact[] = [];
  selectedContactId: number | null = null;
  loading = false;
  searchTerm = '';
  showAddContact = false;
  
  newContact: { phoneNumber: string; name: string } = {
    phoneNumber: '',
    name: ''
  };

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.loading = true;
    this.contactService.getAllContacts(0, 100).subscribe({
      next: (contacts: Contact[]) => {
        this.contacts = contacts as ExtendedContact[];
        this.loadLastMessagesForAllContacts();
        this.filteredContacts = [...this.contacts];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading contacts:', err);
        this.loading = false;
        alert('Failed to load contacts');
      }
    });
  }

  loadLastMessagesForAllContacts() {
    const requests: Observable<ExtendedContact>[] = this.contacts.map(contact =>
      this.messageService.getLastMessageForContact(contact.phoneNumber).pipe(
        map((message: ChatMessage | null) => ({
          ...contact,
          lastMessage: message 
            ? this.getMessagePreview(message)
            : undefined,
          lastMessageTime: message ? message.createdAt : undefined,
          unreadCount: message && message.direction === 'RECEIVED' && message.status !== 'read' 
            ? 1 
            : 0
        }))
      )
    );

    forkJoin(requests).subscribe({
      next: (updatedContacts: ExtendedContact[]) => {
        this.contacts = updatedContacts;
        this.filteredContacts = [...this.contacts];
      },
      error: (err) => {
        console.error('Error loading last messages:', err);
      }
    });
  }

  getMessagePreview(message: ChatMessage): string {
    if (message.type === 'text' && message.textBody) {
      return this.truncateText(message.textBody);
    } else if (message.type === 'template' && message.templateBody) {
      return this.truncateText(message.templateBody);
    } else if (message.type === 'image') {
      if (message.caption) {
        return this.truncateText(message.caption);
      }else{
        return 'Photo';
      }
    }else if(message.type === 'video'){
       if (message.caption) {
        return this.truncateText(message.caption);
      }
      else{
        return 'Video';
      }
    }
    return 'Message'; 
  }

  filterContacts() {
    if (!this.searchTerm.trim()) {
      this.filteredContacts = [...this.contacts];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredContacts = this.contacts.filter(c => 
      (c.name?.toLowerCase().includes(term) || c.phoneNumber.includes(term))
    );
  }

  selectContact(contact: ExtendedContact) {
    this.selectedContactId = contact.id;
    this.contactSelected.emit(contact);
  }

  addContact() {
    if (!this.newContact.phoneNumber) {
      alert('Please enter a phone number');
      return;
    }

    this.contactService.addContact(this.newContact.phoneNumber, this.newContact.name).subscribe({
      next: (contact: Contact) => {
        this.contacts.unshift(contact as ExtendedContact);
        this.filteredContacts = [...this.contacts];
        this.cancelAddContact();
      },
      error: (err) => {
        alert(err.error?.error || 'Error adding contact');
        console.error(err);
      }
    });
  }

  cancelAddContact() {
    this.showAddContact = false;
    this.newContact = { phoneNumber: '', name: '' };
  }

  deleteContact(event: Event, id: number) {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    this.contactService.deleteContact(id).subscribe({
      next: () => {
        this.contacts = this.contacts.filter(c => c.id !== id);
        this.filteredContacts = [...this.contacts];
        if (this.selectedContactId === id) {
          this.selectedContactId = null;
          this.contactSelected.emit(null);
        }
      },
      error: (err) => {
        alert('Error deleting contact');
        console.error(err);
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  truncateText(message: string | undefined): string {
    if (!message) return '';
    return message.length > 30 ? message.substring(0, 30) + '...' : message;
  }

  formatTime(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}