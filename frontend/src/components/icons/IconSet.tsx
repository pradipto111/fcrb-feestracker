/**
 * Unified Icon Set Component
 * 
 * Centralized icon components using react-icons for consistent styling
 * Replaces all emojis with professional SVG icons
 */

import React from 'react';
import {
  // Social Media
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaYoutube,
  // Contact
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  // General
  FaChartBar,
  FaChartLine,
  FaClipboardList,
  FaFutbol,
  FaDumbbell,
  FaTrophy,
  FaSync,
  FaBolt,
  FaLeaf,
  FaCalendar,
  FaTimes,
  FaCheck,
  FaLink,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaMinus,
  // Analytics & Data
  FaUser,
  FaUsers,
  FaFileAlt,
  FaCog,
  FaHome,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  // Additional icons for emoji replacement
  FaCamera,
  FaFire,
  FaVoteYea,
  FaSearch,
  FaEdit,
  FaTrash,
  FaDownload,
  FaUpload,
  FaPrint,
  FaShare,
  FaBell,
  FaStar,
  FaHeart,
  FaThumbsUp,
  FaComment,
  FaImage,
  FaVideo,
  FaMusic,
  FaGamepad,
  FaRunning,
  FaMedal,
  FaGraduationCap,
  FaBook,
  FaSchool,
  FaBuilding,
  FaMoneyBillWave,
  FaCreditCard,
  FaShoppingCart,
  FaStore,
  FaTag,
  FaTags,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilm,
  FaShoppingBag,
  FaLock,
  FaExternalLinkAlt,
  // Football-themed icons
  FaShieldAlt,
  FaFlag,
  FaHandPaper,
} from 'react-icons/fa';
import {
  // Additional icons
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
} from 'react-icons/hi';

interface IconProps {
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Social Media Icons
export const FacebookIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaFacebook {...iconProps} />
    </span>
  );
};

export const InstagramIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaInstagram {...iconProps} />
    </span>
  );
};

export const TikTokIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaTiktok {...iconProps} />
    </span>
  );
};

export const TwitterIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaTwitter {...iconProps} />
    </span>
  );
};

export const YouTubeIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaYoutube {...iconProps} />
    </span>
  );
};

// Contact Icons
export const PhoneIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaPhone {...iconProps} />
    </span>
  );
};

export const EmailIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaEnvelope {...iconProps} />
    </span>
  );
};

export const LocationIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaMapMarkerAlt {...iconProps} />
    </span>
  );
};

// General Icons
export const ChartBarIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaChartBar size={size} color={color} />
  </span>
);

export const ChartLineIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaChartLine size={size} color={color} />
  </span>
);

export const ClipboardIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaClipboardList size={size} color={color} />
  </span>
);

export const FootballIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaFutbol size={size} color={color} />
  </span>
);

export const DumbbellIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaDumbbell size={size} color={color} />
  </span>
);

export const TrophyIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaTrophy size={size} color={color} />
  </span>
);

export const RefreshIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaSync size={size} color={color} />
  </span>
);

export const BoltIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaBolt size={size} color={color} />
  </span>
);

export const LeafIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaLeaf size={size} color={color} />
  </span>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaCalendar size={size} color={color} />
  </span>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaTimes size={size} color={color} />
  </span>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaCheck size={size} color={color} />
  </span>
);

export const LinkIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaLink size={size} color={color} />
  </span>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaArrowLeft size={size} color={color} />
  </span>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaArrowRight {...iconProps} />
    </span>
  );
};

export const ArrowUpIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaArrowUp size={size} color={color} />
  </span>
);

export const ArrowDownIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaArrowDown size={size} color={color} />
  </span>
);

export const PlusIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaPlus size={size} color={color} />
  </span>
);

export const MinusIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaMinus size={size} color={color} />
  </span>
);

export const LockIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaLock size={size} color={color} />
  </span>
);

// Additional Icons
export const UserIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaUser size={size} color={color} />
  </span>
);

export const UsersIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaUsers size={size} color={color} />
  </span>
);

export const FileIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaFileAlt size={size} color={color} />
  </span>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaCog size={size} color={color} />
  </span>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaHome size={size} color={color} />
  </span>
);

export const InfoIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaInfoCircle size={size} color={color} />
  </span>
);

export const WarningIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaExclamationTriangle size={size} color={color} />
  </span>
);

export const SuccessIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaCheckCircle size={size} color={color} />
  </span>
);

export const ErrorIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <FaTimesCircle size={size} color={color} />
  </span>
);

// Arrow variants
export const ArrowRightOutlineIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <HiOutlineArrowRight size={size} color={color} />
  </span>
);

export const ArrowLeftOutlineIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => (
  <span style={style} className={className}>
    <HiOutlineArrowLeft size={size} color={color} />
  </span>
);

