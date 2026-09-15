import { translateText } from './i18n/LanguageContext';

test('translates a static Ukrainian interface label to English', () => {
  expect(translateText('Головна', 'en')).toBe('Home');
});

test('translates dynamic survey metadata to English', () => {
  expect(translateText('Учасників: 12', 'en')).toBe('Participants: 12');
});
