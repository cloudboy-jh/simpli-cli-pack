#!/usr/bin/env node

import { createProject } from '../src/main.js';
import inquirer from 'inquirer';

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

async function run() {
  try {
    const args = process.argv.slice(2);
    let projectName;

    if (args[0] === 'create') {
      projectName = await getProjectName(args[1]);
    } else {
      projectName = await getProjectName();
    }

    await createProject(projectName);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

run(); 