import React, { useState, useEffect } from 'react';
import type { Creator, YouTubeChannelAnalytics } from '../types/creatorops';
import { fetchRealYouTubeChannelAnalytics } from '../lib/youtube';
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  RefreshCw, 
  Key, 
  ExternalLink,
  CheckCircle2,
  Video
} from 'lucide-react';

interface ChannelAnalyticsProps {
  creators: Creator[];
  youtubeApiKey: string;
  onOpenApiKeyModal: () => void;
}

export const ChannelAnalytics: React.FC<ChannelAnalyticsProps> = ({
  creators,
  youtubeApiKey,
  onOpenApiKeyModal
}) => {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(creators[0]?.id || '');
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, YouTubeChannelAnalytics>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const selectedCreator = creators.find(c => c.id === selectedCreatorId) || creators[0];

  const loadChannelData = async (creator: Creator) => {
    if (!creator) return;
    const handle = creator.handles.youtube || `@${creator.name.replace(/\s+/g, '')}`;
    setLoadingMap(prev => ({ ...prev, [creator.id]: true }));

    try {
      const data = await fetchRealYouTubeChannelAnalytics(creator.name, handle, youtubeApiKey);
      setAnalyticsMap(prev => ({ ...prev, [creator.id]: data }));
    } catch (e) {
      console.error('Channel analytics fetch error', e);
    } finally {
      setLoadingMap(prev => ({ ...prev, [creator.id]: false }));
    }
  };

  useEffect(() => {
    creators.forEach(c => {
      loadChannelData(c);
    });
  }, [youtubeApiKey, creators]);

  const currentAnalytics = selectedCreator ? analyticsMap[selectedCreator.id] : undefined;
  const isLoading = selectedCreator ? loadingMap[selectedCreator.id] : false;

  const totalRoster24hViews = Object.values(analyticsMap).reduce((sum, a) => sum + (a?.views24h || 0), 0);
  const totalRoster7dViews = Object.values(analyticsMap).reduce((sum, a) => sum + (a?.views7d || 0), 0);
  const totalRoster30dViews = Object.values(analyticsMap).reduce((sum, a) => sum + (a?.views30d || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-xl border border-border shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold text-ink">YouTube Channel Performance Analytics</h3>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Real-time channel metrics for <span className="font-semibold text-ink">24 Hours</span>, <span className="font-semibold text-ink">7 Days</span>, and <span className="font-semibold text-ink">30 Days</span> across your roster.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {youtubeApiKey ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real YouTube API Connected</span>
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Demo Simulation Mode
            </span>
          )}

          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-subtle transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{youtubeApiKey ? 'Change API Key' : 'Add YouTube API Key'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border shadow-card space-y-1">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            Roster 24 Hours Views
          </span>
          <h4 className="text-2xl font-black text-ink font-mono tabular-nums">{totalRoster24hViews.toLocaleString()}</h4>
          <p className="text-[10px] text-slate-400">Total views across all creators in last 24h</p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-card space-y-1">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Roster 7 Days Views
          </span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono tabular-nums">{totalRoster7dViews.toLocaleString()}</h4>
          <p className="text-[10px] text-slate-400">Weekly roster video performance</p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-card space-y-1">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            Roster 30 Days Views
          </span>
          <h4 className="text-2xl font-black text-purple-600 font-mono tabular-nums">{totalRoster30dViews.toLocaleString()}</h4>
          <p className="text-[10px] text-slate-400">Monthly total roster audience reach</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {creators.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCreatorId(c.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              selectedCreatorId === c.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-card'
                : 'bg-surface text-ink border-border hover:bg-slate-50'
            }`}
          >
            <img
              src={c.photoUrl}
              alt={c.name}
              className="w-5 h-5 rounded-full object-cover border"
              style={{ borderColor: c.colorCode }}
            />
            <span>{c.name}</span>
            <span className="text-[10px] opacity-75 font-mono">({c.handles.youtube || `@${c.name}`})</span>
          </button>
        ))}
      </div>

      {selectedCreator && (
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden space-y-6 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-4">
              <img
                src={selectedCreator.photoUrl}
                alt={selectedCreator.name}
                className="w-14 h-14 rounded-full object-cover border-2 shadow-subtle"
                style={{ borderColor: selectedCreator.colorCode }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-ink">{selectedCreator.name}</h2>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {selectedCreator.handles.youtube || `@${selectedCreator.name}`}
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  Subscribers: <span className="font-bold text-ink font-mono">{(currentAnalytics?.subscriberCount || 0).toLocaleString()}</span> • 
                  Total Channel Views: <span className="font-bold text-ink font-mono">{(currentAnalytics?.totalViews || 0).toLocaleString()}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => loadChannelData(selectedCreator)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg hover:bg-slate-100 border border-border text-ink text-xs font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-accent ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 p-5 rounded-xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-accent">
                <span className="uppercase tracking-wider">24 Hours Performance</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-ink font-mono tabular-nums">
                {(currentAnalytics?.views24h || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Views generated in last 24 hours</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/70 to-slate-50 p-5 rounded-xl border border-emerald-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                <span className="uppercase tracking-wider">7 Days Performance</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-emerald-700 font-mono tabular-nums">
                {(currentAnalytics?.views7d || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {(currentAnalytics?.likes7d || 0).toLocaleString()} likes • {(currentAnalytics?.comments7d || 0).toLocaleString()} comments
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50/70 to-slate-50 p-5 rounded-xl border border-purple-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-700">
                <span className="uppercase tracking-wider">30 Days Performance</span>
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-purple-700 font-mono tabular-nums">
                {(currentAnalytics?.views30d || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Monthly channel view accumulation</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-4 h-4 text-red-600" />
              <span>Recent Video Uploads ({currentAnalytics?.recentUploads.length || 0})</span>
            </h3>

            {!currentAnalytics || currentAnalytics.recentUploads.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent uploads fetched yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentAnalytics.recentUploads.map((video) => (
                  <div
                    key={video.id}
                    className="bg-bg rounded-xl border border-border shadow-subtle overflow-hidden space-y-2.5 p-3 hover:border-accent transition-all"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 p-1.5 bg-slate-900/80 hover:bg-red-600 text-white rounded-md backdrop-blur-sm transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <h4 className="text-xs font-bold text-ink line-clamp-2 leading-snug">{video.title}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Uploaded {new Date(video.publishedAt).toLocaleDateString()}
                    </p>

                    <div className="grid grid-cols-3 gap-1 bg-white p-2 rounded-lg border border-border text-center text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">Views</span>
                        <span className="font-bold text-ink font-mono">{video.views.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">Likes</span>
                        <span className="font-bold text-ink font-mono">{video.likes.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">Comments</span>
                        <span className="font-bold text-ink font-mono">{video.comments.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
