'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

import { SectionHeader, SectionShell } from './shared';

type Point = { x: number; y: number };
type TraceNodeKey = 'risk' | 'control' | 'execution' | 'evidence' | 'audit' | 'finding';
type AnchorSet = {
  center: Point;
  top: Point;
  right: Point;
  bottom: Point;
  left: Point;
};
type AnchorMap = Record<TraceNodeKey, AnchorSet>;
type TraceRoute = {
  key: string;
  label: string;
  labelPoint: Point;
  labelOffset: Point;
  points: Point[];
};

const primaryRisk = {
  id: 'R-104',
  label: 'Third-Party Data Exposure',
  owner: 'Ayesha Khan',
  severity: 'Critical',
  category: 'Cybersecurity',
};

const primaryControl = {
  id: 'AC-07',
  label: 'Quarterly Privileged Access Review',
  owner: 'IT Security',
  cadence: 'Quarterly',
  nextRun: 'Q3 2026',
};

const primaryExecution = {
  id: 'Q3 2026',
  label: 'Privileged Access Review',
  due: 'Sep 30',
  owner: 'IT Security',
};

const primaryEvidence = {
  id: 'EV-311',
  label: 'privileged-access-review.csv',
  size: '184 KB',
  date: 'Sep 29',
};

const primaryAuditTest = {
  id: 'AT-018',
  label: 'Access review sampling',
  reviewed: '12 / 12 reviewed',
  exceptions: '1 exception',
  auditor: 'M. Chen',
};

const primaryFinding = {
  id: 'F-003',
  label: 'Missing reviewer sign-off',
  owner: 'Ayesha Khan',
  due: 'Oct 14',
};

const nodeOrder = ['risk', 'control', 'execution', 'evidence', 'audit', 'finding'] as const;

const nodeLayout = {
  risk: 'md:col-span-4 md:col-start-1 md:row-start-1 md:justify-self-start',
  control: 'md:col-span-4 md:col-start-5 md:row-start-1 md:justify-self-center',
  execution: 'md:col-span-4 md:col-start-9 md:row-start-1 md:justify-self-end',
  finding: 'md:col-span-4 md:col-start-1 md:row-start-2 md:justify-self-start',
  audit: 'md:col-span-4 md:col-start-5 md:row-start-2 md:justify-self-center',
  evidence: 'md:col-span-4 md:col-start-9 md:row-start-2 md:justify-self-end',
} satisfies Record<TraceNodeKey, string>;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function polylinePath(points: Point[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function polylineLength(points: Point[]) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]!;
    const current = points[index]!;
    total += Math.hypot(current.x - previous.x, current.y - previous.y);
  }
  return total;
}

function pointOnPolyline(points: Point[], t: number): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0]!;

  const total = polylineLength(points);
  if (total === 0) return points[0]!;

  let traveled = total * clamp(t, 0, 1);
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1]!;
    const end = points[index]!;
    const segmentLength = Math.hypot(end.x - start.x, end.y - start.y);
    if (segmentLength === 0) continue;

    if (traveled <= segmentLength) {
      const ratio = traveled / segmentLength;
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      };
    }

    traveled -= segmentLength;
  }

  return points[points.length - 1]!;
}

function measureAnchors(nodeRects: Record<TraceNodeKey, HTMLElement | null>, containerRect: DOMRect) {
  const anchors = {} as AnchorMap;

  nodeOrder.forEach((key) => {
    const element = nodeRects[key];
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top;

    anchors[key] = {
      center: { x: x + rect.width / 2, y: y + rect.height / 2 },
      top: { x: x + rect.width / 2, y },
      right: { x: x + rect.width, y: y + rect.height / 2 },
      bottom: { x: x + rect.width / 2, y: y + rect.height },
      left: { x, y: y + rect.height / 2 },
    };
  });

  return anchors;
}

