import Hashids from 'hashids';
const hashids = new Hashids('podcastfr', 6, 'abcdefghijklmnopqrstuvwxyz1234567890');

const id = process.argv[2] || '0';

const encoded = hashids.encode(id);

console.log(`oncoding:${id}: ${encoded}`);
