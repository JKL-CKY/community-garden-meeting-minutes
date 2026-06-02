import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { meetingsAPI } from '../services/api';

function MeetingsView() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const response = await meetingsAPI.getAll();
      setMeetings(response.data);
    } catch (error) {
      console.error('加载会议列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      const response = await meetingsAPI.create(formData);
      setMeetings([response.data, ...meetings]);
      setShowCreateForm(false);
      setFormData({ title: '', date: '', location: '', description: '' });
    } catch (error) {
      console.error('创建会议失败:', error);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>📋 会议管理</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
          + 创建新会议
        </button>
      </div>

      {showCreateForm && (
        <div className="card">
          <h2 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>创建新会议</h2>
          <form onSubmit={handleCreateMeeting}>
            <div className="form-group">
              <label>会议标题</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：社区花园共建第一次会议"
                required
              />
            </div>
            <div className="form-group">
              <label>会议日期</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>会议地点</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="例如：社区活动中心二楼会议室"
                required
              />
            </div>
            <div className="form-group">
              <label>会议描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="简要描述会议目的和议程"
                rows="3"
              />
            </div>
            <div className="actions">
              <button type="submit" className="btn btn-primary">创建会议</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {meetings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>暂无会议记录</p>
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            创建第一个会议
          </button>
        </div>
      ) : (
        <div className="meeting-list">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="meeting-item">
              <div className="meeting-info">
                <h3>{meeting.title}</h3>
                <p className="meeting-meta">
                  📅 {meeting.date} | 📍 {meeting.location}
                </p>
                {meeting.description && (
                  <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
                    {meeting.description}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={`status-badge ${meeting.audio_processed ? 'processed' : 'pending'}`}>
                  {meeting.audio_processed ? '✓ 已处理' : '⏳ 待处理'}
                </span>
                <Link to={`/meetings/${meeting.id}`} className="btn btn-primary">
                  查看详情
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MeetingsView;