export function PlatformLifecycleSection() {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<TraceNodeKey, HTMLElement | null>>({
    risk: null,
    control: null,
    execution: null,
    evidence: null,
    audit: null,
    finding: null,
  });
  const playedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tracePoint, setTracePoint] = useState<Point | null>(null);
  const [sceneLayout, setSceneLayout] = useState<{ width: number; height: number; anchors: AnchorMap | null }>({
    width: 0,
    height: 0,
    anchors: null,
  });

  const routes = useMemo<TraceRoute[]>(() => {
    if (!sceneLayout.anchors) return [];

    const { anchors, width, height } = sceneLayout;
    const topRowTop = Math.min(anchors.risk.top.y, anchors.control.top.y, anchors.execution.top.y);
    const bottomRowBottom = Math.max(anchors.finding.bottom.y, anchors.audit.bottom.y, anchors.evidence.bottom.y);
    const topBridgeY = clamp(topRowTop - clamp(height * 0.03, 12, 18), 18, topRowTop - 1);
    const lowerBridgeY = clamp(bottomRowBottom + clamp(height * 0.08, 18, 30), bottomRowBottom + 12, height - 20);
    const horizontalPad = clamp(width * 0.02, 16, 40);

    return [
      {
        key: 'risk-control',
        label: 'mitigated by',
        labelPoint: {
          x: (anchors.risk.right.x + anchors.control.left.x) / 2,
          y: topBridgeY + 14,
        },
        labelOffset: { x: 0, y: 0 },
        points: [
          anchors.risk.right,
          { x: anchors.risk.right.x + horizontalPad, y: topBridgeY },
          { x: anchors.control.left.x - horizontalPad, y: topBridgeY },
          anchors.control.left,
        ],
      },
      {
        key: 'control-execution',
        label: 'scheduled as',
        labelPoint: {
          x: (anchors.control.right.x + anchors.execution.left.x) / 2,
          y: topBridgeY + 14,
        },
        labelOffset: { x: 0, y: 0 },
        points: [
          anchors.control.right,
          { x: anchors.control.right.x + horizontalPad, y: topBridgeY },
          { x: anchors.execution.left.x - horizontalPad, y: topBridgeY },
          anchors.execution.left,
        ],
      },
      {
        key: 'execution-evidence',
        label: 'produced',
        labelPoint: {
          x: (anchors.execution.bottom.x + anchors.evidence.top.x) / 2 + 84,
          y: (anchors.execution.bottom.y + anchors.evidence.top.y) / 2,
        },
        labelOffset: { x: 0, y: 0 },
        points: [
          {
            x: (anchors.execution.bottom.x + anchors.evidence.top.x) / 2,
            y: anchors.execution.bottom.y + 10,
          },
          {
            x: (anchors.execution.bottom.x + anchors.evidence.top.x) / 2,
            y: anchors.evidence.top.y - 10,
          },
        ],
      },
      {
        key: 'evidence-audit',
        label: 'sampled by',
        labelPoint: {
          x: (anchors.evidence.left.x + anchors.audit.right.x) / 2,
          y: lowerBridgeY - 12,
        },
        labelOffset: { x: 0, y: 0 },
        points: [
          anchors.evidence.left,
          { x: anchors.evidence.left.x - horizontalPad, y: lowerBridgeY },
          { x: anchors.audit.right.x + horizontalPad, y: lowerBridgeY },
          anchors.audit.right,
        ],
      },
      {
        key: 'audit-finding',
        label: 'resulted in',
        labelPoint: {
          x: (anchors.audit.left.x + anchors.finding.right.x) / 2,
          y: lowerBridgeY - 12,
        },
        labelOffset: { x: 0, y: 0 },
        points: [
          anchors.audit.left,
          { x: anchors.audit.left.x - horizontalPad, y: lowerBridgeY },
          { x: anchors.finding.right.x + horizontalPad, y: lowerBridgeY },
          anchors.finding.right,
        ],
      },
    ];
  }, [sceneLayout]);

  const activeNodeProgress = useMemo(
    () => nodeOrder.map((_, index) => clamp(progress * nodeOrder.length - index, 0, 1)),
    [progress],
  );

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      setTracePoint(null);
      return;
    }

    if (!isVisible || routes.length === 0 || playedRef.current) return;
    playedRef.current = true;

    const start = performance.now();
    const duration = 3600;
    let frame = 0;

    const tick = () => {
      const elapsed = performance.now() - start;
      const next = Math.min(1, elapsed / duration);
      setProgress(next);

      const total = routes.length;
      const span = 1 / total;
      const active = Math.min(total - 1, Math.floor(next / span));
      const local = clamp((next - active * span) / span, 0, 1);
      const route = routes[active];
      if (route) {
        setTracePoint(pointOnPolyline(route.points, local));
      }

      if (next < 1) {
        frame = window.requestAnimationFrame(tick);
      } else {
        setTracePoint(null);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [isVisible, reducedMotion, routes]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const updateLayout = () => {
      const rect = scene.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const anchors = measureAnchors(nodeRefs.current, rect);
      if (!anchors.risk || !anchors.control || !anchors.execution || !anchors.evidence || !anchors.audit || !anchors.finding) {
        return;
      }

      setSceneLayout({
        width: rect.width,
        height: rect.height,
        anchors,
      });
    };

    const observer = new ResizeObserver(updateLayout);
    observer.observe(scene);
    nodeOrder.forEach((key) => {
      const element = nodeRefs.current[key];
      if (element) observer.observe(element);
    });

    const frame = window.requestAnimationFrame(updateLayout);
    window.addEventListener('resize', updateLayout);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateLayout);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.28, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <SectionShell id="platform" className="pt-6 sm:pt-10">
      <div ref={rootRef} className="relative">
        <div className="mx-auto max-w-[84rem]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="PLATFORM LIFECYCLE"
              title="One operational flow from obligation to closure"
              description="RiskSphere is built around the full control and assurance lifecycle, not disconnected lists of risks, tasks, and findings."
            />
            <div className="flex items-center gap-3 text-right text-[0.68rem] uppercase tracking-[0.26em] text-text-muted md:pt-8">
              <div>
                <div>Trace / R-104</div>
                <div>6 connected records</div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/6 pt-6">
            <div
              ref={sceneRef}
              className="relative min-h-[20rem] overflow-hidden px-2 py-1 sm:px-3 md:min-h-[22rem] md:px-4"
            >
              <svg
                className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                viewBox={`0 0 ${Math.max(sceneLayout.width, 1)} ${Math.max(sceneLayout.height, 1)}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={`${id}-base`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(148,163,184,0.18)" />
                    <stop offset="100%" stopColor="rgba(100,116,139,0.24)" />
                  </linearGradient>
                  <linearGradient id={`${id}-active`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.18)" />
                    <stop offset="50%" stopColor="rgba(34,211,238,0.96)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.28)" />
                  </linearGradient>
                  <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="1.1" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {routes.map((route) => (
                  <path
                    key={`${route.key}-base`}
                    d={polylinePath(route.points)}
                    fill="none"
                    stroke={route.key === 'execution-evidence' ? `url(#${id}-active)` : `url(#${id}-base)`}
                    strokeWidth={route.key === 'execution-evidence' ? '2.1' : '1'}
                    strokeOpacity={route.key === 'execution-evidence' ? '0.9' : '1'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {routes.map((route, index) => {
                  const segmentProgress = clamp(progress * routes.length - index, 0, 1);
                  return (
                    <motion.path
                      key={`${route.key}-active`}
                      d={polylinePath(route.points)}
                      fill="none"
                      stroke={`url(#${id}-active)`}
                      strokeWidth={route.key === 'execution-evidence' ? '2.8' : '1.8'}
                      strokeOpacity={route.key === 'execution-evidence' ? '1' : '1'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: segmentProgress, opacity: segmentProgress > 0 ? 1 : 0 }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                    />
                  );
                })}

                {tracePoint && !reducedMotion ? (
                  <g filter={`url(#${id}-glow)`}>
                    <circle cx={tracePoint.x} cy={tracePoint.y} r="2.7" fill="rgba(34,211,238,0.16)" />
                    <circle cx={tracePoint.x} cy={tracePoint.y} r="1.05" fill="rgba(34,211,238,0.95)" />
                  </g>
                ) : null}
              </svg>

              <div className="pointer-events-none absolute inset-0 z-20">
                {routes.map((route, index) => {
                  const segmentProgress = clamp(progress * routes.length - index, 0, 1);
                  return (
                    <motion.div
                      key={route.key}
                      className="absolute -translate-x-1/2 -translate-y-1/2 text-[0.6rem] uppercase tracking-[0.14em] text-text-muted/90 [text-shadow:0_1px_0_rgba(7,11,20,0.75)]"
                      style={{
                        left: `${route.labelPoint.x + route.labelOffset.x}px`,
                        top: `${route.labelPoint.y + route.labelOffset.y}px`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: segmentProgress > 0 ? 1 : 0.35 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {route.label}
                    </motion.div>
                  );
                })}
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-[auto_auto] md:items-start md:gap-x-6 md:gap-y-4">
                <motion.article
                ref={(element) => {
                    nodeRefs.current.risk = element;
                  }}
                  className={`relative w-full max-w-[15.6rem] rounded-[16px] border border-border-subtle/70 bg-bg-base p-3 text-left md:w-[15.6rem] ${nodeLayout.risk}`}
                  initial={false}
                  animate={{ opacity: reducedMotion ? 1 : 0.76 + (activeNodeProgress[0] ?? 0) * 0.24 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-text-muted">
                        <ShieldCheckIcon className="size-3.5 text-text-primary" />
                        Risk / Requirement
                      </div>
                      <h3 className="mt-3 font-heading text-lg text-text-primary">{primaryRisk.id}</h3>
                      <p className="mt-1.5 text-[0.92rem] leading-6 text-text-secondary">{primaryRisk.label}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1.5 border-t border-white/8 pt-3 text-[0.84rem] text-text-secondary">
                    <div className="flex items-center justify-between gap-3">
                      <span>Owner</span>
                      <span className="text-text-primary">{primaryRisk.owner}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Category</span>
                      <span className="text-text-primary">{primaryRisk.category}</span>
                    </div>
                  </div>
                </motion.article>

                <motion.article
                  ref={(element) => {
                    nodeRefs.current.control = element;
                  }}
                  className={`relative w-full max-w-[15.5rem] rounded-[16px] border border-border-subtle/70 bg-bg-base p-3 text-left md:w-[15.5rem] ${nodeLayout.control}`}
                  initial={false}
                  animate={{ opacity: reducedMotion ? 1 : 0.76 + (activeNodeProgress[1] ?? 0) * 0.24 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-text-muted">
                        <WrenchScrewdriverIcon className="size-3.5 text-text-primary" />
                        Control
                      </div>
                      <h3 className="mt-3 font-heading text-lg text-text-primary">{primaryControl.id}</h3>
                      <p className="mt-1.5 text-[0.92rem] leading-6 text-text-secondary">{primaryControl.label}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1.5 border-t border-white/8 pt-3 text-[0.84rem] text-text-secondary">
                    <div className="flex items-center justify-between gap-3">
                      <span>Cadence</span>
                      <span className="text-text-primary">{primaryControl.cadence}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Owner</span>
                      <span className="text-text-primary">{primaryControl.owner}</span>
                    </div>
                  </div>
                </motion.article>

                <motion.article
                  ref={(element) => {
                    nodeRefs.current.execution = element;
                  }}
                  className={`relative w-full max-w-[15rem] rounded-[16px] border border-border-subtle/70 bg-bg-base p-3 text-left md:w-[15rem] ${nodeLayout.execution}`}
                  initial={false}
                  animate={{ opacity: reducedMotion ? 1 : 0.76 + (activeNodeProgress[2] ?? 0) * 0.24 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-text-muted">
                        <ArrowRightIcon className="size-3.5 text-text-primary" />
                        Recurring Execution
                      </div>
                      <h3 className="mt-3 font-heading text-lg text-text-primary">{primaryExecution.id}</h3>
                      <p className="mt-1.5 text-[0.92rem] leading-6 text-text-secondary">{primaryExecution.label}</p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-white/8 pt-3 text-[0.84rem] text-text-secondary">
                    <div className="flex items-center justify-between gap-3">
                      <span>Timeline</span>
                      <span className="text-text-primary">JUL · AUG · SEP ●30</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-3">
                      <span>Owner</span>
                      <span className="text-text-primary">{primaryExecution.owner}</span>
                    </div>
                  </div>
                </motion.article>

                <motion.article
                  ref={(element) => {
                    nodeRefs.current.evidence = element;
                  }}
                  className={`relative w-full max-w-[15.4rem] rounded-[16px] border border-border-subtle/70 bg-bg-base p-3 text-left md:w-[15.4rem] ${nodeLayout.evidence}`}
                  initial={false}
                  animate={{ opacity: reducedMotion ? 1 : 0.76 + (activeNodeProgress[3] ?? 0) * 0.24 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-text-muted">
                        <DocumentTextIcon className="size-3.5 text-text-primary" />
                        Evidence
                      </div>
                      <h3 className="mt-3 font-heading text-lg text-text-primary">{primaryEvidence.id}</h3>
                      <p className="mt-1.5 break-all text-[0.92rem] leading-6 text-text-secondary">{primaryEvidence.label}</p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-white/8 pt-3 text-[0.84rem] text-text-secondary">
                    <div className="flex items-center justify-between gap-3">
                      <span>Size</span>
                      <span className="text-text-primary">{primaryEvidence.size}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-3">
                      <span>Captured</span>
                      <span className="text-text-primary">{primaryEvidence.date}</span>
                    </div>
                  </div>
                </motion.article>

                <motion.article
                  ref={(element) => {
                    nodeRefs.current.audit = element;
                  }}
                  className={`relative w-full max-w-[15rem] rounded-[16px] border border-border-subtle/70 bg-bg-base p-3 text-left md:w-[15rem] ${nodeLayout.audit}`}
                  initial={false}
                  animate={{ opacity: reducedMotion ? 1 : 0.76 + (activeNodeProgress[4] ?? 0) * 0.24 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-text-muted">
                        <MagnifyingGlassIcon className="size-3.5 text-text-primary" />
                        Audit Test
                      </div>
                      <h3 className="mt-3 font-heading text-lg text-text-primary">{primaryAuditTest.id}</h3>
                      <p className="mt-1.5 text-[0.92rem] leading-6 text-text-secondary">{primaryAuditTest.label}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1.5 border-t border-white/8 pt-3 text-[0.84rem] text-text-secondary">
                    <div className="flex items-center justify-between gap-3">
                      <span>Reviewed</span>
                      <span className="text-text-primary">{primaryAuditTest.reviewed}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Exceptions</span>
                      <span className="text-text-primary">{primaryAuditTest.exceptions}</span>
                    </div>
                  </div>
                </motion.article>

                <motion.article
                  ref={(element) => {
                    nodeRefs.current.finding = element;
                  }}
                  className={`relative w-full max-w-[15rem] rounded-[16px] border border-border-subtle/70 bg-bg-base p-3 text-left md:w-[15rem] ${nodeLayout.finding}`}
                  initial={false}
                  animate={{ opacity: reducedMotion ? 1 : 0.76 + (activeNodeProgress[5] ?? 0) * 0.24 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-text-muted">
                        <ExclamationTriangleIcon className="size-3.5 text-text-primary" />
                        Finding / Remediation
                      </div>
                      <h3 className="mt-3 font-heading text-lg text-text-primary">{primaryFinding.id}</h3>
                      <p className="mt-1.5 text-[0.92rem] leading-6 text-text-secondary">{primaryFinding.label}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1.5 border-t border-white/8 pt-3 text-[0.84rem] text-text-secondary">
                    <div className="flex items-center justify-between gap-3">
                      <span>Owner</span>
                      <span className="text-text-primary">{primaryFinding.owner}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Due</span>
                      <span className="text-text-primary">{primaryFinding.due}</span>
                    </div>
                  </div>
                </motion.article>
              </div>

              {sceneLayout.anchors ? (
                <svg
                  className="pointer-events-none absolute inset-0 z-20 h-full w-full"
                  viewBox={`0 0 ${Math.max(sceneLayout.width, 1)} ${Math.max(sceneLayout.height, 1)}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {routes.map((route) => (
                    <path
                      key={`${route.key}-static`}
                      d={polylinePath(route.points)}
                      fill="none"
                      stroke={route.key === 'execution-evidence' ? 'rgba(59,130,246,0.8)' : 'rgba(59,130,246,0.28)'}
                      strokeWidth={route.key === 'execution-evidence' ? '2.8' : '1.2'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {routes.map((route, index) => {
                    const segmentProgress = clamp(progress * routes.length - index, 0, 1);
                    return (
                      <motion.path
                        key={`${route.key}-active`}
                        d={polylinePath(route.points)}
                        fill="none"
                        stroke={route.key === 'execution-evidence' ? 'rgba(34,211,238,0.95)' : 'url(#connector-active)'}
                        strokeWidth={route.key === 'execution-evidence' ? 3.4 : 1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: segmentProgress > 0 ? 1 : 0, opacity: segmentProgress > 0 ? 1 : 0 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                      />
                    );
                  })}
                  <defs>
                    <linearGradient id="connector-active" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(59,130,246,0.18)" />
                      <stop offset="50%" stopColor="rgba(34,211,238,0.96)" />
                      <stop offset="100%" stopColor="rgba(59,130,246,0.28)" />
                    </linearGradient>
                  </defs>
                </svg>
              ) : null}

              <div className="mt-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
