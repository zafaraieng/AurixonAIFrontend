import React, { useState, useEffect } from 'react';
import VideoCard from './VideoCard';
import VideoModal from './VideoModal';

const API = import.meta.env.VITE_API_URL || 'https://aurixon-ai-backend.vercel.app';

function formatDate(ts) {
  if (!ts) return '-';
  return new Date(ts).toLocaleString();
}

export default function ScheduleList() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [hiddenIds, setHiddenIds] = useState([]);

  // Load videos
  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API}/api/uploads`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) throw new Error('Failed to load videos');
      const data = await response.json();
      
      // Process the data to ensure platform status consistency
      const processedData = data.map(video => ({
        ...video,
        // Ensure platforms object exists and is consistent with status
        platforms: {
          youtube: video.youtubeVideoId != null || video.platformStatus?.youtube?.status !== 'not_selected',
          instagram: video.instagramData?.creationId != null || video.platformStatus?.instagram?.status !== 'not_selected',
          facebook: video.facebookPostId != null || video.platformStatus?.facebook?.status !== 'not_selected',
          tiktok: video.platformStatus?.tiktok?.videoId != null || video.platformStatus?.tiktok?.status !== 'not_selected',
          ...video.platforms
        }
      }));

      setVideos(processedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh videos every 10 seconds while processing
  useEffect(() => {
    loadVideos();
    
    // Set up auto-refresh if any video is processing
    const hasProcessing = videos.some(v => 
      v.status === 'processing' || 
      Object.values(v.platformStatus || {}).some(p => p?.status === 'processing')
    );
    
    let refreshInterval;
    if (hasProcessing) {
      refreshInterval = setInterval(loadVideos, 10000);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Handle video deletion
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API}/api/uploads/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to delete video');
      await loadVideos();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter and sort videos
  const filteredVideos = videos
    .filter(v => !hiddenIds.includes(v._id))
    .filter(v => {
      if (search) {
        const searchLower = search.toLowerCase();
        return (v.title?.toLowerCase().includes(searchLower) || 
                v.description?.toLowerCase().includes(searchLower));
      }
      if (statusFilter !== 'all') {
        return v.status === statusFilter;
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortKey] || '';
      const bVal = b[sortKey] || '';
      const order = sortDir === 'asc' ? 1 : -1;
      return aVal < bVal ? -order : aVal > bVal ? order : 0;
    });

  // Paginate videos
  const totalPages = Math.ceil(filteredVideos.length / perPage);
  const pageVideos = filteredVideos.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      <div className="glass-card" style={{ padding: 24, maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              placeholder="Search title or description"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-field"
              style={{ width: 260, padding: '8px 10px' }}
            />

            <select className="form-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="uploaded">Uploaded</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
            </select>

            <select className="form-field" value={sortKey} onChange={e => setSortKey(e.target.value)}>
              <option value="publishTime">Publish time</option>
              <option value="createdAt">Created</option>
              <option value="title">Title</option>
            </select>

            <button
              className="btn-primary"
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              title="Toggle sort direction"
              style={{ padding: '8px 10px' }}
              type="button"
            >
              {sortDir === 'asc' ? 'Asc' : 'Desc'}
            </button>

            <button 
              className="btn-primary" 
              onClick={loadVideos} 
              disabled={loading}
              style={{ padding: '8px 10px' }}
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && <div className="small">Loading uploads...</div>}
        {error && <div style={{ color: 'crimson' }}>Error: {error}</div>}
        
        <div className="small" style={{ marginBottom: 10, color: 'var(--muted, #9ca3af)' }}>
          Total items: {videos.length}, Filtered: {filteredVideos.length}, Page items: {pageVideos.length}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', // Always show 2 columns
          gap: '30px',
          padding: '2px',
          maxWidth: '1200px', // Increased max width
          margin: '0 auto' // Center the grid
        }}>
          {!loading && pageVideos.length === 0 ? (
            <div className="file-preview" style={{ 
              justifyContent: 'center', 
              padding: 28,
              gridColumn: '1 / -1'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>No uploads to show</div>
                <div className="small" style={{ marginTop: 6 }}>Try changing filters or create a new upload.</div>
              </div>
            </div>
          ) : (
            pageVideos.map(video => (
              <VideoCard
                key={video._id}
                video={video}
                onSelect={setSelectedVideo}
                onHide={(id) => setHiddenIds([...hiddenIds, id])}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button 
            type="button" 
            disabled={page <= 1} 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="form-field"
            style={{ padding: '8px 10px' }}
          >
            Prev
          </button>
          <div className="small">Page <strong>{page}</strong> of <strong>{totalPages}</strong></div>
          <button 
            type="button" 
            disabled={page >= totalPages} 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="form-field"
            style={{ padding: '8px 10px' }}
          >
            Next
          </button>

          <label style={{ marginLeft: 8 }}>
            <select 
              className="form-field" 
              value={perPage}
              onChange={e => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5,10,20,50].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>

          <div style={{ marginLeft: 'auto', fontSize: 13 }}>
            <button 
              type="button" 
              className="form-field"
              onClick={() => {
                if (!hiddenIds.length) {
                  alert('No hidden items');
                  return;
                }
                if (confirm(`Unhide all ${hiddenIds.length} items?`)) {
                  setHiddenIds([]);
                }
              }}
            >
              Unhide all ({hiddenIds.length})
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
