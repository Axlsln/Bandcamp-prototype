import { useState } from 'react';
import { Disc3 } from 'lucide-react';

interface ProductThumbnailProps {
  src: string;
  alt: string;
  sizeClass?: string;
}

export function ProductThumbnail({
  src,
  alt,
  sizeClass = 'w-14 h-14',
}: ProductThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`${sizeClass} shrink-0 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400`}
        aria-label={alt}
      >
        <Disc3 className="w-6 h-6" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${sizeClass} shrink-0 rounded-xl object-cover border border-slate-200 bg-slate-100`}
    />
  );
}
