import React, { useState, useEffect } from 'react';
import { gardenAPI } from '../services/api';

function GardenView() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const response = await gardenAPI.getZones();
      setZones(response.data);
    } catch (error) {
      console.error('加载花园区域失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getZoneIcon = (zoneName) => {
    if (zoneName.includes('阳光')) return '🌞';
    if (zoneName.includes('阴')) return '🌿';
    if (zoneName.includes('蔬菜')) return '🥬';
    return '🌱';
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <h1 className="page-title">🌿 社区花园种植区划</h1>
      
      <div className="card">
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>花园实景</h2>
        <div style={{ 
          width: '100%', 
          height: '400px', 
          background: 'linear-gradient(135deg, #95d5b2 0%, #74c69d 50%, #40916c 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '5rem',
          marginBottom: '1rem'
        }}>
          🏡🌳🌻🌷🥕
        </div>
        <p style={{ color: 'var(--text-light)' }}>
          社区花园总面积约73.5平方米，分为阳光区、半阴区和蔬菜区三个主要种植区域。
          花园采用有机种植方式，鼓励居民共同参与管理和维护。
        </p>
      </div>

      <h2 style={{ margin: '2rem 0 1rem', color: 'var(--primary-dark)' }}>种植区域</h2>
      <div className="garden-zones">
        {zones.map((zone) => (
          <div key={zone.id} className="zone-card">
            <div className="zone-image">
              <span style={{ fontSize: '5rem' }}>{getZoneIcon(zone.name)}</span>
            </div>
            <div className="zone-content">
              <h3 className="zone-name">{zone.name}</h3>
              <p className="zone-area">📐 面积: {zone.area} 平方米</p>
              <p className="zone-description">{zone.description}</p>
              <div className="plant-tags">
                {zone.plants.map((plant, idx) => (
                  <span key={idx} className="plant-tag">{plant}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>养护要点</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>💧 浇水</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              早晚浇水，避免正午。多肉植物每周1-2次，蔬菜类每日1次。
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>🌾 施肥</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              使用有机堆肥，每月追肥1次。蔬菜区每两周施一次液肥。
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>🐛 病虫害</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              采用生物防治，定期检查叶片。发现虫害及时手工清除或用有机农药。
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>✂️ 修剪</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              及时摘除黄叶、枯枝。月季开花后修剪残花促进复花。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GardenView;
