import Image from 'next/image';
import { cn } from '@/lib/cn';

interface LogoProps {
  variant?: 'full' | 'mark';
  className?: string;
  priority?: boolean;
}

export function Logo({ variant = 'full', className, priority }: LogoProps) {
  if (variant === 'mark') {
    return (
      <Image
        src="/logo-mark.svg"
        alt="PropAfterCare"
        width={112}
        height={112}
        priority={priority}
        className={cn('h-9 w-9', className)}
      />
    );
  }

  return (
    <Image
      src="/logo.svg"
      alt="PropAfterCare"
      width={400}
      height={120}
      priority={priority}
      className={cn('h-10 w-auto', className)}
    />
  );
}
