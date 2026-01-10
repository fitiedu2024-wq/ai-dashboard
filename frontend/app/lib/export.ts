/**
 * Export utilities for PDF and CSV generation
 */

// HTML entity encoding to prevent XSS
function escapeHtml(unsafe: string | undefined | null): string {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Export data to CSV
export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const cell = row[header];
        // Handle cells with commas or quotes
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

// Export keywords to CSV
export function exportKeywordsToCSV(keywords: any[], domain: string): void {
  const data = keywords.map(kw => ({
    Keyword: kw.term || kw.keyword,
    Priority: kw.priority,
    Difficulty: kw.difficulty,
    Volume: kw.volume,
    CPC: kw.cpc || 'N/A',
    'Current Rank': kw.current_rank || 'Not ranking'
  }));

  exportToCSV(data, `keywords-${domain}-${getDateString()}`);
}

// Export SEO comparison to CSV
export function exportSEOComparisonToCSV(yourSite: any, competitors: Record<string, any>, domain: string): void {
  const data = [
    {
      Domain: domain,
      'SEO Score': yourSite.avg_seo_score,
      'Pages Crawled': yourSite.total_pages,
      'Avg Word Count': yourSite.avg_word_count,
      'Alt Coverage %': yourSite.avg_alt_coverage,
      'Schema Coverage %': yourSite.schema_coverage,
      'Mobile Coverage %': yourSite.mobile_coverage || 'N/A',
      Type: 'Your Site'
    },
    ...Object.entries(competitors).map(([compDomain, compData]: [string, any]) => ({
      Domain: compDomain,
      'SEO Score': compData.avg_seo_score,
      'Pages Crawled': compData.total_pages,
      'Avg Word Count': compData.avg_word_count,
      'Alt Coverage %': compData.avg_alt_coverage,
      'Schema Coverage %': compData.schema_coverage,
      'Mobile Coverage %': compData.mobile_coverage || 'N/A',
      Type: 'Competitor'
    }))
  ];

  exportToCSV(data, `seo-comparison-${domain}-${getDateString()}`);
}

// Export activity logs to CSV
export function exportActivityLogsToCSV(logs: any[]): void {
  const data = logs.map(log => ({
    'Date': new Date(log.created_at).toLocaleString(),
    'User': log.user_email,
    'Action': log.action,
    'Details': log.details || '',
    'IP Address': log.ip_address || '',
    'Location': log.geo_location || ''
  }));

  exportToCSV(data, `activity-logs-${getDateString()}`);
}

// Export users list to CSV
export function exportUsersToCSV(users: any[]): void {
  const data = users.map(user => ({
    'Email': user.email,
    'Role': user.role || 'user',
    'Quota': user.quota,
    'Status': user.is_active ? 'Active' : 'Inactive',
    'Last Login': user.last_login ? new Date(user.last_login).toLocaleString() : 'Never',
    'Last IP': user.last_ip || '',
    'Location': user.last_geo || '',
    'Created': user.created_at ? new Date(user.created_at).toLocaleString() : ''
  }));

  exportToCSV(data, `users-${getDateString()}`);
}

// Generate simple PDF report
export function exportToPDF(title: string, content: string, filename: string): void {
  // Escape title to prevent XSS
  const safeTitle = escapeHtml(title);

  // Create printable HTML content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${safeTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        h1 {
          color: #7C3AED;
          border-bottom: 2px solid #EC4899;
          padding-bottom: 10px;
        }
        h2 {
          color: #7C3AED;
          margin-top: 30px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #7C3AED;
        }
        .date {
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background: linear-gradient(to right, #7C3AED, #EC4899);
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .metric {
          display: inline-block;
          padding: 10px 20px;
          background: #f3f4f6;
          border-radius: 8px;
          margin: 5px;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #7C3AED;
        }
        .metric-label {
          font-size: 12px;
          color: #666;
        }
        .issue {
          padding: 10px;
          background: #FEF3C7;
          border-left: 4px solid #F59E0B;
          margin: 10px 0;
        }
        .recommendation {
          padding: 10px;
          background: #DBEAFE;
          border-left: 4px solid #3B82F6;
          margin: 10px 0;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">AI Grinners</div>
        <div class="date">Generated: ${new Date().toLocaleString()}</div>
      </div>
      <h1>${safeTitle}</h1>
      ${content}
      <div class="footer">
        <p>Generated by AI Grinners Marketing Intelligence Platform</p>
        <p>© ${new Date().getFullYear()} AI Grinners. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

// Generate SEO Report PDF
export function exportSEOReportToPDF(yourSite: any, competitors: Record<string, any>, insights: string[], domain: string): void {
  // Escape all user-provided content to prevent XSS
  const safeDomain = escapeHtml(domain);

  const metricsHTML = `
    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0;">
      <div class="metric">
        <div class="metric-value">${escapeHtml(yourSite.avg_seo_score)}</div>
        <div class="metric-label">SEO Score</div>
      </div>
      <div class="metric">
        <div class="metric-value">${escapeHtml(yourSite.total_pages)}</div>
        <div class="metric-label">Pages Analyzed</div>
      </div>
      <div class="metric">
        <div class="metric-value">${escapeHtml(yourSite.avg_word_count)}</div>
        <div class="metric-label">Avg Words/Page</div>
      </div>
      <div class="metric">
        <div class="metric-value">${escapeHtml(yourSite.avg_alt_coverage)}%</div>
        <div class="metric-label">Alt Coverage</div>
      </div>
      <div class="metric">
        <div class="metric-value">${escapeHtml(yourSite.schema_coverage)}%</div>
        <div class="metric-label">Schema Coverage</div>
      </div>
    </div>
  `;

  const competitorsHTML = Object.keys(competitors).length > 0 ? `
    <h2>Competitor Analysis</h2>
    <table>
      <thead>
        <tr>
          <th>Domain</th>
          <th>SEO Score</th>
          <th>Pages</th>
          <th>Avg Words</th>
          <th>Alt %</th>
          <th>Schema %</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(competitors).map(([compDomain, data]: [string, any]) => `
          <tr>
            <td>${escapeHtml(compDomain)}</td>
            <td>${escapeHtml(data.avg_seo_score)}</td>
            <td>${escapeHtml(data.total_pages)}</td>
            <td>${escapeHtml(data.avg_word_count)}</td>
            <td>${escapeHtml(data.avg_alt_coverage)}%</td>
            <td>${escapeHtml(data.schema_coverage)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '';

  const insightsHTML = insights.length > 0 ? `
    <h2>Key Insights</h2>
    ${insights.map(insight => `<div class="recommendation">${escapeHtml(insight)}</div>`).join('')}
  ` : '';

  const issuesHTML = yourSite.issues?.length > 0 ? `
    <h2>Issues Found</h2>
    ${yourSite.issues.map((issue: string) => `<div class="issue">${escapeHtml(issue)}</div>`).join('')}
  ` : '';

  const recommendationsHTML = yourSite.recommendations?.length > 0 ? `
    <h2>Recommendations</h2>
    ${yourSite.recommendations.map((rec: string) => `<div class="recommendation">${escapeHtml(rec)}</div>`).join('')}
  ` : '';

  const content = `
    <h2>Your Site: ${safeDomain}</h2>
    ${metricsHTML}
    ${competitorsHTML}
    ${insightsHTML}
    ${issuesHTML}
    ${recommendationsHTML}
  `;

  exportToPDF(`SEO Analysis Report - ${safeDomain}`, content, `seo-report-${domain}`);
}

// Helper: Download blob as file
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper: Get formatted date string
function getDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}

// Share via Web Share API
export async function shareReport(title: string, text: string, url?: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
