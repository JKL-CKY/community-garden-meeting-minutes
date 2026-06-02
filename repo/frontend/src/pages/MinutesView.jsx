import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { minutesAPI, meetingsAPI } from '../services/api';

function MinutesView() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [minutes, setMinutes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [meetingRes, minutesRes] = await Promise.all([
        meetingsAPI.getById(id),
        minutesAPI.getByMeetingId(id)
      ]);
      setMeeting(meetingRes.data);
      setMinutes(minutesRes.data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!minutes) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
        <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
          该会议尚未生成纪要
        </p>
        <Link to={`/meetings/${id}`} className="btn btn-primary">
          返回会议详情生成纪要
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to={`/meetings/${id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
          ← 返回会议详情
        </Link>
        <h1 className="page-title" style={{ marginTop: '0.5rem' }}>
          📄 {meeting?.title} - 会议纪要
        </h1>
        <p style={{ color: 'var(--text-light)' }}>
          生成时间: {new Date(minutes.created_at).toLocaleString('zh-CN')}
        </p>
      </div>

      <div className="card minutes-section">
        <h3>📋 会议摘要</h3>
        <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
          {minutes.summary}
        </div>
      </div>

      <div className="card minutes-section">
        <h3>🗺️ 植物配置图</h3>
        <pre className="ascii-diagram">{minutes.plant_diagram}</pre>
      </div>

      <div className="card minutes-section">
        <h3>💧 浇水值日表</h3>
        <table>
          <thead>
            <tr>
              <th>居民</th>
              <th>日期</th>
              <th>负责区域</th>
              <th>负责植物</th>
            </tr>
          </thead>
          <tbody>
            {minutes.watering_schedule.map((duty, idx) => (
              <tr key={idx}>
                <td>{duty.resident}</td>
                <td>{duty.day}</td>
                <td>{duty.zones.join(', ')}</td>
                <td>{duty.plants.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card minutes-section">
        <h3>💰 预算明细</h3>
        <table>
          <thead>
            <tr>
              <th>项目</th>
              <th>数量</th>
              <th>单价 (¥)</th>
              <th>总价 (¥)</th>
            </tr>
          </thead>
          <tbody>
            {minutes.budget.map((item, idx) => (
              <tr key={idx}>
                <td>{item.item}</td>
                <td>{item.quantity}</td>
                <td>{item.unit_price.toFixed(2)}</td>
                <td>{item.total_price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="total-budget">
          总计: ¥{minutes.total_budget?.toFixed(2) || '0.00'}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>📧 邮件发送</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#e8f5e9', borderRadius: '8px' }}>
          <span style={{ fontSize: '2rem' }}>✓</span>
          <div>
            <p style={{ fontWeight: '600', color: 'var(--primary-dark)' }}>纪要已发送至居委会</p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              包含完整的会议摘要、植物配置图、浇水值日表和预算明细
            </p>
          </div>
        </div>
      </div>

      <div className="actions" style={{ marginTop: '2rem' }}>
        <Link to="/meetings" className="btn btn-secondary">
          返回会议列表
        </Link>
        <Link to="/" className="btn btn-primary">
          查看花园概览
        </Link>
      </div>
    </div>
  );
}

export default MinutesView;
