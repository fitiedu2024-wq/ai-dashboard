'use client';

import { useState } from 'react';
import { Eye, Upload, Loader2, Info } from 'lucide-react';
import { analysisAPI } from '../../lib/api';
import { useToast } from '../../lib/toast';

export default function VisionAI() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { error: showError } = useToast();

  const analyzeImage = async () => {
    setLoading(true);
    try {
      const response = await analysisAPI.visionAI(imageUrl);
      if (response.error) {
        showError('Error', response.error);
      } else {
        setResults(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error', 'Failed to analyze image');
    }
    setLoading(false);
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Vision AI
        </h1>
        <p className="text-gray-200 text-lg mb-8">Detect brands, logos, and visual elements in images</p>

        {/* Explanation */}
        <div className="glass rounded-2xl p-6 mb-8 border border-blue-400/30 bg-blue-500/5">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Use Cases</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• <strong>Brand Monitoring:</strong> Track where your logo appears online</li>
                <li>• <strong>Competitive Intelligence:</strong> Identify competitor logos in social media</li>
                <li>• <strong>Influencer Marketing:</strong> Verify brand mentions in influencer content</li>
                <li>• <strong>Ad Compliance:</strong> Ensure brand guidelines are followed</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-blue-300">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
              disabled={loading}
            />
          </div>
          
          <button
            onClick={analyzeImage}
            disabled={loading || !imageUrl}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><Eye className="w-5 h-5" />Detect Brands</>}
          </button>
        </div>

        {results?.success && (
          <div className="space-y-6">
            {/* Image Preview */}
            {imageUrl && (
              <div className="glass rounded-2xl p-8 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">📸 Image Preview</h3>
                <div className="flex justify-center">
                  <img
                    src={imageUrl}
                    alt="Analyzed image"
                    className="max-w-md max-h-64 rounded-xl object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              </div>
            )}

            <div className="glass rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">🏷️ Detection Results</h3>

              {/* Image Properties */}
              {results.data?.image_properties && Object.keys(results.data.image_properties).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-lg text-white mb-4">📐 Image Properties</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {results.data.image_properties.width} × {results.data.image_properties.height}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Dimensions</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {results.data.image_properties.aspect_ratio}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Aspect Ratio</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {results.data.image_properties.format || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Format</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-cyan-400">
                        {results.data.image_properties.is_banner ? '🖼️ Banner' :
                         results.data.image_properties.is_square ? '⬜ Square' : '📷 Standard'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Type</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dominant Colors */}
              {results.data?.colors && results.data.colors.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-lg text-white mb-4">🎨 Dominant Colors</h4>
                  <div className="flex flex-wrap gap-3">
                    {results.data.colors.map((color: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                        <div
                          className="w-10 h-10 rounded-lg border border-white/20"
                          style={{ backgroundColor: color.color }}
                        />
                        <div>
                          <div className="font-mono text-white text-sm">{color.color}</div>
                          <div className="text-xs text-gray-400">{color.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.data?.logos?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-lg text-white mb-4">Detected Logos</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {results.data.logos.map((logo: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-5 rounded-xl border border-green-400/30">
                        <div className="font-bold text-white text-xl mb-2">{logo.name}</div>
                        <div className="text-sm text-green-400 mb-3">Confidence: {logo.confidence}%</div>
                        <div className="text-xs text-gray-400">
                          High confidence detection - Logo clearly visible
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Labels */}
              {results.data?.labels?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-lg text-white mb-4">🏷️ Detected Labels</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.data.labels.map((label: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-sm text-white"
                      >
                        {label.name} <span className="text-gray-400">({label.confidence}%)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Insights */}
              <div className="bg-purple-500/10 p-6 rounded-xl border border-purple-500/20 mt-6">
                <h4 className="font-bold text-white mb-3">📊 Analysis Insights</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>• <strong>Brand Visibility:</strong> {results.data?.logos?.length || 0} brand(s) detected in this image</div>
                  <div>• <strong>Detection Quality:</strong> {results.data?.logos?.length > 0 ? 'High confidence detections' : 'No clear logos detected'}</div>
                  <div>• <strong>Analysis Method:</strong> {results.method === 'local_analysis' ? '🖥️ Local PIL Analysis' : '🔗 URL Pattern Analysis'}</div>
                  <div>• <strong>Recommendation:</strong> {results.data?.logos?.length > 0 ? 'Monitor this brand presence for competitive insights' : 'Try a different image with clearer logos'}</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-300">
                  💡 <strong>Note:</strong> {results.note || 'Enhanced with local image analysis using PIL/Pillow.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
