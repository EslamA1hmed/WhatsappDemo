"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const core_1 = require("@angular/core");
const common_1 = require("@angular/common");
const stompjs_1 = require("@stomp/stompjs");
const sockjs_client_1 = __importDefault(require("sockjs-client"));
const rxjs_1 = require("rxjs");
let WebSocketService = class WebSocketService {
    constructor(platformId) {
        this.platformId = platformId;
        this.client = null;
        this.connected = new rxjs_1.BehaviorSubject(false);
        this.subscriptions = {}; // Track subscription count
        if ((0, common_1.isPlatformBrowser)(this.platformId)) {
            this.client = new stompjs_1.Client({
                webSocketFactory: () => new sockjs_client_1.default('http://localhost:8080/ws'),
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                debug: (str) => console.log(str),
                splitLargeFrames: true
            });
            this.client.onConnect = () => {
                console.log('Connected to WebSocket');
                this.connected.next(true);
            };
            this.client.onStompError = (frame) => {
                console.error('STOMP error:', frame);
                this.connected.next(false);
            };
            this.client.activate();
        }
    }
    getConnectedStatus() {
        return this.connected.asObservable();
    }
    subscribeToMessages(phoneNumber) {
        if (!(0, common_1.isPlatformBrowser)(this.platformId) || !this.client) {
            return (0, rxjs_1.of)();
        }
        if (!this.subscriptions[phoneNumber]) {
            this.subscriptions[phoneNumber] = { messages: 0, status: 0 };
        }
        this.subscriptions[phoneNumber].messages++;
        return new rxjs_1.Observable(observer => {
            const subscription = this.client.subscribe(`/topic/chat/${phoneNumber}`, (msg) => {
                const body = JSON.parse(msg.body);
                const message = {
                    id: body.id || 0,
                    messageId: body.messageId,
                    direction: body.direction,
                    status: body.status,
                    to: body.to,
                    from: body.from,
                    type: body.type,
                    textBody: body.textBody,
                    templateName: body.templateName,
                    templateBody: body.templateBody,
                    templateHeader: body.templateHeader,
                    templateFooter: body.templateFooter,
                    mediaId: body.mediaId,
                    mimeType: body.mimeType,
                    mediaUrl: body.mediaUrl,
                    width: body.width,
                    height: body.height,
                    thumbnail: body.thumbnail,
                    caption: body.caption,
                    isPlaying: body.isPlaying,
                    currentTime: body.currentTime,
                    duration: body.duration,
                    filename: body.filename,
                    progressPercent: body.progressPercent,
                    contextMessageId: body.contextMessageId,
                    contextFrom: body.contextFrom,
                    buttons: body.buttons,
                    createdAt: body.createdAt
                };
                observer.next(message);
            });
            return () => {
                subscription.unsubscribe();
                this.subscriptions[phoneNumber].messages--;
                if (this.subscriptions[phoneNumber].messages === 0 && this.subscriptions[phoneNumber].status === 0) {
                    delete this.subscriptions[phoneNumber];
                }
            };
        });
    }
    subscribeToStatus(phoneNumber) {
        if (!(0, common_1.isPlatformBrowser)(this.platformId) || !this.client) {
            return (0, rxjs_1.of)();
        }
        if (!this.subscriptions[phoneNumber]) {
            this.subscriptions[phoneNumber] = { messages: 0, status: 0 };
        }
        this.subscriptions[phoneNumber].status++;
        return new rxjs_1.Observable(observer => {
            const subscription = this.client.subscribe(`/topic/status/${phoneNumber}`, (msg) => {
                const body = JSON.parse(msg.body);
                observer.next(body);
            });
            return () => {
                subscription.unsubscribe();
                this.subscriptions[phoneNumber].status--;
                if (this.subscriptions[phoneNumber].messages === 0 && this.subscriptions[phoneNumber].status === 0) {
                    delete this.subscriptions[phoneNumber];
                }
            };
        });
    }
    unsubscribeFromContact(phoneNumber) {
        if (this.subscriptions[phoneNumber]) {
            delete this.subscriptions[phoneNumber];
        }
    }
    disconnect() {
        if ((0, common_1.isPlatformBrowser)(this.platformId) && this.client) {
            this.client.deactivate();
            this.connected.next(false);
        }
    }
};
WebSocketService = __decorate([
    (0, core_1.Injectable)({
        providedIn: 'root'
    }),
    __param(0, (0, core_1.Inject)(core_1.PLATFORM_ID))
], WebSocketService);
exports.WebSocketService = WebSocketService;
