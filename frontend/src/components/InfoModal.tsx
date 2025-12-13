/**
 * Info Modal Component
 * Modal for displaying detailed information
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  image?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  image,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
              zIndex: 1000,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
              zIndex: 1001,
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card variant="glass" padding="xl" style={{ position: "relative" }}>
              <button
                onClick={onClose}
                style={{
                  position: "absolute",
                  top: spacing.md,
                  right: spacing.md,
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: colors.text.primary,
                  fontSize: typography.fontSize.lg,
                  zIndex: 1,
                }}
              >
                ×
              </button>

              {image && (
                <img
                  src={image}
                  alt={title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: borderRadius.lg,
                    marginBottom: spacing.lg,
                  }}
                />
              )}

              <h2
                style={{
                  ...typography.h2,
                  color: colors.text.primary,
                  marginBottom: spacing.lg,
                }}
              >
                {title}
              </h2>

              <div style={{ color: colors.text.secondary }}>{children}</div>

              <div style={{ marginTop: spacing.xl, textAlign: "center" }}>
                <Button variant="primary" onClick={onClose}>
                  Close
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;

