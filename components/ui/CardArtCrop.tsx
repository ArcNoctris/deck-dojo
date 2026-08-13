import React from 'react';

// Standard YGO card image proportions (width/height).
const CARD_ASPECT = 0.686;
// Trim the name bar / border (~10% each side) and the text box (~bottom third)
// so only the artwork itself remains.
const CROP = { left: 0.10, right: 0.10, top: 0.10, bottom: 0.33 };

const cropW = 1 - CROP.left - CROP.right;
const cropH = 1 - CROP.top - CROP.bottom;
const cropAspect = (CARD_ASPECT * cropW) / cropH;

interface CardArtCropProps {
  src: string;
  className?: string;
}

/** Renders a card image cropped down to just its artwork, cover-fit into the parent box. */
export const CardArtCrop = ({ src, className = '' }: CardArtCropProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{ aspectRatio: `${cropAspect}`, minWidth: '100%', minHeight: '100%' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          style={{
            position: 'absolute',
            width: `${(100 / cropW).toFixed(4)}%`,
            height: `${(100 / cropH).toFixed(4)}%`,
            left: `${(-(CROP.left / cropW) * 100).toFixed(4)}%`,
            top: `${(-(CROP.top / cropH) * 100).toFixed(4)}%`,
            maxWidth: 'none',
          }}
        />
      </div>
    </div>
  );
};
