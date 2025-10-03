import React from 'react';

// Helper to determine platform success state
function isPlatformSuccess(video, platform) {
  // Normalize platform data and reuse consistent keys
  const p = normalizePlatform(video, platform);
  if (!p) return false;

  // If backend explicitly says published/processed/etc -> success
  if (p.status && ['published', 'processed', 'uploaded', 'success'].includes(p.status)) return true;

  // If we have a platform-specific id and uploadStatus isn't failed, treat as success
  if (p.id && (!p.uploadStatus || p.uploadStatus !== 'failed')) return true;

  return false;
}

// Normalize various backend shapes into a consistent object per platform
function normalizePlatform(video, platform) {
  const raw = video.platformStatus?.[platform] || {};

  // common id candidates
  const id = raw.videoId || raw.postId || raw.mediaId ||
    (platform === 'youtube' ? video.youtubeVideoId : undefined) ||
    (platform === 'instagram' ? video.instagramData?.creationId : undefined) ||
    (platform === 'facebook' ? video.facebookPostId : undefined);

  const status = (raw.status || raw.uploadStatus || raw.upload_status || '').toString().toLowerCase() || undefined;
  const uploadStatus = (raw.uploadStatus || raw.upload_status || raw.status || '').toString().toLowerCase() || undefined;
  const error = raw.error || raw.message || undefined;

  return { id, status, uploadStatus, error, raw };

}

// Get platform-specific status
function getPlatformStatus(video, platform) {
  // Infer whether the platform was selected
  const selected = isPlatformSelected(video, platform);
  if (!selected) return 'not_selected';

  // Scheduled check
  if (video.scheduledFor && new Date(video.scheduledFor) > new Date()) return 'scheduled';

  // Use normalized platform data
  const p = normalizePlatform(video, platform);
  // If no backend data and no id, show pending (not started)
  if (!p || (!p.id && !p.status && !p.uploadStatus)) {
    return 'pending';
  }

  // YouTube specific logic
  if (platform === 'youtube') {
    // If we have an id (videoId) treat according to uploadStatus
    if (p.id) {
      if (!p.uploadStatus || ['processed', 'success', 'published', 'uploaded'].includes(p.uploadStatus)) return 'published';
      if (p.uploadStatus === 'processing' || p.uploadStatus === 'uploaded') return 'processing';
      if (p.uploadStatus === 'failed') return 'published_with_errors';
      return 'processing';
    }

    // No id but backend reports status
    if (p.uploadStatus) {
      if (p.uploadStatus === 'processing' || p.uploadStatus === 'uploaded') return 'processing';
      if (p.uploadStatus === 'failed') return 'failed';
    }
    return 'pending';
  }

  // Generic platforms (instagram, facebook, tiktok)
  if (['instagram', 'facebook', 'tiktok'].includes(platform)) {
    if (p.id) {
      if (p.status && ['failed', 'error'].includes(p.status)) return 'published_with_errors';
      return 'published';
    }
    if (p.status) {
      if (['processing', 'uploading'].includes(p.status)) return 'processing';
      if (['failed', 'error'].includes(p.status)) return 'failed';
    }
    return 'pending';
  }

  return 'pending';
}

// Infer whether a platform is selected by several signals
function isPlatformSelected(video, platform) {
  // If explicit platforms object exists, trust it
  if (video.platforms && Object.prototype.hasOwnProperty.call(video.platforms, platform)) {
    return Boolean(video.platforms[platform]);
  }

  // Fallback: treat as selected if we have platform-specific ids or platformStatus raw data
  const raw = video.platformStatus?.[platform];
  if (platform === 'youtube' && (video.youtubeVideoId || raw?.videoId || raw?.uploadStatus || raw?.status)) return true;
  if (platform === 'instagram' && (video.instagramData?.creationId || raw?.mediaId || raw?.status)) return true;
  if (platform === 'facebook' && (video.facebookPostId || raw?.postId || raw?.status)) return true;
  if (platform === 'tiktok' && (raw?.videoId || raw?.status)) return true;

  return false;
}

// Calculate overall status based on all selected platforms
function getOverallStatus(video) {
  // Get selected platforms
  const selectedPlatforms = Object.entries(video.platforms || {})
    .filter(([_, selected]) => selected === true)
    .map(([platform]) => platform);

  if (selectedPlatforms.length === 0) {
    return 'pending';
  }

  // Check for scheduled uploads first
  if (video.scheduledFor && new Date(video.scheduledFor) > new Date()) {
    return 'scheduled';
  }

  // Get individual platform statuses
  const platformStatuses = selectedPlatforms.map(platform => {
    const status = getPlatformStatus(video, platform);
    return {
      platform,
      status,
      isSuccess: status === 'published',
      isProcessing: status === 'processing',
      isFailed: status === 'failed',
      hasPartialSuccess: status === 'published'
    };
  });

  // Check if any platform has real data indicating progress
  const hasAnyProgress = platformStatuses.some(p => {
    const platformData = video.platformStatus?.[p.platform];
    switch (p.platform) {
      case 'youtube':
        return Boolean(video.youtubeVideoId || platformData?.status || platformData?.uploadStatus);
      case 'instagram':
        return Boolean(video.instagramData?.creationId || platformData?.status);
      case 'facebook':
        return Boolean(video.facebookPostId || platformData?.status);
      case 'tiktok':
        return Boolean(platformData?.videoId || platformData?.status);
      default:
        return false;
    }
  });

  // If no platform has any progress data, return pending
  if (!hasAnyProgress) {
    return 'pending';
  }

  // Count the different states
  const stats = {
    total: selectedPlatforms.length,
    published: platformStatuses.filter(p => p.isSuccess).length,
    processing: platformStatuses.filter(p => p.isProcessing).length,
    failed: platformStatuses.filter(p => p.isFailed).length,
    partial: platformStatuses.filter(p => p.hasPartialSuccess).length,
    pending: platformStatuses.filter(p => p.status === 'pending').length
  };

  // Determine overall status
  if (stats.published === stats.total) {
    return 'published';
  }

  if (stats.processing > 0) {
    return 'processing';
  }

  if (stats.published > 0 || stats.partial > 0) {
    return 'published';
  }

  if (stats.failed === stats.total) {
    return 'failed';
  }

  if (stats.pending === stats.total) {
    return 'pending';
  }

  return 'processing';
}