// Additional Icons for Emoji Replacement
export const CameraIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaCamera {...iconProps} />
    </span>
  );
};

export const FireIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaFire {...iconProps} />
    </span>
  );
};

export const VoteIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaVoteYea {...iconProps} />
    </span>
  );
};

export const SearchIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaSearch {...iconProps} />
    </span>
  );
};

export const EditIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaEdit {...iconProps} />
    </span>
  );
};

export const TrashIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaTrash {...iconProps} />
    </span>
  );
};

export const DownloadIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaDownload {...iconProps} />
    </span>
  );
};

export const UploadIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaUpload {...iconProps} />
    </span>
  );
};

export const PrintIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaPrint {...iconProps} />
    </span>
  );
};

export const ShareIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaShare {...iconProps} />
    </span>
  );
};

export const BellIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaBell {...iconProps} />
    </span>
  );
};

export const StarIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaStar {...iconProps} />
    </span>
  );
};

export const HeartIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaHeart {...iconProps} />
    </span>
  );
};

export const ThumbsUpIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaThumbsUp {...iconProps} />
    </span>
  );
};

export const CommentIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaComment {...iconProps} />
    </span>
  );
};

export const ImageIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaImage {...iconProps} />
    </span>
  );
};

export const VideoIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaVideo {...iconProps} />
    </span>
  );
};

export const RunningIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaRunning {...iconProps} />
    </span>
  );
};

export const MedalIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaMedal {...iconProps} />
    </span>
  );
};

export const GraduationCapIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaGraduationCap {...iconProps} />
    </span>
  );
};

export const BookIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaBook {...iconProps} />
    </span>
  );
};

export const SchoolIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaSchool {...iconProps} />
    </span>
  );
};

export const BuildingIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaBuilding {...iconProps} />
    </span>
  );
};

export const MoneyIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaMoneyBillWave {...iconProps} />
    </span>
  );
};

export const CreditCardIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaCreditCard {...iconProps} />
    </span>
  );
};

export const ShoppingCartIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaShoppingCart {...iconProps} />
    </span>
  );
};

export const StoreIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaStore {...iconProps} />
    </span>
  );
};

export const TagIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaTag {...iconProps} />
    </span>
  );
};

export const FilterIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaFilter {...iconProps} />
    </span>
  );
};

export const SortIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaSort {...iconProps} />
    </span>
  );
};

export const SortUpIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaSortUp {...iconProps} />
    </span>
  );
};

export const SortDownIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaSortDown {...iconProps} />
    </span>
  );
};

// Additional icons for navigation and actions
export const VideoCameraIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaVideo {...iconProps} />
    </span>
  );
};

export const FilmIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaFilm {...iconProps} />
    </span>
  );
};

export const GearIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaCog {...iconProps} />
    </span>
  );
};

export const ShoppingBagIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaShoppingBag {...iconProps} />
    </span>
  );
};

// ============================================
// FOOTBALL-THEMED ICONS - Football-First Design
// ============================================

/**
 * Stadium Icon - For matchday, venues, locations
 * Rounded, friendly, football-themed
 */
export const StadiumIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaBuilding {...iconProps} />
    </span>
  );
};

/**
 * Whistle Icon - For matchday, referees, games
 * Using hand icon as whistle representation
 */
export const WhistleIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaHandPaper {...iconProps} />
    </span>
  );
};

/**
 * Boot Icon - For training, equipment, gear
 * Using running icon as boot representation
 */
export const BootIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaRunning {...iconProps} />
    </span>
  );
};

/**
 * Shirt Icon - For jerseys, merchandise, kit
 * Using shield icon as shirt/jersey representation
 */
export const ShirtIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaShieldAlt {...iconProps} />
    </span>
  );
};

/**
 * Badge Icon - For achievements, tiers, recognition
 * Using medal icon as badge representation
 */
export const BadgeIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaMedal {...iconProps} />
    </span>
  );
};

/**
 * Lightning Icon - For speed, energy, power
 * Already exists as BoltIcon, but adding alias for consistency
 */
export const LightningIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaBolt {...iconProps} />
    </span>
  );
};

/**
 * Shield Icon - For protection, security, values
 */
export const ShieldIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaShieldAlt {...iconProps} />
    </span>
  );
};

/**
 * Flag Icon - For matchday, events, milestones
 */
export const FlagIcon: React.FC<IconProps> = ({ size = 16, color, style, className }) => {
  const iconSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
  const iconProps: { size: number; color?: string } = { size: iconSize };
  if (color) iconProps.color = color;
  
  return (
    <span style={style} className={className}>
      <FaFlag {...iconProps} />
    </span>
  );
};

