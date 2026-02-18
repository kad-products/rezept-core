import countries, { getAlpha2Codes } from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(en);

export const validCountryCodes = Object.keys(getAlpha2Codes());
export const countryOptions = Object.entries(countries.getNames('en')).map(([code, name]) => ({
	code, // "US", "NO", "NG"
	name, // "United States", "Norway", "Nigeria"
}));
