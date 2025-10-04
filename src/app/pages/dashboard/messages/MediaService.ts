import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private apiUrl = '/api/media'; // Update with your backend URL

  constructor(private http: HttpClient) {}

  /**
   * Download media from Meta by ID and convert to blob URL for display
   * This is used when mediaId is provided (media stored on Meta's servers)
   * Returns a blob URL that can be used directly in <img> or <video> src
   */

  /**
   * Download media by ID and convert to blob URL
   * Used when mediaId is provided (media stored on Meta servers)
   */
  downloadMediaAsBlob(mediaId: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/download/${mediaId}`, {
      responseType: 'blob'
    }).pipe(
      map(blob => {
        // Create a blob URL for the downloaded media
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
   * Upload media file
   */
  uploadMedia(file: File, type: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post(`${this.apiUrl}/upload`, formData).pipe(
      catchError(error => {
        console.error('Error uploading media:', error);
        return throwError(() => error);
      })
    );
  }
}