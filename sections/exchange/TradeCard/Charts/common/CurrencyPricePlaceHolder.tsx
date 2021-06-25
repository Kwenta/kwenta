import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CurrencyLabel } from './styles';

const CurrencyPricePlaceHolder: FC = () => {
	const { t } = useTranslation();
	return <CurrencyLabel>{t('common.price')}</CurrencyLabel>;
};

export default CurrencyPricePlaceHolder;
