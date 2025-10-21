import { Component, OnInit, Output, EventEmitter, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, Contact } from '../../../services/contact.service';
import { ChatMessageService, ChatMessage } from '../../../services/chat-message.service';
import { WebSocketService } from '../../../services/websocket.service';
import { Observable, forkJoin, Subscription } from 'rxjs';
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
  styleUrls: ['./chat-sidebar.component.css'],
})
export class ChatSidebarComponent implements OnInit, OnDestroy {
  @Output() contactSelected = new EventEmitter<ExtendedContact | null>();

  private contactService = inject(ContactService);
  private messageService = inject(ChatMessageService);
  private websocketService = inject(WebSocketService);

  contacts: ExtendedContact[] = [];
  filteredContacts: ExtendedContact[] = [];
  selectedContactId: number | null = null;
  loading = false;
  searchTerm = '';
  showAddContact = false;

  newContact: { phoneNumber: string; name: string } = {
    phoneNumber: '',
    name: '',
  };

  // WebSocket subscriptions
  private contactSubscriptions = new Map<string, { message: Subscription; status: Subscription }>();

  ngOnInit() {
    this.loadContacts();
  }

  ngOnDestroy() {
    // Clean up all subscriptions
    this.contactSubscriptions.forEach((subs) => {
      subs.message.unsubscribe();
      subs.status.unsubscribe();
    });
    this.contactSubscriptions.clear();
  }

  loadContacts() {
    this.loading = true;
    this.contactService.getAllContacts(0, 100).subscribe({
      next: (contacts: Contact[]) => {
        this.contacts = contacts.map(c => ({
        ...c,
        unreadCount: c.unread || 0
      })) as ExtendedContact[];
        this.loadLastMessagesForAllContacts();
        this.filteredContacts = [...this.contacts];
        this.loading = false;
        this.setupWebSocketForAllContacts();
      },
      error: (err) => {
        console.error('Error loading contacts:', err);
        this.loading = false;
        alert('Failed to load contacts');
      },
    });
  }

  setupWebSocketForAllContacts() {
    this.contacts.forEach((contact) => {
      if (!this.contactSubscriptions.has(contact.phoneNumber)) {
        this.subscribeToContact(contact.phoneNumber);
      }
    });
  }

  subscribeToContact(phoneNumber: string) {
    const messageSub = this.websocketService.subscribeToMessages(phoneNumber).subscribe((message) => {
      if (message) {
        console.log('Sidebar received message:', message);
        this.handleIncomingMessage(message, phoneNumber);
      }
    });

    const statusSub = this.websocketService.subscribeToStatus(phoneNumber).subscribe((status) => {
      if (status) {
        console.log('Sidebar received status:', status);
        this.handleStatusUpdate(status, phoneNumber);
      }
    });

    this.contactSubscriptions.set(phoneNumber, { message: messageSub, status: statusSub });
  }

  handleIncomingMessage(message: ChatMessage, phoneNumber: string) {
    const contact = this.contacts.find((c) => c.phoneNumber === phoneNumber);
    if (contact) {
      contact.lastMessage = this.getMessagePreview(message);
      contact.lastMessageTime = message.createdAt;

      if (message.direction === 'RECEIVED' && this.selectedContactId !== contact.id) {
        contact.unreadCount = (contact.unreadCount || 0) + 1;
      }

      this.moveContactToTop(contact);
      this.filterContacts();

      if (this.selectedContactId !== contact.id) {
        this.playNotificationSound();
      }
    }
  }

  handleStatusUpdate(status: any, phoneNumber: string) {
    const contact = this.contacts.find((c) => c.phoneNumber === phoneNumber);
    if (contact && contact.lastMessage) {
      console.log(`Status updated for ${phoneNumber}: ${status.status}`);
    }
  }

  moveContactToTop(contact: ExtendedContact) {
    const index = this.contacts.indexOf(contact);
    if (index > -1) {
      this.contacts.splice(index, 1);
    }
    this.contacts.unshift(contact);
  }

