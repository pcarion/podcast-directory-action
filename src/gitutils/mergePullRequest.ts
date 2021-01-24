import { Octokit } from '../types';

export default async function mergePullRequest(
  octo: Octokit,
  owner: string,
  repo: string,
  pullRequestNumber: number,
  sha: string,
): Promise<void> {
  // update pull request if extra files were added to the branch
  console.log(`@@@ mergePullRequest>pr>${pullRequestNumber}>sha>${sha}`);
  let res = await octo.pulls.get({
    owner,
    repo,
    pull_number: pullRequestNumber,
  });
  console.log('@@@ octo.pulls.get>0>', res.data);
  // await octo.pulls.updateBranch({
  //   owner,
  //   repo,
  //   pull_number: pullRequestNumber,
  //   expected_head_sha: sha,
  // });
  console.log('>octo.pulls.update>');
  res = await octo.pulls.update({
    owner,
    repo,
    pull_number: pullRequestNumber,
  });
  console.log('>octo.pulls.update>res>', res.data);
  res = await octo.pulls.get({
    owner,
    repo,
    pull_number: pullRequestNumber,
  });
  console.log('>octo.pulls.get>1>', res.data);

  // merging PR
  console.log('>octo.pulls.merge>');
  await octo.pulls.merge({
    owner,
    repo,
    pull_number: pullRequestNumber,
    commit_title: `merge PR`,
    commit_message: `merge from PR #${pullRequestNumber}`,
    merge_method: 'squash',
    sha: sha,
  });
}
