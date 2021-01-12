/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Octokit } from '@octokit/core';

interface FileInformation {
  filename: string;
  url: string;
}

export default async function extractFilesFromPR(octokit: Octokit, commits_url: string): Promise<FileInformation[]> {
  const files: FileInformation[] = [];
  const result = await octokit.request(commits_url);
  if (result.data.length !== 1) {
    throw new Error(`only one file per PR is authorized`);
  }
  for (const commit of result.data || []) {
    const commit_url = commit.url;
    if (!commit_url) {
      throw new Error(`missing commit_url`);
    }
    const result = await octokit.request(commit_url);
    // console.log('@@@ commit:  files', JSON.stringify(result.data.files, null, 2));
    (result.data.files || []).forEach((f: any) => {
      if (!files.includes(f.filename)) {
        files.push({
          filename: f.filename,
          url: f.raw_url,
        });
      }
    });
  }

  return files;
}
