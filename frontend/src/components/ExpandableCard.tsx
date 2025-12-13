/**
 * Expandable Card Component
 * Clickable card that expands to show more information
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./ui/Card";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";

interface ExpandableCardProps {
  title: string;
  description: string;
  expandedContent: React.ReactNode;
  icon?: string;
  defaultExpanded?: boolean;
  onExpand?: () => void;
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  description,
  expandedContent,
  icon,
  defaultExpanded = false,
  onExpand,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && onExpand) {
      onExpand();
    }
  };

  return (
    <Card
      variant="elevated"
      padding="md"
      style={{
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onClick={handleToggle}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: spacing.md,
        }}
      >
        {icon && (
          <div
            style={{
              fontSize: typography.fontSize["2xl"],
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.xs,
            }}
          >
            <h3
              style={{
                ...typography.h5,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              {title}
            </h3>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              style={{
                fontSize: typography.fontSize.lg,
                color: colors.accent.main,
              }}
            >
              ▼
            </motion.div>
          </div>
          <p
            style={{
              ...typography.body,
              color: colors.text.secondary,
              fontSize: typography.fontSize.sm,
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              overflow: "hidden",
              marginTop: spacing.md,
              paddingTop: spacing.md,
              borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
            }}
          >
            {expandedContent}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ExpandableCard;



