#!/bin/bash

set -e

echo "🎯 DEEP ANALYSIS ENHANCEMENT"
echo "=============================="

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

cd backend

# Enhanced scraper with detailed metrics
cat > scraper.py << 'PYTHON'
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
from typing import Dict, List
import re

def analyze_page_technical_seo(soup, url: str) -> Dict:
    """Deep technical SEO analysis"""
    
    # Title analysis
    title = soup.find('title')
    title_text = title.text.strip() if title else ""
    title_score = 0
    if 30 <= len(title_text) <= 60:
        title_score = 100
    elif len(title_text) < 30:
        title_score = 50
    else:
        title_score = 70
    
    # Meta description
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    desc_text = meta_desc.get('content', '') if meta_desc else ""
    desc_score = 100 if 120 <= len(desc_text) <= 160 else 50
    
    # Headers structure
    h1_tags = soup.find_all('h1')
    h2_tags = soup.find_all('h2')
    h3_tags = soup.find_all('h3')
    
    headers_score = 100 if len(h1_tags) == 1 else 50
    
    # Images
    images = soup.find_all('img')
    images_with_alt = [img for img in images if img.get('alt')]
    alt_coverage = round((len(images_with_alt) / len(images) * 100) if images else 0, 1)
    
    # Links
    internal_links = []
    external_links = []
    for link in soup.find_all('a', href=True):
        href = link['href']
        full_url = urljoin(url, href)
        if urlparse(full_url).netloc == urlparse(url).netloc:
            internal_links.append(full_url)
        else:
            external_links.append(full_url)
    
    # Content analysis
    text = soup.get_text(separator=' ', strip=True)
    words = text.split()
    word_count = len(words)
    
    # Readability (simplified)
    sentences = re.split(r'[.!?]+', text)
    avg_words_per_sentence = word_count / max(len(sentences), 1)
    readability_score = 100 if 15 <= avg_words_per_sentence <= 25 else 70
    
    # Schema markup
    has_schema = bool(soup.find('script', type='application/ld+json'))
    
    # Mobile viewport
    viewport = soup.find('meta', attrs={'name': 'viewport'})
    mobile_friendly = bool(viewport)
    
    # Open Graph
    og_tags = soup.find_all('meta', property=re.compile(r'^og:'))
    has_og = len(og_tags) > 0
    
    # Canonical
    canonical = soup.find('link', rel='canonical')
    has_canonical = bool(canonical)
    
    # Calculate overall page score
    overall_score = round((
        title_score * 0.20 +
        desc_score * 0.15 +
        headers_score * 0.15 +
        (alt_coverage * 0.10) +
        readability_score * 0.15 +
        (100 if has_schema else 0) * 0.10 +
        (100 if mobile_friendly else 0) * 0.10 +
        (100 if has_og else 0) * 0.05
    ))
    
    return {
        'title': {
            'text': title_text,
            'length': len(title_text),
            'score': title_score,
            'recommendation': 'Good' if title_score == 100 else 'Optimize to 30-60 chars'
        },
        'meta_description': {
            'text': desc_text,
            'length': len(desc_text),
            'score': desc_score,
            'recommendation': 'Good' if desc_score == 100 else 'Optimize to 120-160 chars'
        },
        'headers': {
            'h1_count': len(h1_tags),
            'h2_count': len(h2_tags),
            'h3_count': len(h3_tags),
            'score': headers_score,
            'h1_texts': [h1.text.strip() for h1 in h1_tags][:3]
        },
        'images': {
            'total': len(images),
            'with_alt': len(images_with_alt),
            'alt_coverage': alt_coverage,
            'recommendation': 'Excellent' if alt_coverage > 90 else 'Add alt text to more images'
        },
        'links': {
            'internal': len(set(internal_links)),
            'external': len(set(external_links))
        },
        'content': {
            'word_count': word_count,
            'sentences': len(sentences),
            'avg_words_per_sentence': round(avg_words_per_sentence, 1),
            'readability_score': readability_score
        },
        'technical': {
            'has_schema': has_schema,
            'mobile_friendly': mobile_friendly,
            'has_open_graph': has_og,
            'has_canonical': has_canonical
        },
        'overall_score': overall_score
    }

