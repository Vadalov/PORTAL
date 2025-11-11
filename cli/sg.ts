#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';

interface Argv {
  target: string;
  type: 'docs' | 'api' | 'structure' | 'readme';
  format: 'md' | 'json' | 'yaml';
  [key: string]: unknown;
}

function generateStructureMarkdown(dir: string, prefix = ''): string {
  const files = fs.readdirSync(dir);
  let markdown = '';

  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const isLast = index === files.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    markdown += `${prefix}${connector}${file}\n`;

    if (fs.statSync(filePath).isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      markdown += generateStructureMarkdown(filePath, newPrefix);
    }
  });

  return markdown;
}

yargs(hideBin(process.argv))
  .command(
    'index [target]',
    'Generate project documentation',
    (yargs) => {
      return yargs
        .positional('target', {
          describe: 'The target directory to index',
          default: '.',
        })
        .option('type', {
          alias: 't',
          describe: 'The type of documentation to generate',
          choices: ['docs', 'api', 'structure', 'readme'],
          default: 'docs',
        })
        .option('format', {
          alias: 'f',
          describe: 'The format of the documentation',
          choices: ['md', 'json', 'yaml'],
          default: 'md',
        });
    },
    (argv: unknown) => {
      const args = argv as Argv;
      console.warn('Generating documentation with the following options:');
      console.warn(args);

      if (args.type === 'structure') {
        if (args.format === 'md') {
          const markdown = generateStructureMarkdown(args.target);
          fs.writeFileSync('geminidocs/structure.md', markdown);
          console.warn('Successfully generated structure.md in geminidocs/');
        } else {
          console.error('JSON and YAML formats are not yet supported for structure documentation.');
        }
      } else {
        console.error('Only structure documentation is currently supported.');
      }
    }
  )
  .demandCommand(1)
  .parse();
