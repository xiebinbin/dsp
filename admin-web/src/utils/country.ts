import countries from 'i18n-iso-countries';
import zh from 'i18n-iso-countries/langs/zh.json';
import _ from 'lodash';
countries.registerLocale(zh);
export const getCountryList = () => {
    const countryList = countries.getNames('zh');
    const items=  _.map(countryList, (value, key) => {
        return {
            label: value,
            value: key,
        };
    }).sort((a, b) => {
        return a.label.localeCompare(b.label);
    });
    items.unshift({
        label: '全部',
        value: 'ALL',
    });
    return items;
}