function formatDate(ts) {
  if (!ts) return '-';
  return new Date(ts).toLocaleString();
}

export default function VideoModal({ video, onClose }) {
  if (!video) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 9999,
        overflow: 'hidden'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(169deg, #1e293b 0%, #0f172a 100%)',
          padding: '32px',
          borderRadius: '24px',
          width: '92%',
          maxWidth: '1000px',
          height: 'auto',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          margin: '0 auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>{video.title || 'Untitled'}</h2>
          <div style={{ color: 'var(--muted, #9ca3af)', fontSize: '14px' }}>
            Created: {formatDate(video.createdAt)}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Status</h3>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <StatusCard 
              title="Upload Status" 
              status={getOverallStatus(video)}
              error={video.errorMessage}
              selected={true}
            />
            <StatusCard 
              title="YouTube" 
              status={getPlatformStatus(video, 'youtube')}
              error={video.platformStatus?.youtube?.error}
              selected={video.platforms?.youtube === true}
              isSuccess={video.youtubeVideoId != null}
            />
            <StatusCard 
              title="Instagram" 
              status={getPlatformStatus(video, 'instagram')}
              error={video.platformStatus?.instagram?.error}
              selected={video.platforms?.instagram === true}
              isSuccess={video.instagramData?.creationId != null}
            />
            <StatusCard 
              title="Facebook" 
              status={getPlatformStatus(video, 'facebook')}
              error={video.platformStatus?.facebook?.error}
              selected={video.platforms?.facebook === true}
              isSuccess={video.facebookPostId != null}
            />
            <StatusCard 
              title="TikTok" 
              status={getPlatformStatus(video, 'tiktok')}
              error={video.platformStatus?.tiktok?.error}
              selected={video.platforms?.tiktok === true}
              isSuccess={video.platformStatus?.tiktok?.videoId != null}
            />
          </div>
        </div>

        {video.description && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Description</h3>
            <div style={{ whiteSpace: 'pre-wrap' }}>{video.description}</div>
          </div>
        )}

        {video.tags && video.tags.length > 0 && (
          <div>
            <h3>Tags</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {video.tags.map((tag, index) => (
                <span 
                  key={index}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    fontSize: '14px'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusCard({ title, status, error, selected, isSuccess }) {
  const getStatusColor = (status, selected, isSuccess) => {
    if (!selected) {
      return 'rgba(100,116,139,0.1)'; // Gray for not selected
    }

    const statusLower = (status || '').toLowerCase();

    // Direct success cases
    if (isSuccess || statusLower === 'published' || statusLower === 'success') {
      return 'rgba(16,185,129,0.2)'; // Success green
    }

    // Specific states
    switch(statusLower) {
      case 'published_with_errors':
        return 'rgba(234,179,8,0.2)'; // Warning yellow
      case 'failed':
      case 'error':
        return 'rgba(239,68,68,0.2)'; // Error red
      case 'processing':
      case 'uploading':
      case 'converting':
        return 'rgba(59,130,246,0.2)'; // Processing blue
      case 'scheduled':
        return 'rgba(139,92,246,0.2)'; // Purple for scheduled
      case 'pending':
        return 'rgba(59,130,246,0.15)'; // Light blue for pending
      case 'not_selected':
        return 'rgba(100,116,139,0.1)'; // Gray
      default:
        return 'rgba(59,130,246,0.2)'; // Default blue
    }
  };

  const getStatusIcon = (status, isSuccess) => {
    if (!selected) {
      return '-';
    }

    const statusLower = (status || '').toLowerCase();

    // Direct success cases
    if (isSuccess || statusLower === 'published' || statusLower === 'success') {
      return '✓';
    }

    // Specific states
    switch(statusLower) {
      case 'published_with_errors':
        return '!';
      case 'failed':
      case 'error':
        return '✕';
      case 'processing':
      case 'uploading':
      case 'converting':
        return '↻';
      case 'scheduled':
        return '⏰';
      case 'pending':
        return '⋯';
      case 'not_selected':
        return '-';
      default:
        return '⋯';
    }
  };

  return (
    <div style={{
      padding: '20px',
      borderRadius: '16px',
      background: getStatusColor(status, selected, isSuccess),
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ 
          fontWeight: '600',
          fontSize: '1.1rem',
          color: '#fff'
        }}>{title}</div>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: getStatusColor(status, selected, isSuccess),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: status?.toLowerCase().includes('success') || status?.toLowerCase().includes('published') ? '#22c55e' :
                 status?.toLowerCase().includes('fail') || status?.toLowerCase().includes('error') ? '#ef4444' :
                 status?.toLowerCase().includes('progress') || status?.toLowerCase().includes('uploading') ? '#eab308' :
                 '#3b82f6'
        }}>
          {getStatusIcon(status, isSuccess)}
        </div>
      </div>
      <div style={{
        fontSize: '0.95rem',
        color: 'rgba(255, 255, 255, 0.9)',
        padding: '8px 12px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.05)',
        marginBottom: error ? '12px' : '0'
      }}>{status || 'Pending'}</div>
      {error && (
        <div style={{ 
          marginTop: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#fca5a5',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
