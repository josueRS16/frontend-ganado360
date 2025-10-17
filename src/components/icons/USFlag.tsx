import React from 'react';

export const USFlag: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} width="28" height="20" viewBox="0 0 28 20" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="20" fill="#fff" />
    <g fill="#b22234">
      <rect y="0" width="28" height="1.538" />
      <rect y="3.076" width="28" height="1.538" />
      <rect y="6.153" width="28" height="1.538" />
      <rect y="9.231" width="28" height="1.538" />
      <rect y="12.308" width="28" height="1.538" />
      <rect y="15.385" width="28" height="1.538" />
      <rect y="18.462" width="28" height="1.538" />
    </g>
    <rect width="11" height="8" fill="#3c3b6e" />
    <g fill="#fff" transform="translate(1.5,1.2)">
      <circle cx="1" cy="1" r="0.6" />
      <circle cx="3.2" cy="1" r="0.6" />
      <circle cx="5.4" cy="1" r="0.6" />
      <circle cx="1" cy="2.6" r="0.6" />
      <circle cx="3.2" cy="2.6" r="0.6" />
      <circle cx="5.4" cy="2.6" r="0.6" />
      <circle cx="1" cy="4.2" r="0.6" />
      <circle cx="3.2" cy="4.2" r="0.6" />
      <circle cx="5.4" cy="4.2" r="0.6" />
    </g>
  </svg>
);
export default USFlag;