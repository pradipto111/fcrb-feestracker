import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import type { CollisionDetection } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { colors, spacing, typography, borderRadius, shadows } from "../../theme/design-tokens";
import { LeadCard, CrmLead } from "./LeadCard";

type DraggableLeadCardProps = {
  lead: CrmLead;
  onClick: () => void;
  isSelected?: boolean;
  hasOverdueFollowUp?: boolean;
  isHot?: boolean;
  lastActivityTime?: string | undefined;
};

const DraggableLeadCard: React.FC<DraggableLeadCardProps> = ({
  lead,
  onClick,
  isSelected,
  hasOverdueFollowUp,
  isHot,
  lastActivityTime,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
    id: lead.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    // No transition while dragging so the placeholder follows the cursor smoothly
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.4 : 1,
    visibility: isDragging ? "hidden" : "visible",
    touchAction: "none",
    cursor: "grab",
    userSelect: isDragging ? "none" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={isDragging ? { pointerEvents: "none" } : undefined}>
        <LeadCard
          lead={lead}
          onClick={onClick}
          isSelected={isSelected}
          hasOverdueFollowUp={hasOverdueFollowUp}
          isHot={isHot}
          lastActivityTime={lastActivityTime}
        />
      </div>
    </div>
  );
};

// Stage-specific color mapping
export const getStageColor = (stage: string): { main: string; light: string; bg: string } => {
  switch (stage) {
    case "NEW":
      return {
        main: colors.primary.main,
        light: colors.primary.light,
        bg: `${colors.primary.main}15`,
      };
    case "CONTACTED":
      return {
        main: colors.info.main,
        light: colors.info.light,
        bg: `${colors.info.main}15`,
      };
    case "FOLLOW_UP":
      return {
        main: colors.warning.main,
        light: colors.warning.light,
        bg: `${colors.warning.main}15`,
      };
    case "WILL_JOIN":
      return {
        main: colors.accent.main,
        light: colors.accent.light,
        bg: `${colors.accent.main}15`,
      };
    case "JOINED":
      return {
        main: colors.success.main,
        light: colors.success.light,
        bg: `${colors.success.main}15`,
      };
    case "UNINTERESTED_NO_RESPONSE":
      return {
        main: colors.text.muted,
        light: colors.text.secondary,
        bg: `${colors.text.muted}10`,
      };
    default:
      return {
        main: colors.text.muted,
        light: colors.text.secondary,
        bg: "rgba(255, 255, 255, 0.05)",
      };
  }
};