def get_page_content(url: str) -> Dict:
    """Enhanced page content extraction"""
    try:
        if not url.startswith('http'):
            url = 'https://' + url
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'lxml')
        
        # Get detailed analysis
        analysis = analyze_page_technical_seo(soup, url)
        
        # Extract internal links for crawling
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(url, href)
            if urlparse(full_url).netloc == urlparse(url).netloc:
                links.append(full_url)
        
        return {
            'url': url,
            'status': 'success',
            'analysis': analysis,
            'internal_links': list(set(links))[:10]
        }
    except Exception as e:
        return {
            'url': url,
            'status': 'error',
            'error': str(e)
        }

def crawl_site(domain: str, max_pages: int = 20) -> Dict:
    """Enhanced site crawling with detailed analysis"""
    if not domain.startswith('http'):
        base_url = 'https://' + domain
    else:
        base_url = domain
    
    visited = set()
    to_visit = [base_url]
    pages_data = []
    
    while to_visit and len(pages_data) < max_pages:
        url = to_visit.pop(0)
        if url in visited:
            continue
        
        visited.add(url)
        page_data = get_page_content(url)
        
        if page_data['status'] == 'success':
            pages_data.append(page_data)
            
            # Add more links to crawl
            if len(pages_data) < max_pages:
                for link in page_data.get('internal_links', [])[:3]:
                    if link not in visited and link not in to_visit:
                        to_visit.append(link)
        
        time.sleep(0.5)
    
    # Calculate aggregate stats
    if pages_data:
        analyses = [p['analysis'] for p in pages_data]
        
        avg_score = round(sum(a['overall_score'] for a in analyses) / len(analyses))
        avg_word_count = round(sum(a['content']['word_count'] for a in analyses) / len(analyses))
        avg_title_length = round(sum(a['title']['length'] for a in analyses) / len(analyses))
        avg_alt_coverage = round(sum(a['images']['alt_coverage'] for a in analyses) / len(analyses), 1)
        
        # Technical features
        schema_coverage = round(sum(1 for a in analyses if a['technical']['has_schema']) / len(analyses) * 100, 1)
        mobile_friendly_pct = round(sum(1 for a in analyses if a['technical']['mobile_friendly']) / len(analyses) * 100, 1)
        
        # Issues & Recommendations
        issues = []
        recommendations = []
        
        if avg_score < 70:
            issues.append("Overall SEO score is below optimal")
            recommendations.append("Focus on improving meta tags and content structure")
        
        if avg_alt_coverage < 80:
            issues.append(f"Only {avg_alt_coverage}% of images have alt text")
            recommendations.append("Add descriptive alt text to all images")
        
        if schema_coverage < 50:
            issues.append("Low schema markup usage")
            recommendations.append("Implement structured data (Schema.org) for better search visibility")
        
        if mobile_friendly_pct < 100:
            issues.append("Not all pages are mobile-friendly")
            recommendations.append("Add viewport meta tag to all pages")
        
        return {
            'total_pages': len(pages_data),
            'avg_seo_score': avg_score,
            'avg_word_count': avg_word_count,
            'avg_title_length': avg_title_length,
            'avg_alt_coverage': avg_alt_coverage,
            'schema_coverage': schema_coverage,
            'mobile_friendly': mobile_friendly_pct,
            'pages': pages_data,
            'issues': issues,
            'recommendations': recommendations
        }
    
    return {
        'total_pages': 0,
        'avg_seo_score': 0,
        'error': 'Could not crawl site'
    }

