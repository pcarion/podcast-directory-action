import { Podcast } from '../jtd/podcast';

// TODO: check what change are OK and what are not
export default async function checkPodcastModifications(before: Podcast, after: Podcast): Promise<void> {
  if (before.pid !== after.pid) {
    // podcast id cannot be changed
    throw new Error(`you cannot change the value of the pid property`);
  }
}
