import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface UploadResponse {
  id: string;
  url: string;
  mimeType: string;
  fileSize: number;
}
export interface PreparedMediaResponse {
  mediaId: string;
  thumbnail: string;
  width: number;
  height: number;
}
@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private apiUrl = 'http://localhost:8080/api/media';

  constructor(private http: HttpClient) {}

  uploadAndPrepareMedia(file: File): Observable<PreparedMediaResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<PreparedMediaResponse>(`${this.apiUrl}/upload-and-prepare`, formData).pipe(
      catchError(error => {
        console.error('Error preparing media:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Download media by ID and convert to blob URL
   * Used when mediaId is provided (media stored on Meta servers)
   */
  downloadMediaAsBlob(mediaId: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/download/${mediaId}`, {
      responseType: 'blob'
    }).pipe(
      map(blob => {
        return URL.createObjectURL(blob);
      }),
      catchError(error => {
        console.error('Error downloading media:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Download media by ID (raw blob)
   */
  downloadMedia(mediaId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${mediaId}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Error downloading media:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload media file from local device
   */
  uploadMedia(file: File, type: 'image' | 'video' | 'document'): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData).pipe(
      catchError(error => {
        console.error('Error uploading media:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create local preview URL for file
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   */
  revokePreviewUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Validate file size (max 16MB for WhatsApp)
   */
  validateFileSize(file: File, maxSizeMB: number = 16): boolean {
    const maxSize = maxSizeMB * 1024 * 1024;
    return file.size <= maxSize;
  }

  /**
   * Validate file type
   */
  validateFileType(file: File, type: 'image' | 'video' | 'document'): boolean {
    const validTypes: { [key: string]: string[] } = {
      image: ['image/jpeg', 'image/png', 'image/webp'],
      video: ['video/mp4', 'video/3gpp'],
      document: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/msword', 
                 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    };

    return validTypes[type]?.includes(file.type) || false;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}