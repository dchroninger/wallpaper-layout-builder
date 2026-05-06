import { Icon } from '../icons/Icon';
import { useAppStore } from '../../store/appStore';
import { getAspectRatio } from '../../utils/geometry';

export function InspectorPanel() {
  const monitors = useAppStore((s) => s.monitors);
  const selectedMonitorId = useAppStore((s) => s.selectedMonitorId);
  const cropAreas = useAppStore((s) => s.cropAreas);
  const imageWidth = useAppStore((s) => s.imageWidth);
  const imageHeight = useAppStore((s) => s.imageHeight);
  const updateMonitor = useAppStore((s) => s.updateMonitor);
  const updateCropArea = useAppStore((s) => s.updateCropArea);
  const removeMonitor = useAppStore((s) => s.removeMonitor);
  const toggleMonitorRotation = useAppStore((s) => s.toggleMonitorRotation);
  const setSelectedMonitorId = useAppStore((s) => s.setSelectedMonitorId);

  const monitor = monitors.find((m) => m.id === selectedMonitorId);
  const cropArea = cropAreas.find((c) => c.monitorId === selectedMonitorId);

  if (!monitor) {
    return (
      <div style={{ padding: '24px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 4 }}>Nothing selected</div>
        <div className="hint">Click a monitor on the canvas or in the layers panel.</div>
      </div>
    );
  }

  const cropPixelW = cropArea ? Math.round(cropArea.widthPercent * imageWidth) : 0;
  const cropPixelH = cropArea ? Math.round(cropArea.heightPercent * imageHeight) : 0;
  const ar = getAspectRatio(monitor.spec);

  const updateSpec = (field: 'width' | 'height', value: number) => {
    const newSpec = { ...monitor.spec, [field]: value };
    updateMonitor(monitor.id, { spec: newSpec });
  };

  return (
    <>
      {/* Identity */}
      <div className="inspector-section">
        <h4>Identity</h4>
        <div className="field" style={{ marginBottom: 6 }}>
          <label>Name</label>
          <input
            value={monitor.name}
            onChange={(e) => updateMonitor(monitor.id, { name: e.target.value })}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Type</label>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 'auto' }}>
              {monitor.spec.type}
            </span>
          </div>
          <div className="field">
            <label>AR</label>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 'auto' }}>
              {ar.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Display */}
      <div className="inspector-section">
        <h4>
          <span>Display</span>
          <button
            className="panel-iconbtn"
            onClick={() => toggleMonitorRotation(monitor.id)}
            title="Rotate"
          >
            <Icon name="rotate" size={11} />
          </button>
        </h4>
        <div className="field-row">
          <div className="field">
            <label>W</label>
            <input
              type="number"
              value={monitor.spec.width}
              onChange={(e) => updateSpec('width', parseInt(e.target.value) || 0)}
            />
            <span className="unit">px</span>
          </div>
          <div className="field">
            <label>H</label>
            <input
              type="number"
              value={monitor.spec.height}
              onChange={(e) => updateSpec('height', parseInt(e.target.value) || 0)}
            />
            <span className="unit">px</span>
          </div>
        </div>
        {monitor.diagonalInches !== undefined && (
          <div className="field-row">
            <div className="field">
              <label>Diag</label>
              <input
                type="number"
                step="0.1"
                value={monitor.diagonalInches}
                onChange={(e) => updateMonitor(monitor.id, { diagonalInches: parseFloat(e.target.value) || 0 })}
              />
              <span className="unit">in</span>
            </div>
          </div>
        )}
        {monitor.targetResolution && (
          <div className="field-row">
            <div className="field" style={{ background: 'transparent' }}>
              <label>Target</label>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 'auto' }}>
                {monitor.targetResolution.width}×{monitor.targetResolution.height}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Crop Position */}
      {cropArea && (
        <div className="inspector-section">
          <h4>Crop Position</h4>
          <div className="field-row">
            <div className="field">
              <label>X</label>
              <input
                type="number"
                step="0.1"
                value={parseFloat((cropArea.xPercent * 100).toFixed(1))}
                onChange={(e) => updateCropArea(cropArea.id, { xPercent: (parseFloat(e.target.value) || 0) / 100 })}
              />
              <span className="unit">%</span>
            </div>
            <div className="field">
              <label>Y</label>
              <input
                type="number"
                step="0.1"
                value={parseFloat((cropArea.yPercent * 100).toFixed(1))}
                onChange={(e) => updateCropArea(cropArea.id, { yPercent: (parseFloat(e.target.value) || 0) / 100 })}
              />
              <span className="unit">%</span>
            </div>
          </div>
          <div className="field-row">
            <div className="field" style={{ background: 'transparent' }}>
              <label>Size</label>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 'auto' }}>
                {cropPixelW}×{cropPixelH} px
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="inspector-section">
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn ghost danger"
            style={{ fontSize: 11, height: 26, padding: '0 10px' }}
            onClick={() => {
              removeMonitor(monitor.id);
              setSelectedMonitorId(null);
            }}
          >
            <Icon name="trash" size={11} /> Delete
          </button>
        </div>
      </div>
    </>
  );
}
