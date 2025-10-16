import { Component, OnInit } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TemplateService } from '../../services/template.service';
import { WhatsAppTemplatesResponseDTO } from '../../dto/whatsapp-templates.dto';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.css']
})
export class TemplateListComponent implements OnInit {

  templates: WhatsAppTemplatesResponseDTO['data'] = [];
  errorMsg = '';
  loading = false;

  constructor(private templateService: TemplateService) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates() {
    this.loading = true;
    this.errorMsg = '';
    this.templateService.getAllTemplates().subscribe({
      next: (res) => {
        this.templates = res?.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = `❌ Error ${err.status}: ${err.error?.message || err.message || err.statusText}`;
        this.loading = false;
      }
    });
  }

  /**
   * عرض محتوى الـ component بناءً على النوع/الصيغة.
   * يدعم fallbacks لمفاتيح مختلفة (text, body, وغيرها).
   */
  getComponentContent(component: any): string {
    if (!component) return '';

    const format = component.format || component.format_type || '';
    // لو header/body ونوعه وسائط
    if (component.type === 'BODY' || component.type === 'HEADER') {
      if (format === 'IMAGE') return '[Image]';
      if (format === 'VIDEO') return '[Video]';
      if (format === 'DOCUMENT') return '[Document]';
      // نص أساسي قد يكون في properties مختلفة
      return component.text || component.body || component.payload || '';
    }

    // Buttons/footer/others - ارجع نص إن وُجد
    if (component.text) return component.text;
    return '';
  }

  /* ---------- Helpers to safely read example fields (handle multiple naming styles) ---------- */

  getExampleHeaderTexts(example: any): string[] {
    if (!example) return [];
    // possible names: headerTexts, header_text, header_texts
    return example.headerTexts || example['header_text'] || example['header_texts'] || [];
  }

  getExampleBodyTexts(example: any): any[] {
    if (!example) return [];
    // possible names: bodyTexts, body_text, body_texts
    return example.bodyTexts || example['body_text'] || example['body_texts'] || [];
  }

  getExampleHeaderHandles(example: any): string[] {
    if (!example) return [];
    return example.headerHandles || example['header_handle'] || example['header_handles'] || [];
  }

  /**
   * Normalize a body row for display:
   * - If it's an array => join with comma
   * - If it's string => return
   * - Otherwise stringify safely
   */
  formatBodyRow(row: any): string {
    if (row == null) return '';
    if (Array.isArray(row)) return row.join(', ');
    if (typeof row === 'string') return row;
    try {
      return JSON.stringify(row);
    } catch {
      return String(row);
    }
  }
  getStatusClass(status: string | undefined): string {
  if (!status) return '';
  switch (status.toLowerCase()) {
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    case 'pending': return 'pending';
    default: return '';
  }
}

}
