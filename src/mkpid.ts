import Hashids from 'hashids';
const hashids = new Hashids('podcastfr', 6, 'abcdefghijklmnopqrstuvwxyz1234567890');

// const id = process.argv[2] || '0';
// console.log(`oncoding:${id}: ${encoded}`);

export default function mkpid(n: number): string {
  const encoded = hashids.encode(n);
  return `p${encoded}`;
}
