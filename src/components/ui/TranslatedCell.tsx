import React from 'react';
import { useTranslation } from 'react-i18next';
import { translateBackendValue } from '../../utils/translateBackend';

interface Props {
  field?: string; // nombre del campo para mapear (sexo, estado, categoria...)
  value: any;
  className?: string;
}

export const TranslatedCell: React.FC<Props> = ({ field, value, className }) => {
  const { t } = useTranslation();
  const text = field ? translateBackendValue(field, value, t) : (typeof value === 'string' ? t(value) : String(value));
  return <span className={className}>{text}</span>;
};

export default TranslatedCell;