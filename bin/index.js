#!/usr/bin/env node

import { Command } from 'commander';
import { createProject } from '../src/main.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('simpli')
  .description('CLI to bootstrap simple working web applications')
  .version('1.0.0');

program
  .command('create')
  .description('Create a new project')
  .argument('<project-name>', 'Name of the project')
  .action(async (projectName) => {
    try {
      await createProject(projectName);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse(); 