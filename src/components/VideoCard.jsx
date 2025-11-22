import React from 'react';

const API = import.meta.env.VITE_API_URL || 'https://aurixon-ai-backend.vercel.app';

function relativeTime(ts) {
  if (!ts) return '-';
  const diff = Date.now() - new Date(ts).getTime();
  const sec = Math.floor(Math.abs(diff) / 1000);
  if (sec < 60) return `${sec}s ${diff > 0 ? 'ago' : 'from now'}`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ${diff > 0 ? 'ago' : 'from now'}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ${diff > 0 ? 'ago' : 'from now'}`;
  const d = Math.floor(hr / 24);
  return `${d}d ${diff > 0 ? 'ago' : 'from now'}`;
}

export default function VideoCard({ video, onSelect, onHide, onDelete }) {
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this video?')) {
      onDelete(video._id);
    }
  };

  const handleHide = (e) => {
    e.stopPropagation();
    onHide(video._id);
  };

  return (
    <div 
      onClick={() => onSelect(video)}
      style={{
        cursor: 'pointer',
        background: 'var(--vscode-editor-background)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{
        position: 'relative',
        paddingTop: '56.25%', // 16:9 aspect ratio
        background: 'linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))'
      }}>
        {video.thumbnailUrl || video.youtubeThumbnailUrl ? (
          <img 
            src={video.youtubeThumbnailUrl || `${API}${video.thumbnailUrl}`}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '32px',
            opacity: 0.5
          }}>▶</div>
        )}
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          gap: '8px',
          zIndex: 10
        }}>
          <button
            onClick={handleHide}
            style={{
              padding: '4px 8px',
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Hide
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '4px 8px',
              background: 'rgba(255,0,0,0.6)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '48px 16px 16px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          color: '#fff'
        }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {video.title || 'Untitled'}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {relativeTime(video.createdAt)}
          </div>
          <div style={{
            fontSize: '12px',
            marginTop: '4px',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: video.status === 'published' ? 'rgba(16,185,129,0.2)' : 
                           video.status === 'failed' ? 'rgba(239,68,68,0.2)' : 
                           'rgba(59,130,246,0.2)',
            display: 'inline-block'
          }}>
            {video.status}
          </div>
        </div>
      </div>
    </div>
  );
}
