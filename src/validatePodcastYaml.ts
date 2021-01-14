import yaml from 'js-yaml';
import { validate as validateAgainsJtdSchema } from 'jtd';
import schema from './jtd/podcast/schema';
import { Podcast } from './jtd/podcast';

function loadYamlFile(content: string): unknown {
  const doc = yaml.load(content);
  if (!doc) {
    throw new Error(`error loading yaml content: ${content}`);
  }
  return doc;
}

function validateJdtSchema(content: unknown): Podcast {
  const validationErrors = validateAgainsJtdSchema(schema, content);

  if (validationErrors.length !== 0) {
    console.log(validationErrors);
    throw new Error(
      `cotent is not valid - ${content} - (schema validation): ${JSON.stringify(validationErrors, null, '  ')}`,
    );
  }
  return content as Podcast;
}

export default function validatePodcastYaml(content: string): Podcast {
  const doc = loadYamlFile(content);
  const descriptions = validateJdtSchema(doc);
  return descriptions;
}
