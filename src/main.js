import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import { execa } from 'execa';
import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHOICES = {
  NEXT: 'Next.js',
  TS: 'TypeScript',
  TAILWIND: 'Tailwind CSS',
  SUPABASE: 'Supabase',
  OPENAI: 'OpenAI'
};

export async function createProject(projectName) {
  console.log(chalk.blue(`Creating new project: ${projectName}\n`));

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features to include:',
      choices: Object.values(CHOICES),
      default: [CHOICES.NEXT, CHOICES.TS, CHOICES.TAILWIND]
    }
  ]);

  const spinner = ora('Creating project directory...').start();

  try {
    // Create project directory
    const projectPath = path.join(process.cwd(), projectName);
    await fs.ensureDir(projectPath);

    // Copy template files
    const templatePath = path.join(__dirname, '../templates/default');
    await fs.copy(templatePath, projectPath);

    spinner.succeed('Project directory created');
    spinner.start('Installing dependencies...');

    // Install dependencies
    const dependencies = getDependencies(answers.features);
    
    await execa('npm', ['init', '-y'], { 
      cwd: projectPath,
      stdio: 'inherit'
    });

    await execa('npm', ['install', '--save', ...dependencies], { 
      cwd: projectPath,
      stdio: 'inherit'
    });

    spinner.succeed('Dependencies installed');

    console.log(chalk.green('\nProject created successfully! 🎉'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.white(`  cd ${projectName}`));
    console.log(chalk.white('  npm run dev'));
  } catch (error) {
    spinner.fail('Failed to create project');
    throw error;
  }
}

function getDependencies(features) {
  const deps = ['react', 'react-dom'];

  if (features.includes(CHOICES.NEXT)) {
    deps.push('next');
  }
  if (features.includes(CHOICES.TS)) {
    deps.push('typescript', '@types/react', '@types/node');
  }
  if (features.includes(CHOICES.TAILWIND)) {
    deps.push('tailwindcss', 'postcss', 'autoprefixer');
  }
  if (features.includes(CHOICES.SUPABASE)) {
    deps.push('@supabase/supabase-js');
  }
  if (features.includes(CHOICES.OPENAI)) {
    deps.push('openai');
  }

  return deps;
} 