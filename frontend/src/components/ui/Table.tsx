import React from 'react';
import { colors, typography, spacing, borderRadius } from '../../theme/design-tokens';
import { StatusChip } from './StatusChip';

interface TableProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Table: React.FC<TableProps> = ({ children, style }) => {
  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      borderRadius: borderRadius.xl,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.03)',
      ...style,
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
      }}>
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return (
    <thead>
      <tr style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {children}
      </tr>
    </thead>
  );
};

interface TableHeaderCellProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children, style }) => {
  return (
    <th style={{
      padding: spacing.md,
      textAlign: 'left',
      ...typography.caption,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      ...style,
    }}>
      {children}
    </th>
  );
};

interface TableBodyProps {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody>{children}</tbody>;
};

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const TableRow: React.FC<TableRowProps> = ({ children, onClick, style }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: isHovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isHovered ? '0 0 20px rgba(0, 212, 255, 0.1)' : 'none',
        ...style,
      }}
    >
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const TableCell: React.FC<TableCellProps> = ({ children, style }) => {
  return (
    <td style={{
      padding: spacing.md,
      ...typography.body,
      color: colors.text.primary,
      ...style,
    }}>
      {children}
    </td>
  );
};

// Helper to render status in table cells
export const renderStatus = (status: string) => {
  const statusMap: Record<string, 'active' | 'inactive' | 'pending' | 'completed' | 'trial'> = {
    'ACTIVE': 'active',
    'INACTIVE': 'inactive',
    'TRIAL': 'trial',
    'PENDING': 'pending',
    'COMPLETED': 'completed',
  };

  return (
    <StatusChip
      status={statusMap[status] || 'inactive'}
      label={status}
      size="sm"
    />
  );
};



