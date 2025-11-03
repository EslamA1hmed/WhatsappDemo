"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const core_1 = require("@angular/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let MediaService = class MediaService {
    constructor(http) {
        this.http = http;
        this.apiUrl = 'http://localhost:8080/api/media';
    }
    uploadAndPrepareMedia(file) {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/upload-and-prepare`, formData).pipe((0, operators_1.catchError)(error => {
            console.error('Error preparing media:', error);
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
    /**
     * Download media by ID and convert to blob URL
     * Used when mediaId is provided (media stored on Meta servers)
     */
    downloadMediaAsBlob(mediaId) {
        return this.http.get(`${this.apiUrl}/download/${mediaId}`, {
            responseType: 'blob'
        }).pipe((0, operators_1.map)(blob => {
            return URL.createObjectURL(blob);
        }), (0, operators_1.catchError)(error => {
            console.error('Error downloading media:', error);
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
    /**
     * Download media by ID (raw blob)
     */
    downloadMedia(mediaId) {
        return this.http.get(`${this.apiUrl}/download/${mediaId}`, {
            responseType: 'blob'
        }).pipe((0, operators_1.catchError)(error => {
            console.error('Error downloading media:', error);
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
    /**
     * Upload media file from local device
     */
    uploadMedia(file, type) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        return this.http.post(`${this.apiUrl}/upload`, formData).pipe((0, operators_1.catchError)(error => {
            console.error('Error uploading media:', error);
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
    /**
     * Create local preview URL for file
     */
    createPreviewUrl(file) {
        return URL.createObjectURL(file);
    }
    /**
     * Revoke preview URL to free memory
     */
    revokePreviewUrl(url) {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }
    /**
     * Validate file size (max 16MB for WhatsApp)
     */
    validateFileSize(file, maxSizeMB = 16) {
        const maxSize = maxSizeMB * 1024 * 1024;
        return file.size <= maxSize;
    }
    /**
     * Validate file type
     */
    validateFileType(file, type) {
        var _a;
        const validTypes = {
            image: ['image/jpeg', 'image/png', 'image/webp'],
            video: ['video/mp4', 'video/3gpp'],
            document: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/msword',
                'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            audio: ['audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/amr', 'audio/ogg', 'audio/opus']
        };
        return ((_a = validTypes[type]) === null || _a === void 0 ? void 0 : _a.includes(file.type)) || false;
    }
    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
};
MediaService = __decorate([
    (0, core_1.Injectable)({
        providedIn: 'root'
    })
], MediaService);
exports.MediaService = MediaService;
