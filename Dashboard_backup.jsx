import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    try {
      await api.post('/analyze', { domain: domain.trim() });
      setDomain('');
      setTimeout(fetchJobs, 2000);
    } catch (error) {
      console.error('Error starting analysis:', error);
      alert('Failed to start analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">AI Marketing Dashboard</h1>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Admin Panel
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <form onSubmit={handleAnalyze} className="flex gap-4">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter domain (e.g., example.com)"
              className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Analysis History</h2>
          
          {jobs.length === 0 ? (
            <p className="text-gray-300 text-center py-8">No analyses yet. Start by entering a domain above.</p>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <AnalysisCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisCard({ job }) {
  const [expanded, setExpanded] = useState(false);
  const results = job.results || {};
  const scores = results.scores || {};
  const trackers = results.trackers || {};
  const competitors = results.competitors || [];

  return (
    <div className="bg-purple-800/50 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {job.domain[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{job.domain}</h3>
            <p className="text-gray-300 text-sm">{new Date(job.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
            ✓ Completed
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <ScoreCard label="SEO Score" score={scores.seo_score || 0} />
        <ScoreCard label="Performance" score={scores.performance_score || 0} />
        <ScoreCard label="Marketing" score={scores.marketing_score || 0} />
        <ScoreCard label="Overall" score={scores.overall_score || 0} />
      </div>

      {results.platform && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            🖥️ Platform Detection
          </h4>
          <p className="text-gray-300">Primary Platform: <span className="text-white font-semibold">{results.platform.primary_platform}</span></p>
          <div className="flex gap-2 mt-2">
            {results.platform.detected_platforms?.map((platform) => (
              <span key={platform} className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                {platform}
              </span>
            ))}
          </div>
        </div>
      )}

      {trackers.active_count > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            📊 Marketing Trackers ({trackers.active_count})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(trackers.trackers || {}).map(([name, data]) => {
              if (!data.active) return null;
              return (
                <div key={name} className="bg-purple-700/50 rounded-lg p-3">
                  <p className="text-white font-medium mb-1">{name.replace(/_/g, ' ')}</p>
                  {data.ids && data.ids.length > 0 && (
                    <div className="space-y-1">
                      {data.ids.map((id, idx) => (
                        <code key={idx} className="block text-xs bg-black/30 px-2 py-1 rounded text-green-300">
                          {id}
                        </code>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {competitors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            🏢 Competitors ({competitors.length})
          </h4>
          <div className="space-y-3">
            {competitors.map((comp, idx) => (
              <div key={idx} className="bg-purple-700/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    
                      href={comp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-semibold hover:text-purple-300"
                    >
                      {comp.domain}
                    </a>
                    <p className="text-sm text-gray-300 mt-1">{comp.title}</p>
                  </div>
                  {comp.relevance_score && (
                    <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs">
                      Score: {comp.relevance_score}
                    </span>
                  )}
                </div>
                {comp.snippet && (
                  <p className="text-sm text-gray-400 mb-2">{comp.snippet}</p>
                )}
                {comp.pages && comp.pages.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-600">
                    <p className="text-xs text-gray-400 mb-2">Analyzed Pages:</p>
                    <div className="space-y-2">
                      {comp.pages.map((page, pidx) => (
                        <div key={pidx} className="bg-black/20 rounded p-2">
                          <p className="text-xs text-white font-medium">{page.title}</p>
                          {page.description && (
                            <p className="text-xs text-gray-400 mt-1">{page.description.substring(0, 100)}...</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && results.recommendations && (
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            💡 AI Recommendations
          </h4>
          <div className="space-y-3">
            {results.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`border-l-4 p-4 rounded ${
                  rec.priority === 'high'
                    ? 'border-red-500 bg-red-900/20'
                    : rec.priority === 'medium'
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-green-500 bg-green-900/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white font-semibold">{rec.category}</p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      rec.priority === 'high'
                        ? 'bg-red-500'
                        : rec.priority === 'medium'
                        ? 'bg-blue-500'
                        : 'bg-green-500'
                    } text-white`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-white font-medium mb-1">{rec.issue}</p>
                <p className="text-gray-300 text-sm mb-2">{rec.recommendation}</p>
                <p className="text-green-300 text-sm">Impact: {rec.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, score }) {
  const getColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="text-center">
      <p className="text-gray-300 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${getColor(score)}`}>{score}</p>
    </div>
  );
}
