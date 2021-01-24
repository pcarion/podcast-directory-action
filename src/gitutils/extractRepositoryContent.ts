import { Octokit, RepoInformation, FileInformation } from '../types';
import axios from 'axios';

async function downloadFile(file: FileInformation): Promise<void> {
  const response = await axios({
    url: file.download_url,
    method: 'GET',
    responseType: 'text',
  });
  file.content = response.data;
}

export async function dowloadFiles(listOfFiles: FileInformation[]): Promise<void> {
  try {
    for (const file of listOfFiles) {
      await downloadFile(file);
    }
  } catch (err) {
    console.log(err);
    throw new Error('error downloading list of files from podcast repository');
  }
}

async function extractFilesFromRepositoryContent(
  octo: Octokit,
  listOfFiles: FileInformation[],
  info: RepoInformation,
  path: string,
  rootPath: string,
): Promise<void> {
  const content = await octo.repos.getContent({
    owner: info.owner,
    repo: info.repo,
    path: path,
    ref: info.defaultBranch,
  });
  if (!content.data || !Array.isArray(content.data)) {
    throw new Error(`no data available at ${info.owner}'${info.repo}/${path}/${info.defaultBranch}`);
  }
  const templateFiles = content.data;
  for (const file of templateFiles) {
    if (file.type === 'file') {
      listOfFiles.push({
        name: file.name,
        path: file.path,
        destPath: file.path.slice(rootPath.length > 0 ? rootPath.length + 1 : 0),
        download_url: file.download_url || '_',
      });
    } else if (file.type === 'dir') {
      await extractFilesFromRepositoryContent(octo, listOfFiles, info, file.path, rootPath);
    } else {
      console.log('unknown file type', { file });
    }
  }
}

export default async function extractRepositoryContent(
  octo: Octokit,
  info: RepoInformation,
  rootDirectory: string,
): Promise<FileInformation[]> {
  try {
    const listOfFiles: FileInformation[] = [];

    await extractFilesFromRepositoryContent(octo, listOfFiles, info, rootDirectory, '');

    console.log(`Files from ${rootDirectory}: ${JSON.stringify(listOfFiles, null, 2)}`);
    return listOfFiles;
  } catch (err) {
    console.log(err);
    throw new Error('error retrieving existing podcasts list');
  }
}
