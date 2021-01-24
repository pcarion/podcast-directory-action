import { Octokit, RepoInformation } from '../types';

interface BlobInformation {
  path: string;
  sha: string;
}

type GitFileMode = '100644' | '100755' | '040000' | '160000' | '120000' | undefined;
type GitBlobType = 'tree' | 'blob' | 'commit' | undefined;

async function getCurrentCommit(octo: Octokit, owner: string, repo: string, branch: string) {
  const { data: refData } = await octo.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const commitSha = refData.object.sha;
  const { data: commitData } = await octo.git.getCommit({
    owner,
    repo,
    commit_sha: commitSha,
  });
  return {
    commitSha,
    treeSha: commitData.tree.sha,
  };
}

async function createBlobForFile(octo: Octokit, owner: string, repo: string, content: string) {
  const blobData = await octo.git.createBlob({
    owner,
    repo,
    content,
    encoding: 'utf-8',
  });
  return blobData.data;
}

async function createNewTree(
  octo: Octokit,
  owner: string,
  repo: string,
  blobs: BlobInformation[],
  parentTreeSha: string,
) {
  const type: GitBlobType = 'blob';
  const mode: GitFileMode = '100644';

  const tree = blobs.map((blob) => ({
    path: blob.path,
    mode,
    type,
    sha: blob.sha,
  }));
  const { data } = await octo.git.createTree({
    owner,
    repo,
    tree,
    base_tree: parentTreeSha,
  });
  return data;
}

async function createNewCommit(
  octo: Octokit,
  owner: string,
  repo: string,
  message: string,
  currentTreeSha: string,
  currentCommitSha: string,
) {
  const result = await octo.git.createCommit({
    owner,
    repo,
    message,
    tree: currentTreeSha,
    parents: [currentCommitSha],
  });
  return result.data;
}

async function setBranchToCommit(octo: Octokit, owner: string, repo: string, branch = `master`, commitSha: string) {
  await octo.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: commitSha,
  });
}

export interface AddFilesToRepositoryResult {
  addFileWithlines: (fileName: string, lines: string[]) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addJsonFile: (fileName: string, json: any) => Promise<void>;
  commit: (commitMessage: string, branchName?: string) => Promise<string>;
}

export default async function addFilesToRepository(
  octo: Octokit,
  repoInformation: RepoInformation,
): Promise<AddFilesToRepositoryResult> {
  try {
    const { owner, repo, defaultBranch } = repoInformation;
    const blobs: BlobInformation[] = [];

    return {
      addFileWithlines: async function (fileName: string, lines: string[]): Promise<void> {
        const content = lines.join('\n');
        const blobData = await createBlobForFile(octo, owner, repo, content);
        blobs.push({
          path: fileName,
          sha: blobData.sha,
        });
      },
      addJsonFile: async function (fileName: string, json: any): Promise<void> {
        const content = JSON.stringify(json, null, 2);
        const blobData = await createBlobForFile(octo, owner, repo, content);
        blobs.push({
          path: fileName,
          sha: blobData.sha,
        });
      },
      commit: async function (commitMessage: string, branchName?: string): Promise<string> {
        const commitBranchName = branchName || defaultBranch;
        const currentCommit = await getCurrentCommit(octo, owner, repo, commitBranchName);
        console.log(`>getCurrentCommit>branch>${branchName}>commit>`, currentCommit);

        const newTree = await createNewTree(octo, owner, repo, blobs, currentCommit.treeSha);
        const newCommit = await createNewCommit(octo, owner, repo, commitMessage, newTree.sha, currentCommit.commitSha);

        await setBranchToCommit(octo, owner, repo, commitBranchName, newCommit.sha);
        return newCommit.sha;
      },
    };
  } catch (err) {
    console.log(err);
    throw new Error(`error adding file to repository`);
  }
}
