import Sqids from 'sqids/cjs/sqids';

const sqids = new Sqids({
  alphabet: 'FxnXM1kBN6sAcuhvjW3Co7l2RePyY8DwaU04Tzt9fHQrqSVKdpimLGIJOgb5ZE',
  minLength: 6,
});
const en = (num: number) => {
  return sqids.encode([num]);
};
const de = (hashId: string): number => {
  return sqids.decode(hashId)[0];
};
export default {
  en,
  de,
};
