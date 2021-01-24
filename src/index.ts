import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { getRepositoryInformation } from './gitutils/getRepositoryInformation';
import handleIssuesEvent from './handleIssuesEvent';
import handlePullRequestEvent from './handlePullRequestEvent';

interface RepositoryOwner {
  owner: string;
  repo: string;
}

function getRepositoryOwner(): RepositoryOwner {
  const githubRepository = process.env['GITHUB_REPOSITORY'];
  if (!githubRepository) {
    throw new Error(`env not set:GITHUB_REPOSITORY`);
  }
  const parts = githubRepository.split('/');
  if (!parts || parts.length !== 2) {
    throw new Error(`invalid env :GITHUB_REPOSITORY=${githubRepository}`);
  }
  return {
    owner: parts[0].trim(),
    repo: parts[1].trim(),
  };
}

async function run() {
  try {
    console.log('Starting github action...');
    const token = core.getInput('repo-token', { required: true });
    const podcastYamlDirectory = core.getInput('podcast-yaml-directory');
    const podcastJsonDirectory = core.getInput('podcast-json-directory');

    const octokit = getOctokit(token);

    const repo = getRepositoryOwner();

    const info = await getRepositoryInformation(octokit, repo.owner, repo.repo);

    // const payload = JSON.stringify(context, undefined, 2);
    // console.log(`>> The context is: ${payload}`);
    // console.log('====');
    switch (context.eventName) {
      case 'issues': {
        if (!context.payload.issue) {
          core.setFailed('no issue payload');
          break;
        }

        const issueNumber = context.payload.issue.number;
        if (!issueNumber) {
          core.setFailed('no issueNumber for the issue');
          break;
        }
        const title = context.payload.issue.title as string;
        if (!title) {
          core.setFailed('no title for the issue');
          break;
        }

        const result = await handleIssuesEvent(
          octokit,
          info,
          podcastYamlDirectory,
          podcastJsonDirectory,
          issueNumber,
          title,
        );
        if (!result.isSuccess) {
          core.setFailed(result.errorMessage || 'internal error');
          break;
        }
        if (!result.podcast) {
          core.setFailed('internal error -- missing podcast information');
          break;
        }
        core.setOutput('title', result.podcast.title);
        core.setOutput('filename', result.fileName);
        break;
      }
      case 'pull_request': {
        console.log('> pull_request');
        const pullRequestBranch = process.env['GITHUB_HEAD_REF'];
        if (!pullRequestBranch) {
          core.setFailed('no GITHUB_HEAD_REF variable');
          break;
        }
        console.log(`>pullRequestBranch>${pullRequestBranch}`);
        if (!context.payload.pull_request) {
          core.setFailed('no pull_request payload');
          break;
        }
        const prNumber = context.payload.number;
        if (!prNumber) {
          core.setFailed('no number for the issue');
          break;
        }
        console.log('>PR number>', prNumber);
        const commitsUrl = context.payload.pull_request?.commits_url;
        if (!commitsUrl) {
          core.setFailed('no commitsUrl');
          break;
        }
        const result = await handlePullRequestEvent(
          octokit,
          info,
          podcastYamlDirectory,
          podcastJsonDirectory,
          prNumber,
          commitsUrl as string,
          pullRequestBranch,
        );
        if (!result.isSuccess) {
          console.log('Result:');
          console.log(result);
          core.setFailed(result.errorMessage || 'internal error');
          break;
        }
        if (!result.podcast) {
          console.log('Result:');
          console.log(result);
          core.setFailed('internal error -- missing podcast information');
          break;
        }
        core.setOutput('title', result.podcast.title);
        core.setOutput('filename', result.fileName);
        break;
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
