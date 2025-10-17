import React from 'react';

export const CRFlag: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} width="28" height="20" viewBox="0 0 28 20" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="20" fill="#2b54a6" />
    <rect y="3" width="28" height="3" fill="#fff" />
    <rect y="6" width="28" height="8" fill="#d7141a" />
    <rect y="14" width="28" height="3" fill="#fff" />
    <rect y="17" width="28" height="3" fill="#2b54a6" />
  </svg>
);
export default CRFlag;