  playNotificationSound() {
    try {
      const audio = new Audio('assets/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch((err) => console.log('Could not play sound:', err));
    } catch (error) {
      console.log('Notification sound not available');
    }
  }

  loadLastMessagesForAllContacts() {
    const requests: Observable<ExtendedContact>[] = this.contacts.map((contact) =>
      this.messageService.getLastMessageForContact(contact.phoneNumber).pipe(
        map((message: ChatMessage | null) => ({
          ...contact,
          lastMessage: message ? this.getMessagePreview(message) : undefined,
          lastMessageTime: message ? message.createdAt : undefined,
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
      },
    });
  }

  getMessagePreview(message: ChatMessage): string {
    if (message.type === 'text' && message.textBody) return this.truncateText(message.textBody);
    if (message.type === 'template' && message.templateBody) return this.truncateText(message.templateBody);
    if (message.type === 'image') return message.caption ? this.truncateText(message.caption) : '📷 image';
    if (message.type==='audio') return 'audio';
    return 'Message';
  }

  filterContacts() {
    if (!this.searchTerm.trim()) {
      this.filteredContacts = [...this.contacts];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredContacts = this.contacts.filter(
      (c) => c.name?.toLowerCase().includes(term) || c.phoneNumber.includes(term)
    );
  }

  selectContact(contact: ExtendedContact) {
    console.log('=== SELECTING CONTACT ===');
    console.log('Contact ID:', contact.id);
    console.log('Contact Phone:', contact.phoneNumber);
    console.log('Previous Selected ID:', this.selectedContactId);

    contact.unreadCount = 0;
    this.selectedContactId = contact.id;

    const freshContact: ExtendedContact = {
      id: contact.id,
      phoneNumber: contact.phoneNumber,
      name: contact.name,
      lastMessage: contact.lastMessage,
      lastMessageTime: contact.lastMessageTime,
      unread: 0,
      unreadCount: 0
    };

    console.log('Emitting fresh contact:', freshContact);
    this.contactSelected.emit(null);

    setTimeout(() => {
      this.contactSelected.emit(freshContact);
      console.log('Contact emitted successfully');
    }, 10);

    this.markContactAsRead(contact.phoneNumber);
  }

  markContactAsRead(phoneNumber: string) {
    this.messageService.markMessagesAsRead(phoneNumber).subscribe({
      next: () => console.log(`Messages marked as read for ${phoneNumber}`),
      error: (err) => console.error('Error marking messages as read:', err),
    });
  }

  addContact() {
    if (!this.newContact.phoneNumber) {
      alert('Please enter a phone number');
      return;
    }

    this.contactService.addContact(this.newContact.phoneNumber, this.newContact.name).subscribe({
      next: (contact: Contact) => {
        const extendedContact = contact as ExtendedContact;
        this.contacts.unshift(extendedContact);
        this.filteredContacts = [...this.contacts];
        this.subscribeToContact(contact.phoneNumber);
        this.cancelAddContact();
      },
      error: (err) => {
        alert(err.error?.error || 'Error adding contact');
        console.error(err);
      },
    });
  }

  cancelAddContact() {
    this.showAddContact = false;
    this.newContact = { phoneNumber: '', name: '' };
  }

  deleteContact(event: Event, id: number) {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this contact?')) return;

    const contact = this.contacts.find((c) => c.id === id);

    this.contactService.deleteContact(id).subscribe({
      next: () => {
        if (contact) {
          const subs = this.contactSubscriptions.get(contact.phoneNumber);
          if (subs) {
            subs.message.unsubscribe();
            subs.status.unsubscribe();
            this.contactSubscriptions.delete(contact.phoneNumber);
          }
        }

        this.contacts = this.contacts.filter((c) => c.id !== id);
        this.filteredContacts = [...this.contacts];

        if (this.selectedContactId === id) {
          this.selectedContactId = null;
          this.contactSelected.emit(null);
        }
      },
      error: (err) => {
        alert('Error deleting contact');
        console.error(err);
      },
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
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
