import { useState, useRef, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import type { DockLayout, DockGroup, PanelDef } from '../../types/dock';

const RAIL_HIT_DOCK = 280;
const RAIL_HIT_FLOAT = 140;
const DRAG_THRESHOLD = 5;

interface DragState {
  panelId: string;
  x: number;
  y: number;
  offX: number;
  offY: number;
  w: number;
  h: number;
  dropTarget: DropTarget | null;
}

interface DropTarget {
  side: 'left' | 'right';
  index: number;
  mode?: string;
  asTab?: boolean;
  groupId?: string;
}

interface DockManagerProps {
  panels: Record<string, PanelDef>;
  layout: DockLayout;
  setLayout: (layout: DockLayout) => void;
}

export function DockManager({ panels, layout, setLayout }: DockManagerProps) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const cloneLayout = (l = layoutRef.current): DockLayout => ({
    left: l.left.map((g) => ({ ...g, panels: [...g.panels] })),
    right: l.right.map((g) => ({ ...g, panels: [...g.panels] })),
    floating: { ...l.floating },
  });

  const removePanelFromLayout = (l: DockLayout, pid: string) => {
    l.left = l.left
      .map((g) => ({
        ...g,
        panels: g.panels.filter((p) => p !== pid),
        activeTab: g.activeTab === pid ? g.panels.find((p) => p !== pid) || '' : g.activeTab,
      }))
      .filter((g) => g.panels.length);
    l.right = l.right
      .map((g) => ({
        ...g,
        panels: g.panels.filter((p) => p !== pid),
        activeTab: g.activeTab === pid ? g.panels.find((p) => p !== pid) || '' : g.activeTab,
      }))
      .filter((g) => g.panels.length);
    delete l.floating[pid];
    return l;
  };

  const computeDropTarget = (side: 'left' | 'right', my: number, groups: DockGroup[]): DropTarget => {
    const top = 64;
    const bottom = window.innerHeight - 64;
    const usable = bottom - top;
    const groupCount = groups.length;
    if (groupCount === 0) return { side, index: 0, mode: 'stacked' };
    const groupH = usable / groupCount;
    const localY = Math.max(0, my - top);
    const idx = Math.max(0, Math.min(groupCount - 1, Math.floor(localY / groupH)));
    const within = (localY - idx * groupH) / groupH;
    if (within < 0.22) return { side, index: idx, mode: 'stacked' };
    if (within > 0.78) return { side, index: idx + 1, mode: 'stacked' };
    return { side, index: idx, asTab: true, groupId: groups[idx].id };
  };

  const computeRailDrop = (clientX: number, clientY: number, hitWidth: number): DropTarget | null => {
    const W = window.innerWidth;
    if (clientX < hitWidth) return computeDropTarget('left', clientY, layoutRef.current.left);
    if (clientX > W - hitWidth) return computeDropTarget('right', clientY, layoutRef.current.right);
    return null;
  };

  const commitDrop = (panelId: string, dropTarget: DropTarget | null, floatGeometry: { x: number; y: number; w: number; h: number }) => {
    const next = cloneLayout();
    removePanelFromLayout(next, panelId);
    if (dropTarget) {
      const { side, index, groupId, asTab } = dropTarget;
      if (asTab && groupId) {
        const g = next[side].find((gg) => gg.id === groupId);
        if (g) {
          g.panels.push(panelId);
          g.mode = 'tabs';
          g.activeTab = panelId;
        } else {
          next.floating[panelId] = floatGeometry;
        }
      } else {
        const newGroup: DockGroup = {
          id: 'g_' + Math.random().toString(36).slice(2, 7),
          mode: 'stacked',
          panels: [panelId],
          activeTab: panelId,
        };
        next[side].splice(Math.max(0, index), 0, newGroup);
      }
    } else {
      next.floating[panelId] = floatGeometry;
    }
    setLayout(next);
  };

  const beginDockDrag = (panelId: string, originEvent: React.MouseEvent) => {
    const startX = originEvent.clientX;
    const startY = originEvent.clientY;
    const headerEl = originEvent.currentTarget as HTMLElement;
    const panelEl = headerEl.closest('.section-panel') || headerEl.parentElement;
    const headerRect = headerEl.getBoundingClientRect();
    const panelRect = panelEl ? panelEl.getBoundingClientRect() : headerRect;
    const offX = startX - headerRect.left;
    const offY = startY - headerRect.top;
    const W = panelRect.width;
    const H = panelRect.height;

    let started = false;
    let cleanedUp = false;

    const onMove = (e: MouseEvent) => {
      if (!started && Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD) return;
      started = true;
      const x = e.clientX - offX;
      const y = e.clientY - offY;
      const dropTarget = computeRailDrop(e.clientX, e.clientY, RAIL_HIT_DOCK);
      setDrag({ panelId, x, y, offX, offY, w: W, h: H, dropTarget });
    };

    const onUp = (e: MouseEvent) => {
      if (cleanedUp) return;
      cleanedUp = true;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (!started) return;
      const dropTarget = computeRailDrop(e.clientX, e.clientY, RAIL_HIT_DOCK);
      const x = e.clientX - offX;
      const y = e.clientY - offY;
      commitDrop(panelId, dropTarget, { x, y, w: W, h: H });
      setDrag(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const setActiveTab = (groupId: string, panelId: string) => {
    const next = cloneLayout();
    [...next.left, ...next.right].forEach((g) => {
      if (g.id === groupId) g.activeTab = panelId;
    });
    setLayout(next);
  };

  const closePanel = (panelId: string) => {
    const next = cloneLayout();
    removePanelFromLayout(next, panelId);
    setLayout(next);
  };

  const moveFloating = (panelId: string, nx: number, ny: number) => {
    const next = cloneLayout();
    if (next.floating[panelId]) {
      next.floating[panelId] = { ...next.floating[panelId], x: nx, y: ny };
      setLayout(next);
    }
  };

  const TabBar = ({ group }: { group: DockGroup }) => (
    <div className="tabs">
      {group.panels.map((pid) => {
        const p = panels[pid];
        if (!p) return null;
        const active = group.activeTab === pid;
        return (
          <div
            key={pid}
            className={`tab ${active ? 'active' : ''}`}
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).closest('.tab-close')) return;
              if (e.button !== 0) return;
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              const justClick = (ev: MouseEvent) => {
                if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) {
                  setActiveTab(group.id, pid);
                }
                window.removeEventListener('mouseup', justClick);
              };
              window.addEventListener('mouseup', justClick, { once: true });
              beginDockDrag(pid, e);
            }}
            title={`Drag to move · ${p.title}`}
          >
            <span className="dot" style={{ background: p.dotColor, boxShadow: `0 0 6px ${p.dotColor}` }} />
            <span className="tab-label">{p.title}</span>
            <button
              className="tab-close panel-iconbtn"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); closePanel(pid); }}
            >
              <Icon name="x" size={10} />
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderGroup = (group: DockGroup) => {
    if (group.panels.length === 0) return null;
    if (group.mode === 'tabs') {
      const activeId = group.activeTab && group.panels.includes(group.activeTab) ? group.activeTab : group.panels[0];
      const ap = panels[activeId];
      if (!ap) return null;
      return (
        <div key={group.id} className="dock-group" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="panel section-panel expanded" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <TabBar group={group} />
            <div className="panel-body" style={{ padding: '8px 10px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
              {ap.render({ inDock: true })}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div key={group.id} className="dock-group" style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {group.panels.map((pid) => {
          const p = panels[pid];
          if (!p) return null;
          return (
            <DockedSectionPanel
              key={pid}
              panel={p}
              onClose={() => closePanel(pid)}
              onHeaderMouseDown={(e) => beginDockDrag(pid, e)}
            />
          );
        })}
      </div>
    );
  };

  const floatingIds = Object.keys(layout.floating);

  const dropIndicator = drag?.dropTarget
    ? (() => {
        const { side, index, asTab, groupId } = drag.dropTarget;
        const top = 64;
        const bottom = window.innerHeight - 64;
        const groups = layout[side];
        const usable = bottom - top;
        const groupCount = groups.length;
        if (asTab) {
          const idx = groups.findIndex((g) => g.id === groupId);
          const groupH = usable / Math.max(1, groupCount);
          return { side, top: top + idx * groupH, height: groupH, mode: 'tab' };
        }
        const groupH = groupCount > 0 ? usable / groupCount : usable;
        return { side, top: top + index * groupH - 2, height: 4, mode: 'line' };
      })()
    : null;

  return (
    <>
      <div className={`rail left ${drag ? 'drag-active' : ''}`}>
        {layout.left.length === 0 && drag && <div className="dock-empty">Drop here to dock left</div>}
        {layout.left.map((g) => renderGroup(g))}
      </div>

      <div className={`rail right ${drag ? 'drag-active' : ''}`}>
        {layout.right.length === 0 && drag && <div className="dock-empty">Drop here to dock right</div>}
        {layout.right.map((g) => renderGroup(g))}
      </div>

      {floatingIds.map((pid) => {
        const p = panels[pid];
        if (!p) return null;
        const f = layout.floating[pid];
        return (
          <FloatingDocPanel
            key={pid}
            panelId={pid}
            panel={p}
            x={f.x}
            y={f.y}
            w={f.w}
            h={f.h}
            onClose={() => closePanel(pid)}
            onMoveFloating={moveFloating}
            commitDrop={commitDrop}
            computeRailDrop={computeRailDrop}
            setDrag={setDrag}
          />
        );
      })}

      {drag &&
        (() => {
          const p = panels[drag.panelId];
          if (!p) return null;
          return (
            <div className="drag-ghost" style={{ left: drag.x, top: drag.y, width: Math.min(drag.w, 280) }}>
              <div className="panel-header" style={{ borderBottom: 'none' }}>
                <div className="panel-title">
                  <span className="dot" style={{ background: p.dotColor, boxShadow: `0 0 8px ${p.dotColor}` }} />
                  {p.title}
                </div>
              </div>
            </div>
          );
        })()}

      {dropIndicator && (
        <div
          className={`drop-indicator ${dropIndicator.mode}`}
          style={{
            left: dropIndicator.side === 'left' ? 16 : 'auto',
            right: dropIndicator.side === 'right' ? 16 : 'auto',
            top: dropIndicator.top,
            height: dropIndicator.height,
            width: 280,
          }}
        />
      )}
    </>
  );
}

function DockedSectionPanel({
  panel,
  onClose,
  onHeaderMouseDown,
}: {
  panel: PanelDef;
  onClose: () => void;
  onHeaderMouseDown: (e: React.MouseEvent) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`section-panel ${open ? 'expanded' : 'collapsed'}`}>
      <div
        className="panel-header"
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('.panel-iconbtn')) return;
          if (e.button !== 0) return;
          const startX = e.clientX;
          const startY = e.clientY;
          const onUpClick = (ev: MouseEvent) => {
            if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) {
              setOpen((v) => !v);
            }
            window.removeEventListener('mouseup', onUpClick);
          };
          window.addEventListener('mouseup', onUpClick, { once: true });
          onHeaderMouseDown(e);
        }}
      >
        <div className="panel-title">
          <span className="dot" style={{ background: panel.dotColor, boxShadow: `0 0 8px ${panel.dotColor}` }} />
          {panel.title}
        </div>
        <div className="panel-actions" onMouseDown={(e) => e.stopPropagation()}>
          {panel.headerActions}
          <button className="panel-iconbtn" onClick={() => setOpen((v) => !v)}>
            <svg
              style={{ width: 12, height: 12, transform: open ? '' : 'rotate(-90deg)', transition: 'transform .15s' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <button className="panel-iconbtn" onClick={onClose} title="Close">
            <Icon name="x" size={11} />
          </button>
        </div>
      </div>
      {open && (
        <div className="panel-body" style={{ padding: '8px 10px', overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
          {panel.render({ inDock: true })}
        </div>
      )}
    </div>
  );
}

function FloatingDocPanel({
  panel,
  panelId,
  x,
  y,
  w,
  onClose,
  onMoveFloating,
  commitDrop,
  computeRailDrop,
  setDrag,
}: {
  panel: PanelDef;
  panelId: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  onClose: () => void;
  onMoveFloating: (pid: string, x: number, y: number) => void;
  commitDrop: (pid: string, target: DropTarget | null, geo: { x: number; y: number; w: number; h: number }) => void;
  computeRailDrop: (cx: number, cy: number, hitW: number) => DropTarget | null;
  setDrag: (d: DragState | null) => void;
}) {
  const [pos, setPos] = useState({ x, y });
  const posRef = useRef(pos);
  posRef.current = pos;

  const draggingRef = useRef(false);
  useEffect(() => {
    if (!draggingRef.current) setPos({ x, y });
  }, [x, y]);

  const [hidden, setHidden] = useState(false);

  const onHeaderDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.panel-iconbtn')) return;
    if (e.button !== 0) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = posRef.current.x;
    const origY = posRef.current.y;
    const headerRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const W = (e.currentTarget as HTMLElement).parentElement?.offsetWidth || 280;
    const H = (e.currentTarget as HTMLElement).parentElement?.offsetHeight || 220;
    const offX = startX - headerRect.left;
    const offY = startY - headerRect.top;
    let started = false;
    let inGhost = false;
    let cleanedUp = false;

    const onMove = (ev: MouseEvent) => {
      if (!started && Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return;
      started = true;
      draggingRef.current = true;
      const dropTarget = computeRailDrop(ev.clientX, ev.clientY, RAIL_HIT_FLOAT);
      if (dropTarget) {
        if (!inGhost) {
          inGhost = true;
          setHidden(true);
        }
        setDrag({
          panelId,
          x: ev.clientX - offX,
          y: ev.clientY - offY,
          offX,
          offY,
          w: W,
          h: H,
          dropTarget,
        });
      } else {
        if (inGhost) {
          inGhost = false;
          setHidden(false);
          setDrag(null);
        }
        const nx = origX + (ev.clientX - startX);
        const ny = origY + (ev.clientY - startY);
        setPos({ x: nx, y: ny });
      }
    };

    const onUp = (ev: MouseEvent) => {
      if (cleanedUp) return;
      cleanedUp = true;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      draggingRef.current = false;
      if (!started) return;
      const dropTarget = computeRailDrop(ev.clientX, ev.clientY, RAIL_HIT_FLOAT);
      if (dropTarget) {
        setDrag(null);
        setHidden(false);
        commitDrop(panelId, dropTarget, { x: posRef.current.x, y: posRef.current.y, w: W, h: H });
      } else {
        setHidden(false);
        setDrag(null);
        onMoveFloating(panelId, posRef.current.x, posRef.current.y);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  if (hidden) return null;

  return (
    <div className="panel floating" style={{ left: pos.x, top: pos.y, width: w || 280, maxHeight: 'calc(100vh - 96px)' }}>
      <div className="panel-header" onMouseDown={onHeaderDown}>
        <div className="panel-title">
          <span className="dot" style={{ background: panel.dotColor, boxShadow: `0 0 8px ${panel.dotColor}` }} />
          {panel.title}
        </div>
        <div className="panel-actions" onMouseDown={(e) => e.stopPropagation()}>
          {panel.headerActions}
          <button className="panel-iconbtn" onClick={onClose} title="Close">
            <Icon name="x" size={11} />
          </button>
        </div>
      </div>
      <div className="panel-body" style={{ padding: '8px 10px', overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
        {panel.render({ inDock: false })}
      </div>
    </div>
  );
}
