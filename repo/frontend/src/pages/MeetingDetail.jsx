import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { meetingsAPI, minutesAPI } from '../services/api';

function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    speaker: '',
    content: '',
    speaker_type: '居民'
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadMeeting();
    loadDiscussions();
  }, [id]);

  const loadMeeting = async () => {
    try {
      const response = await meetingsAPI.getById(id);
      setMeeting(response.data);
    } catch (error) {
      console.error('加载会议详情失败:', error);
    }
  };

  const loadDiscussions = async () => {
    try {
      const response = await meetingsAPI.getDiscussions(id);
      setDiscussions(response.data);
    } catch (error) {
      console.error('加载讨论内容失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await meetingsAPI.uploadAudio(id, file);
      setDiscussions(response.data.discussions);
      await loadMeeting();
      alert('音频上传并处理成功！');
    } catch (error) {
      console.error('音频上传失败:', error);
      alert('音频上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleAddDiscussion = async (e) => {
    e.preventDefault();
    if (!newDiscussion.speaker || !newDiscussion.content) return;

    try {
      await meetingsAPI.addDiscussion({
        meeting_id: id,
        ...newDiscussion
      });
      setNewDiscussion({ speaker: '', content: '', speaker_type: '居民' });
      loadDiscussions();
    } catch (error) {
      console.error('添加讨论失败:', error);
    }
  };

  const handleGenerateMinutes = async (sendEmail = false) => {
    setGenerating(true);
    try {
      await minutesAPI.generate(id, sendEmail);
      if (sendEmail) {
        alert('会议纪要已生成并发送至居委会！');
      } else {
        alert('会议纪要生成成功！');
      }
      navigate(`/minutes/${id}`);
    } catch (error) {
      console.error('生成纪要失败:', error);
      alert('生成纪要失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!meeting) {
    return <div className="loading">会议不存在</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link to="/meetings" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            ← 返回会议列表
          </Link>
          <h1 className="page-title" style={{ marginTop: '0.5rem' }}>{meeting.title}</h1>
          <p style={{ color: 'var(--text-light)' }}>
            📅 {meeting.date} | 📍 {meeting.location}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-success"
            onClick={() => handleGenerateMinutes(false)}
            disabled={generating}
          >
            {generating ? '生成中...' : '🎯 生成纪要'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleGenerateMinutes(true)}
            disabled={generating}
          >
            {generating ? '发送中...' : '📧 生成并发送邮件'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>🎤 上传会议录音</h2>
        {!meeting.audio_processed ? (
          <div
            className="upload-area"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <div className="upload-icon">{uploading ? '⏳' : '📁'}</div>
            <p style={{ color: 'var(--text-light)' }}>
              {uploading ? '正在处理音频...' : '点击或拖拽上传会议录音文件'}
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              支持 MP3, WAV, M4A 等格式
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#e8f5e9', borderRadius: '8px' }}>
            <span style={{ fontSize: '2rem' }}>✓</span>
            <div>
              <p style={{ fontWeight: '600', color: 'var(--primary-dark)' }}>音频已处理</p>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                已完成语音转写和说话人识别
              </p>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              style={{ marginLeft: 'auto' }}
            >
              重新上传
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>💬 添加讨论记录</h2>
        <form onSubmit={handleAddDiscussion}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>发言人</label>
              <input
                type="text"
                value={newDiscussion.speaker}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, speaker: e.target.value })}
                placeholder="发言人姓名"
                required
              />
            </div>
            <div className="form-group">
              <label>身份</label>
              <select
                value={newDiscussion.speaker_type}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, speaker_type: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}
              >
                <option value="发起人">发起人</option>
                <option value="居民">居民</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>发言内容</label>
            <textarea
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
              placeholder="输入发言内容..."
              rows="3"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            添加记录
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>
          📝 讨论记录 ({discussions.length}条)
        </h2>
        {discussions.length === 0 ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem' }}>
            暂无讨论记录
          </p>
        ) : (
          <div className="discussion-list">
            {discussions.map((discussion) => (
              <div
                key={discussion.id}
                className={`discussion-item ${discussion.speaker_type === '发起人' ? 'organizer' : ''}`}
              >
                <div className="discussion-header">
                  <span className={`speaker-badge ${discussion.speaker_type === '发起人' ? 'organizer' : 'resident'}`}>
                    {discussion.speaker_type}
                  </span>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    {discussion.speaker}
                  </span>
                </div>
                <p className="discussion-content">{discussion.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetingDetail;