def find_social_accounts(domain: str) -> Dict:
    """Find social media accounts"""
    try:
        url = 'https://' + domain if not domain.startswith('http') else domain
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'lxml')
        
        social = {
            'facebook': None,
            'tiktok': None,
            'instagram': None,
            'twitter': None,
            'linkedin': None
        }
        
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            if 'facebook.com' in href:
                social['facebook'] = href
            elif 'tiktok.com' in href:
                parts = href.split('tiktok.com/')
                if len(parts) > 1:
                    username = parts[1].split('?')[0].strip('/@')
                    social['tiktok'] = username
            elif 'instagram.com' in href:
                social['instagram'] = href
            elif 'twitter.com' in href or 'x.com' in href:
                social['twitter'] = href
            elif 'linkedin.com' in href:
                social['linkedin'] = href
        
        return social
    except:
        return {'facebook': None, 'tiktok': None, 'instagram': None, 'twitter': None, 'linkedin': None}
PYTHON

echo -e "${GREEN}✅ Enhanced scraper created${NC}"

cd ../frontend

# Enhanced Deep Analysis page
cat > "app/(dashboard)/dashboard/analyze/page.tsx" << 'TSX'
'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function DeepAnalyze() {
  const [domain, setDomain] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());

  const startAnalysis = async () => {
    setLoading(true);
    setProgress(0);
    setResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ai-dashboard-backend-7dha.onrender.com/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          domain,
          competitors: competitors.split(',').map(c => c.trim()).filter(c => c),
          max_pages: 20
        })
      });
      
      const data = await response.json();
      setResult(data);
      setProgress(100);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (loading && progress < 90) {
      const timer = setTimeout(() => setProgress(p => Math.min(p + 10, 90)), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, progress]);

  const togglePage = (index: number) => {
    setExpandedPages(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Deep Analysis
        </h1>
        <p className="text-gray-200 text-lg mb-8">Professional SEO & Content Intelligence</p>
        
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-3 text-purple-300">Your Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 text-pink-300">Competitors (comma-separated)</label>
              <input
                type="text"
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder="competitor1.com, competitor2.com"
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>
          
          <button
            onClick={startAnalysis}
            disabled={loading || !domain}
            className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-2xl transition-all disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><Search className="w-5 h-5" />Start Deep Analysis</>}
          </button>

          {loading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Analysis Progress</span>
                <span className="text-sm font-bold text-purple-400">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                  style={{width: `${progress}%`}}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Crawling pages, analyzing SEO metrics, and generating insights...</p>
            </div>
          )}
        </div>

        {result?.data && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="glass rounded-2xl p-6 border-2 border-green-400/50">
              <CheckCircle className="w-6 h-6 text-green-400 inline mr-3" />
              <span className="font-bold text-white text-xl">Analysis Complete! Found {result.data.your_site?.total_pages || 0} pages</span>
            </div>

            {/* Overall Stats */}
            <div className="glass rounded-2xl p-8 border-2 border-purple-400/50">
              <h3 className="text-2xl font-bold text-white mb-6">📊 Your Site Overview: {domain}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-400 mb-2">{result.data.your_site?.total_pages || 0}</div>
                  <div className="text-sm text-gray-400">Pages Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-pink-400 mb-2">{result.data.your_site?.avg_seo_score || 0}</div>
                  <div className="text-sm text-gray-400">SEO Score</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-400 mb-2">{result.data.your_site?.avg_word_count || 0}</div>
                  <div className="text-sm text-gray-400">Avg Words/Page</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-400 mb-2">{result.data.your_site?.avg_alt_coverage || 0}%</div>
                  <div className="text-sm text-gray-400">Alt Text Coverage</div>
                </div>
              </div>
            </div>

            {/* Technical SEO */}
            <div className="glass rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">🔧 Technical SEO</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white/5 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-green-400">{result.data.your_site?.schema_coverage || 0}%</div>
                  <div className="text-sm text-gray-400 mt-2">Schema Markup</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-400">{result.data.your_site?.mobile_friendly || 0}%</div>
                  <div className="text-sm text-gray-400 mt-2">Mobile Friendly</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-purple-400">{result.data.your_site?.avg_title_length || 0}</div>
                  <div className="text-sm text-gray-400 mt-2">Avg Title Length</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-pink-400">{result.data.your_site?.total_pages || 0}</div>
                  <div className="text-sm text-gray-400 mt-2">Total Pages</div>
                </div>
              </div>
            </div>

            {/* Issues & Recommendations */}
            {result.data.your_site?.issues && result.data.your_site.issues.length > 0 && (
              <div className="glass rounded-2xl p-8 border-l-4 border-yellow-500">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  Issues Found
                </h3>
                <div className="space-y-3">
                  {result.data.your_site.issues.map((issue: string, idx: number) => (
                    <div key={idx} className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                      <div className="text-yellow-300">⚠️ {issue}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.data.your_site?.recommendations && result.data.your_site.recommendations.length > 0 && (
              <div className="glass rounded-2xl p-8 border-l-4 border-green-500">
                <h3 className="text-2xl font-bold text-white mb-6">💡 Recommendations</h3>
                <div className="space-y-3">
                  {result.data.your_site.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                      <div className="text-green-300">✓ {rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Page Details */}
            {result.data.your_site?.pages && result.data.your_site.pages.length > 0 && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">📄 Page-by-Page Analysis</h3>
                <div className="space-y-3">
                  {result.data.your_site.pages.map((page: any, idx: number) => (
                    <div key={idx} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                      <div 
                        className="p-5 cursor-pointer hover:bg-white/10 transition-all flex items-center justify-between"
                        onClick={() => togglePage(idx)}
                      >
                        <div className="flex-1">
                          <div className="font-bold text-white mb-1">{page.analysis?.title?.text || page.url}</div>
                          <div className="text-sm text-gray-400">{page.url}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-400">{page.analysis?.overall_score || 0}</div>
                            <div className="text-xs text-gray-400">SEO Score</div>
                          </div>
                          {expandedPages.has(idx) ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>
                      
                      {expandedPages.has(idx) && page.analysis && (
                        <div className="p-5 bg-white/5 border-t border-white/10">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-400">Words</div>
                              <div className="text-xl font-bold text-white">{page.analysis.content?.word_count || 0}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Images</div>
                              <div className="text-xl font-bold text-white">{page.analysis.images?.total || 0}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Alt Coverage</div>
                              <div className="text-xl font-bold text-white">{page.analysis.images?.alt_coverage || 0}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Internal Links</div>
                              <div className="text-xl font-bold text-white">{page.analysis.links?.internal || 0}</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-gray-400">Title:</span>
                              <span className="text-white ml-2">{page.analysis.title?.text}</span>
                              <span className={`ml-2 text-xs px-2 py-1 rounded ${page.analysis.title?.score === 100 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                {page.analysis.title?.recommendation}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-400">H1 Tags:</span>
                              <span className="text-white ml-2">{page.analysis.headers?.h1_count || 0}</span>
                              {page.analysis.headers?.h1_texts && page.analysis.headers.h1_texts.map((h1: string, i: number) => (
                                <div key={i} className="text-sm text-gray-300 ml-6 mt-1">• {h1}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitors */}
            {result.data.competitors && Object.keys(result.data.competitors).length > 0 && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">⚔️ Competitors Comparison</h3>
                <div className="space-y-4">
                  {Object.entries(result.data.competitors).map(([domain, data]: [string, any]) => (
                    <div key={domain} className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h4 className="font-bold text-xl text-white mb-4">{domain}</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{data.total_pages}</div>
                          <div className="text-xs text-gray-400">Pages</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-400">{data.avg_seo_score}</div>
                          <div className="text-xs text-gray-400">SEO</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{data.avg_word_count}</div>
                          <div className="text-xs text-gray-400">Words</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{data.avg_alt_coverage}%</div>
                          <div className="text-xs text-gray-400">Alt</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
TSX

echo -e "${GREEN}✅ Deep Analysis Enhanced${NC}"

cd ..
git add .
git commit -m "✨ Enhanced Deep Analysis with detailed SEO metrics"
git push origin main

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ DEEP ANALYSIS ENHANCED!${NC}"
echo -e "${GREEN}========================================${NC}"

