import type { CSSProperties } from 'react';
import Image from 'next/image';
import { AvatarPreset } from '@/lib/avatarPresets';

interface AvatarImageProps {
  preset: AvatarPreset;
  size?: 'small' | 'medium' | 'large';
}

type SizeConfig = {
  dimension: number;
  fontFallback: string;
  sizesAttr: string;
};

const SIZE_MAP: Record<Required<AvatarImageProps>['size'], SizeConfig> = {
  small: { dimension: 44, fontFallback: 'text-xl', sizesAttr: '44px' },
  medium: { dimension: 56, fontFallback: 'text-3xl', sizesAttr: '56px' },
  large: { dimension: 120, fontFallback: 'text-6xl', sizesAttr: '120px' },
};

// An add: Centralized avatar component with consistent sizing on 10/22
// An fix: Reworked sizing to avoid uneven borders on 10/23
export default function AvatarImage({ preset, size = 'medium' }: AvatarImageProps) {
  const config = SIZE_MAP[size];
  const baseStyle: CSSProperties = {
    width: config.dimension,
    height: config.dimension,
  };

  const containerClasses = [
    'relative',
    'flex',
    'items-center',
    'justify-center',
    'overflow-hidden',
    'rounded-full',
    preset.bgClass,
  ]
    .filter(Boolean)
    .join(' ');

  if (preset.variant === 'emoji') {
    const fontClass = preset.textClass ?? config.fontFallback;
    return (
      <div className={containerClasses} style={baseStyle}>
        <span className={`${fontClass} leading-none`}>{preset.value}</span>
      </div>
    );
  }

  return (
    <div className={containerClasses} style={baseStyle}>
      <Image
        src={preset.value}
        alt={preset.label}
        fill
        className="h-full w-full rounded-full object-cover"
        sizes={config.sizesAttr}
        priority={size === 'large'}
        style={
          preset.imageScale || preset.imageOffsetY
            ? {
                transform: `translateY(${(preset.imageOffsetY ?? 0) * 100}%) scale(${preset.imageScale ?? 1})`,
              }
            : undefined
        }
      />
    </div>
  );
}
