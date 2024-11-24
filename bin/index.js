#!/usr/bin/env node

import { createProject } from '../src/main.js';
import { Command } from 'commander';
import inquirer from 'inquirer';

const program = new Command();

program
  .name('simpliv1')
  .description('A CLI tool to scaffold modern web applications')
  .version('1.2.1');

program
  .command('create')
  .argument('[name]', 'project name')
  .description('Create a new project')
  .action(async (name) => {
    try {
      const projectName = name || await askProjectName();
      await createProject(projectName);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

async function askProjectName() {
  const response = await inquirer.prompt([{
    type: 'input',
    name: 'projectName',
    message: 'What is your project name?',
    validate: (input) => {
      if (!input.trim()) return 'Project name is required';
      return true;
    }
  }]);
  return response.projectName;
}

program.parse(); 