// Format stage name for display
export const formatStageName = (stage: string): string => {
  return stage
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

type StageColumnProps = {
  stage: string;
  leads: CrmLead[];
  onLeadClick: (lead: CrmLead) => void;
  selectedLeadId?: string;
  getOverdueFollowUps: (leadId: string) => boolean;
  getIsHot: (lead: CrmLead) => boolean;
  getLastActivityTime: (leadId: string) => string | undefined;
  stageColor: { main: string; light: string; bg: string };
  stageIndex: number;
  totalStages: number;
};

const StageColumn: React.FC<StageColumnProps> = ({
  stage,
  leads,
  onLeadClick,
  selectedLeadId,
  getOverdueFollowUps,
  getIsHot,
  getLastActivityTime,
  stageColor,
  stageIndex,
  totalStages,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  // Sort leads by priority (0-3) then by updatedAt
  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Lower priority number = higher priority
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [leads]);

  const [isExpanded, setIsExpanded] = useState(true);
  const visibleLeads = isExpanded ? sortedLeads : sortedLeads.slice(0, 5);
  const hasMore = sortedLeads.length > 5;

  // Calculate progress percentage for funnel visualization
  const progressPercent = ((stageIndex + 1) / totalStages) * 100;

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 300,
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: spacing.md,
        maxHeight: "calc(100vh - 400px)",
        borderRadius: borderRadius.xl,
        border: isOver
          ? `2px solid ${stageColor.main}`
          : `1px solid ${stageColor.main}30`,
        background: isOver
          ? `${stageColor.bg}`
          : `linear-gradient(180deg, ${stageColor.bg} 0%, rgba(8, 12, 24, 0.4) 100%)`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isOver ? shadows.cardHover : shadows.card,
      }}
    >
      {/* Column Header */}
      <div
        style={{
          padding: spacing.md,
          borderRadius: borderRadius.lg,
          background: `linear-gradient(135deg, ${stageColor.bg} 0%, rgba(8, 12, 24, 0.6) 100%)`,
          border: `1px solid ${stageColor.main}30`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Progress indicator bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${stageColor.main} 0%, ${stageColor.light} 100%)`,
            opacity: 0.6,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, flex: 1 }}>
            {/* Stage indicator dot */}
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: stageColor.main,
                boxShadow: `0 0 8px ${stageColor.main}60`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  ...typography.h4,
                  color: stageColor.main,
                  fontWeight: typography.fontWeight.bold,
                  fontSize: "1rem",
                  marginBottom: 2,
                }}
              >
                {formatStageName(stage)}
              </div>
              <div
                style={{
                  ...typography.caption,
                  color: colors.text.muted,
                  fontSize: "0.75rem",
                }}
              >
                Stage {stageIndex + 1} of {totalStages}
              </div>
            </div>
          </div>
          <div
            style={{
              ...typography.h3,
              color: stageColor.main,
              fontWeight: typography.fontWeight.bold,
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              background: `${stageColor.main}20`,
              border: `1px solid ${stageColor.main}40`,
              minWidth: 48,
              textAlign: "center",
            }}
          >
            {sortedLeads.length}
          </div>
        </div>
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              position: "absolute",
              top: spacing.xs,
              right: spacing.xs,
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: colors.text.muted,
              cursor: "pointer",
              ...typography.caption,
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.sm,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.color = colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.color = colors.text.muted;
            }}
          >
            {isExpanded ? "−" : `+${sortedLeads.length - 5}`}
          </button>
        )}
      </div>

      {/* Column Content */}
      <div
        style={{
          display: "grid",
          gap: spacing.md,
          padding: spacing.sm,
          paddingRight: spacing.xs,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: `${stageColor.main}40 rgba(255,255,255,0.1)`,
        }}
      >
        {visibleLeads.length === 0 ? (
          <div
            style={{
              ...typography.body,
              color: colors.text.muted,
              textAlign: "center",
              padding: spacing.xl,
              borderRadius: borderRadius.lg,
              background: "rgba(255, 255, 255, 0.03)",
              border: `1px dashed ${stageColor.main}30`,
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: spacing.sm, opacity: 0.5 }}>📋</div>
            <div>No leads in this stage</div>
          </div>
        ) : (
          visibleLeads.map((lead) => (
            <DraggableLeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick(lead)}
              isSelected={selectedLeadId === lead.id}
              hasOverdueFollowUp={getOverdueFollowUps(lead.id)}
              isHot={getIsHot(lead)}
              lastActivityTime={getLastActivityTime(lead.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

type LeadFunnelBoardProps = {
  leads: CrmLead[];
  stages: string[];
  onLeadClick: (lead: CrmLead) => void;
  onLeadMove: (leadId: string, newStage: string, nextAction?: { type: string; scheduledAt?: string; notes?: string }) => Promise<void>;
  selectedLeadId?: string;
  getOverdueFollowUps: (leadId: string) => boolean;
  getIsHot: (lead: CrmLead) => boolean;
  getLastActivityTime: (leadId: string) => string | undefined;
  openByStage?: Record<string, number>;
};

export const LeadFunnelBoard: React.FC<LeadFunnelBoardProps> = ({
  leads,
  stages,
  onLeadClick,
  onLeadMove,
  selectedLeadId,
  getOverdueFollowUps,
  getIsHot,
  getLastActivityTime,
  openByStage,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedLead, setDraggedLead] = useState<CrmLead | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [clientWidth, setClientWidth] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingScrollRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerMoveListenerRef = useRef<((e: PointerEvent) => void) | null>(null);

  const updateScrollMetrics = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setScrollLeft(el.scrollLeft);
    setScrollWidth(el.scrollWidth);
    setClientWidth(el.clientWidth);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollMetrics();
    const ro = new ResizeObserver(updateScrollMetrics);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollMetrics, leads.length, stages.length]);

  // Auto-scroll board when dragging near left/right edges so user can reach all columns
  const EDGE_ZONE_PX = 80;
  const SCROLL_SPEED = 20;
  useEffect(() => {
    if (!activeId) return;
    let rafId: number;
    const tick = () => {
      const el = scrollContainerRef.current;
      const ptr = pointerRef.current;
      if (!el) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const rect = el.getBoundingClientRect();
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      if (ptr.x >= rect.left && ptr.x < rect.left + EDGE_ZONE_PX) {
        el.scrollLeft = Math.max(0, el.scrollLeft - SCROLL_SPEED);
        updateScrollMetrics();
      } else if (ptr.x > rect.right - EDGE_ZONE_PX && ptr.x <= rect.right) {
        el.scrollLeft = Math.min(maxScroll, el.scrollLeft + SCROLL_SPEED);
        updateScrollMetrics();
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [activeId, updateScrollMetrics]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  // Group leads by stage
  const leadsByStage = useMemo(() => {
    const grouped: Record<string, CrmLead[]> = {};
    stages.forEach((stage) => {
      grouped[stage] = [];
    });
    leads.forEach((lead) => {
      const stage = lead.stage || "NEW";
      if (!grouped[stage]) grouped[stage] = [];
      grouped[stage].push(lead);
    });
    return grouped;
  }, [leads, stages]);

  // Custom collision: map pointer X + scroll to column index so all 6 stages are droppable
  // (pointerWithin only hits columns whose rect is in view; off-screen columns never get "over")
  const scrollAwareCollision: CollisionDetection = useCallback(
    (args) => {
      const { pointerCoordinates, droppableContainers } = args;
      if (!pointerCoordinates) return [];
      const el = scrollContainerRef.current;
      if (!el || stages.length === 0) return pointerWithin(args);
      const rect = el.getBoundingClientRect();
      const scrollWidth = el.scrollWidth;
      const scrollLeft = el.scrollLeft;
      if (scrollWidth <= 0) return pointerWithin(args);
      const pointerX = pointerCoordinates.x;
      const pointerY = pointerCoordinates.y;
      if (pointerX < rect.left || pointerX > rect.right || pointerY < rect.top || pointerY > rect.bottom) {
        return pointerWithin(args);
      }
      const pointerXInContent = scrollLeft + (pointerX - rect.left);
      const columnIndex = Math.max(
        0,
        Math.min(stages.length - 1, Math.floor((pointerXInContent / scrollWidth) * stages.length))
      );
      const stageId = stages[columnIndex];
      const containers = droppableContainers instanceof Map
        ? Array.from(droppableContainers.values())
        : Array.from(droppableContainers);
      const droppableContainer = containers.find((c: { id: unknown }) => c.id === stageId);
      if (!droppableContainer) return pointerWithin(args);
      return [
        {
          id: stageId,
          data: { droppableContainer, value: 0 },
        },
      ];
    },
    [stages]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find((l) => l.id === active.id);
    setActiveId(active.id as string);
    setDraggedLead(lead || null);
    pointerMoveListenerRef.current = (e: PointerEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", pointerMoveListenerRef.current);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (pointerMoveListenerRef.current) {
      window.removeEventListener("pointermove", pointerMoveListenerRef.current);
      pointerMoveListenerRef.current = null;
    }
    setActiveId(null);
    setDraggedLead(null);

    if (!over || active.id === over.id) return;

    const leadId = active.id as string;
    const currentLead = leads.find((l) => l.id === leadId);
    if (!currentLead) return;

    let newStage: string | undefined;
    if (stages.includes(over.id as string)) {
      newStage = over.id as string;
    } else {
      const leadAt = leads.find((l) => l.id === over.id);
      newStage = leadAt?.stage;
    }
    if (!newStage || currentLead.stage === newStage) return;

    await onLeadMove(leadId, newStage);
  };

  const canScroll = scrollWidth > clientWidth && clientWidth > 0;
  const trackWidth = clientWidth;
  const thumbWidth = clientWidth > 0 && scrollWidth > 0
    ? Math.max(40, (clientWidth / scrollWidth) * trackWidth)
    : 40;
  const maxScroll = scrollWidth - clientWidth;
  const thumbLeft = maxScroll > 0 ? (scrollLeft / maxScroll) * (trackWidth - thumbWidth) : 0;

  const handleScrollBarTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el || !canScroll) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newScrollLeft = (x / trackWidth) * (scrollWidth - clientWidth);
    el.scrollLeft = Math.max(0, newScrollLeft - clientWidth / 2 + thumbWidth / 2);
    updateScrollMetrics();
  };

  const handleScrollBarThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingScrollRef.current = true;
    const startX = e.clientX;
    const startScrollLeft = scrollLeft;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const el = scrollContainerRef.current;
      if (!el || maxScroll <= 0) return;
      const ratio = dx / (trackWidth - thumbWidth);
      el.scrollLeft = Math.max(0, Math.min(maxScroll, startScrollLeft + ratio * maxScroll));
      updateScrollMetrics();
    };
    const onMouseUp = () => {
      isDraggingScrollRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={scrollAwareCollision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "100%", minWidth: 0 }}>
        {/* Horizontal scrollbar above the columns */}
        {canScroll && (
          <div
            role="scrollbar"
            aria-orientation="horizontal"
            aria-valuenow={scrollLeft}
            aria-valuemin={0}
            aria-valuemax={scrollWidth - clientWidth}
            style={{
              flexShrink: 0,
              height: 12,
              marginBottom: spacing.sm,
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: borderRadius.full,
              cursor: "pointer",
              position: "relative",
              minHeight: 12,
            }}
            onClick={handleScrollBarTrackClick}
          >
            <div
              role="slider"
              tabIndex={0}
              style={{
                position: "absolute",
                left: thumbLeft,
                top: 0,
                width: thumbWidth,
                height: 12,
                borderRadius: borderRadius.full,
                background: `${colors.primary.main}80`,
                cursor: "grab",
                minWidth: 40,
              }}
              onMouseDown={handleScrollBarThumbMouseDown}
              onKeyDown={(e) => {
                const el = scrollContainerRef.current;
                if (!el || !canScroll) return;
                const step = 100;
                if (e.key === "ArrowLeft") {
                  el.scrollLeft = Math.max(0, el.scrollLeft - step);
                  updateScrollMetrics();
                } else if (e.key === "ArrowRight") {
                  el.scrollLeft = Math.min(maxScroll, el.scrollLeft + step);
                  updateScrollMetrics();
                }
              }}
            />
          </div>
        )}

        {/* Scrollable columns container - native scrollbar hidden */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollMetrics}
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(300px, 1fr)",
            gap: spacing.lg,
            paddingBottom: spacing.lg,
            paddingTop: 0,
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            flex: 1,
            minHeight: 0,
          }}
          className="lead-funnel-board-scroll"
        >
        {stages.map((stage, index) => {
          const stageColor = getStageColor(stage);
          return (
            <div
              key={stage}
              style={{
                position: "relative",
              }}
            >
              <StageColumn
                stage={stage}
                leads={leadsByStage[stage] || []}
                onLeadClick={onLeadClick}
                selectedLeadId={selectedLeadId}
                getOverdueFollowUps={getOverdueFollowUps}
                getIsHot={getIsHot}
                getLastActivityTime={getLastActivityTime}
                stageColor={stageColor}
                stageIndex={index}
                totalStages={stages.length}
              />
            </div>
          );
        })}
        </div>
      </div>

      <DragOverlay
        modifiers={[snapCenterToCursor]}
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
        style={{ cursor: "grabbing", willChange: "transform" }}
      >
        {draggedLead ? (
          <div
            style={{
              opacity: 0.95,
              transform: "rotate(2deg) scale(1.02)",
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.35))",
              transition: "none",
            }}
          >
            <LeadCard
              lead={draggedLead}
              onClick={() => {}}
              hasOverdueFollowUp={getOverdueFollowUps(draggedLead.id)}
              isHot={getIsHot(draggedLead)}
              lastActivityTime={getLastActivityTime(draggedLead.id)}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
