#!/usr/bin/env node

import { createProject } from '../src/main.js';
import inquirer from 'inquirer';
import { Command } from 'commander';

const program = new Command();

async function getProjectName(providedName) {
  if (providedName) return providedName;

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

program
  .name('simpli-create')
  .description('A CLI tool to scaffold modern web applications')
  .version('1.0.0')
  .argument('[name]', 'project name')
  .action(async (name) => {
    try {
      const projectName = await getProjectName(name);
      await createProject(projectName);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

program.parse(); 