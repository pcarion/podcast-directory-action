import { Podcast } from './jtd/podcast';

// TODO: check what change are OK and what are not
export default async function checkPodcastModifications(before: Podcast, after: Podcast): Promise<void> {
  if (before.feed.itunes !== '_' && before.feed.itunes !== after.feed.itunes) {
    // user has changed iTunes URL
    throw new Error(`change of itunes URL are not allowed`);
  }
}
