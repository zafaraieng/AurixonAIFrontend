import React, { useState, useRef, useEffect } from 'react';
import { uploadVideo, validateVideo } from '../api/uploadApi';
import { optimizeContent } from '../api/aiApi';
import ContentAnalysis from './ContentAnalysis';
import './UploadForm.css';

export default function UploadForm({ onSuccess }) {
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [privacyStatus, setPrivacy] = useState('private');
  const [publishTime, setPublishTime] = useState('');
  const [platforms, setPlatforms] = useState({ youtube: true, instagram: false, facebook: false, tiktok: false });
  const [youtubeVideoType, setYoutubeVideoType] = useState('long'); // 'short' or 'long'
  const [videoDuration, setVideoDuration] = useState(0);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [success, setSuccess] = useState('');
  const [analysisData, setAnalysisData] = useState(null);

  const thumbnailInputRef = useRef(null);
  const cloudinaryWidgetRef = useRef(null);

  useEffect(() => {
    // Initialize Cloudinary Widget
    if (window.cloudinary) {
      cloudinaryWidgetRef.current = window.cloudinary.createUploadWidget({
        cloudName: 'dhlyn3h1y',
        uploadPreset: 'unsigned_upload', // User provided preset
        sources: ['local', 'url', 'camera'],
        resourceType: 'video',
        clientAllowedFormats: ['mp4', 'mov', 'avi', 'wmv'],
        maxFileSize: 1000000000, // 1GB
        multiple: false,
        theme: 'minimal',
      }, (error, result) => {
        if (!error && result && result.event === "success") {
          console.log('Cloudinary Upload Success:', result.info);
          handleCloudinarySuccess(result.info);
        } else if (error) {
          console.error('Cloudinary Widget Error:', error);
          setError('Cloudinary upload failed: ' + (error.message || 'Unknown error'));
        }
      });
    }
  }, []);

  const handleCloudinarySuccess = (info) => {
    setVideo({
      name: info.original_filename + '.' + info.format,
      size: info.bytes,
      type: 'video/' + info.format,
      cloudinaryUrl: info.secure_url,
      duration: info.duration
    });

    setVideoDuration(info.duration);
    if (info.duration <= 180) {
      setYoutubeVideoType('short');
    } else {
      setYoutubeVideoType('long');
    }

    // Reset analysis as we have a new video
    setAnalysisData(null);
  };

  const openCloudinaryWidget = () => {
    if (cloudinaryWidgetRef.current) {
      cloudinaryWidgetRef.current.open();
    } else {
      setError('Cloudinary widget not initialized. Please refresh the page.');
    }
  };
  useEffect(() => {
    if (analysisData) {
      // Check if any selected platform is not eligible
      const ineligiblePlatforms = Object.entries(platforms)
        .filter(([platform, isSelected]) => isSelected && !analysisData.platformSpecific[platform]?.eligible)
        .map(([platform]) => platform);

      if (ineligiblePlatforms.length > 0) {
        setError(`Warning: Video may not be suitable for: ${ineligiblePlatforms.join(', ')}. Check analysis for details.`);
      } else {
        setError('');
      }
    }
  }, [analysisData, platforms]);

  const formatBytes = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
  };

  // Removed handleFileSelect as we use Cloudinary Widget now
  // Kept handleThumbnailSelect as is

  const handleThumbnailSelect = (f) => {
    if (f) {
      setThumbnail(f);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(f);
    } else {
      setThumbnail(null);
      setThumbnailPreview(null);
    }
  };

  const analyzeContent = async () => {
    if (!video) return;

    setAnalyzing(true);
    setError('');

    try {
      const data = await validateVideo(video);
      console.log('Validation API response:', data); // Debug log
      setAnalysisData(data);
    } catch (err) {
      console.error('Validation error:', err); // Debug log
      const errorMessage = err.response?.data?.message || err.message;
      setError('Failed to analyze content: ' + errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    if (!title) {
      setError('Please enter a title to optimize');
      return;
    }

    setOptimizing(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('https://aurixon-ai-backend.vercel.app/api/ai/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const optimized = await response.json();

      if (optimized.success) {
        // Update title if provided
        if (optimized.title) {
          setTitle(optimized.title);
        }

        // Update description with keywords included
        if (optimized.description) {
          setDescription(optimized.description);
        }

        // Set only hashtags in tags field
        if (optimized.tags) {
          setTags(optimized.tags);
        }

        // Show success message
        setSuccess('Content optimized successfully! Your content has been updated with trending hashtags and SEO-optimized keywords.');
      } else {
        throw new Error(optimized.error || 'Failed to optimize content');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      setError('Failed to optimize content: ' + error.message);
    } finally {
      setOptimizing(false);
    }
  };

  const handleSelectAllPlatforms = () => {
    setPlatforms({
      youtube: true,
      facebook: true,
      instagram: true,
      tiktok: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video) {
      setError('Please select a video file');
      return;
    }

    // Ensure at least one platform is selected
    if (!Object.values(platforms).some(Boolean)) {
      setError('Please select at least one platform');
      return;
    }

    setUploading(true);
    setError('');

    try {
      let response;

      if (video.cloudinaryUrl) {
        // Send JSON for Cloudinary URL
        const payload = {
          cloudinaryUrl: video.cloudinaryUrl,
          originalFilename: video.name,
          title,
          description,
          tags,
          publishTime,
          privacyStatus,
          platforms: JSON.stringify(platforms),
          videoType: 'long'
        };

        console.log('Sending Cloudinary URL to backend:', payload);
        response = await uploadVideo(payload, true); // Pass true for isJson
      } else {
        // Standard file upload
        const formData = new FormData();
        formData.append('file', video);
        if (thumbnail) {
          formData.append('thumbnail', thumbnail);
        }
        formData.append('title', title);
        formData.append('description', description);
        formData.append('tags', tags);
        formData.append('publishTime', publishTime);
        formData.append('privacyStatus', privacyStatus);
        formData.append('platforms', JSON.stringify(platforms));
        formData.append('videoType', 'long');

        response = await uploadVideo(formData);
      }

      console.log('Upload response:', response); // Debug log

      // Handle TikTok upload response
      if (response?.tiktok?.status === 'success') {
        alert(response.tiktok.message || 'Video uploaded to TikTok as draft. Please check your TikTok app drafts to publish.');
      } else if (response?.tiktok?.status === 'error') {
        setError(`TikTok upload failed: ${response.tiktok.message}`);
      }

      onSuccess?.();
      // Reset form
      setVideo(null);
      setThumbnail(null);
      setThumbnailPreview(null);
      setTitle('');
      setDescription('');
      setTags('');
      setPublishTime('');
      setAnalysisData(null);
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err?.response?.data?.details || err.message || 'Upload failed';

      // Check for sandbox mode error
      if (errorMessage.includes('sandbox mode')) {
        setError(
          'TikTok uploads are not available in sandbox mode. The app needs to be approved by TikTok first. ' +
          'Other platforms will still work normally.'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {analysisData && (
        <ContentAnalysis
          analysisData={analysisData}
          onProceed={() => setAnalysisData(null)}
          onCancel={() => {
            setAnalysisData(null);
            setVideo(null);
          }}
        />
      )}
      <form onSubmit={handleSubmit} className="form-grid glass-card" style={{ width: '100%' }}>
        <div className="form-header">
          <div>
            <div className="form-title">Upload a video</div>
            <div className="form-sub">Polished design — schedule to publish on multiple platforms</div>
          </div>
          <div className="small">Tip: Use MP4 H.264 for best compatibility</div>
        </div>

        <div className="file-upload-container">
          <label className="file-picker" onClick={openCloudinaryWidget}>
            <div className="file-meta">
              <div className="file-icon">▶</div>
              <div className="file-details">
                <div className="file-name">{video ? video.name : 'Upload Video via Cloudinary'}</div>
                <div className="file-meta-small">{video ? `${formatBytes(video.size)} • ${video.type || 'video'}` : 'Supports large video files'}</div>
              </div>
            </div>
            <div className="small">{video ? 'Change' : 'Upload'}</div>
          </label>

          <label className="thumbnail-picker" onClick={() => thumbnailInputRef.current?.click()}>
            <div className="thumbnail-preview" style={{
              backgroundImage: thumbnailPreview ? `url(${thumbnailPreview})` : 'none',
              backgroundColor: thumbnailPreview ? 'transparent' : '#f0f0f0'
            }}>
              {!thumbnailPreview && <div className="thumbnail-icon">🖼️</div>}
              <div className="thumbnail-overlay">
                <span>{thumbnail ? 'Change thumbnail' : 'Upload thumbnail'}</span>
              </div>
            </div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleThumbnailSelect(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <input
            className="form-field"
            style={{ flex: 1 }}
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={handleOptimize}
            disabled={optimizing || !title}
            style={{ marginTop: '8px', whiteSpace: 'nowrap' }}
          >
            {optimizing ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span className="spinner" /> Optimizing...
              </span>
            ) : '✨ AI Optimize'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <textarea
            className="form-field"
            style={{ flex: 1 }}
            placeholder="Description"
            rows={5}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={async () => {
              if (!title) {
                setError('Please enter a title first');
                return;
              }
              setOptimizing(true);
              try {
                const optimized = await optimizeContent(title);
                setDescription(optimized.description);
                setTags(optimized.tags.join(', '));
              } catch (err) {
                setError('Failed to generate content: ' + (err.response?.data?.error || err.message));
              } finally {
                setOptimizing(false);
              }
            }}
            disabled={optimizing || !title}
            style={{ marginTop: '8px', whiteSpace: 'nowrap' }}
          >
            {optimizing ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span className="spinner" /> Generating...
              </span>
            ) : '✨ Generate'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <input
            className="form-field"
            style={{ flex: 1 }}
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </div>

        <label>
          <div className="small" style={{ marginBottom: 6 }}>Privacy</div>
          <select className="form-field" value={privacyStatus} onChange={e => setPrivacy(e.target.value)}>
            <option value="private">private</option>
            <option value="unlisted">unlisted</option>
            <option value="public">public</option>
          </select>
        </label>

        <label>
          <div className="small" style={{ marginBottom: 6 }}>Schedule (optional)</div>
          <input className="form-field" type="datetime-local" value={publishTime} onChange={e => setPublishTime(e.target.value)} />
        </label>

        <div className="checkbox-group">
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="small">Select platforms to publish to:</div>
            <button
              type="button"
              onClick={handleSelectAllPlatforms}
              className="btn-secondary btn-small"
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              Select All
            </button>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={platforms.youtube} onChange={e => setPlatforms(p => ({ ...p, youtube: e.target.checked }))} />
              YouTube
            </label>
            {platforms.youtube && (
              <div style={{ marginLeft: '24px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: videoDuration > 60 ? 0.5 : 1,
                  cursor: videoDuration > 60 ? 'not-allowed' : 'pointer'
                }}>
                  <input
                    type="radio"
                    checked={youtubeVideoType === 'short'}
                    onChange={() => {
                      if (videoDuration > 60) {
                        alert('Video is too long for YouTube Shorts. Maximum duration is 60 seconds.');
                        return;
                      }
                      setYoutubeVideoType('short');
                    }}
                    disabled={videoDuration > 60}
                  />
                  YouTube Short {videoDuration > 60 ? '(Video too long - max 60 seconds for Shorts)' : ''}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="radio"
                    checked={youtubeVideoType === 'long'}
                    onChange={() => setYoutubeVideoType('long')}
                  />
                  Regular YouTube Video
                </label>
              </div>
            )}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={platforms.facebook} onChange={e => setPlatforms(p => ({ ...p, facebook: e.target.checked }))} />
            Facebook
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={platforms.instagram} onChange={e => setPlatforms(p => ({ ...p, instagram: e.target.checked }))} />
            Instagram
          </label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={platforms.tiktok} onChange={e => setPlatforms(p => ({ ...p, tiktok: e.target.checked }))} />
              TikTok
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div className="small">Analyze content before uploading to check for potential issues</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={analyzeContent}
              disabled={analyzing || !video}
            >
              {analyzing ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span className="spinner" /> Analyzing...
                </span>
              ) : '🔍 Analyze Content'}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || !Object.values(platforms).some(Boolean) || !video}
            >
              {uploading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span className="spinner" /> Uploading...
                </span>
              ) : '📤 Upload & Schedule'}
            </button>
          </div>
        </div>

        {error && <div className="error-text">{error}</div>}
      </form>
    </div>
  );
}
