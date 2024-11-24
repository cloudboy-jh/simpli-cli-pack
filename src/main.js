import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import { execa } from 'execa';
import ora from 'ora';
import path from 'path';

export async function createProject(projectName) {
  console.log(chalk.blue(`Creating new project: ${projectName}\n`));

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select additional features to include:',
      choices: [
        { name: 'shadcn/ui Components', value: 'shadcn', checked: true },
        { name: 'Lucide Icons', value: 'lucide', checked: true },
        { name: 'Supabase', value: 'supabase' },
        { name: 'OpenAI', value: 'openai' }
      ]
    }
  ]);

  try {
    // Step 1: Create Next.js project
    console.log(chalk.yellow('\n📦 Installing Next.js (this might take a few minutes)...'));
    const dependencies = [
      ...(answers.features.includes('lucide') ? ['lucide-react'] : []),
      ...(answers.features.includes('supabase') ? ['@supabase/supabase-js'] : []),
      ...(answers.features.includes('openai') ? ['openai'] : [])
    ];

    await execa('npx', [
      'create-next-app@latest',
      projectName,
      '--typescript',
      '--tailwind',
      '--eslint',
      '--app',
      '--src-dir',
      '--import-alias', '@/*',
      ...(dependencies.length > 0 ? ['--dependencies', ...dependencies] : [])
    ], { stdio: 'inherit' });

    // Step 2: Set up shadcn/ui if selected
    if (answers.features.includes('shadcn')) {
      console.log(chalk.yellow('\n🎨 Setting up shadcn/ui...'));
      await execa('npx', ['shadcn-ui@latest', 'init'], { 
        cwd: projectName,
        stdio: 'inherit'
      });
    }

    // Step 3: Create config files
    if (answers.features.includes('supabase') || answers.features.includes('openai')) {
      console.log(chalk.yellow('\n⚙️  Creating configuration files...'));
      
      if (!fs.existsSync(path.join(projectName, 'src/lib'))) {
        fs.mkdirSync(path.join(projectName, 'src/lib'), { recursive: true });
      }

      if (answers.features.includes('supabase')) {
        fs.writeFileSync(
          path.join(projectName, 'src/lib/supabase.ts'),
          `
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(supabaseConfig.url, supabaseConfig.key);
`
        );
      }

      if (answers.features.includes('openai')) {
        fs.writeFileSync(
          path.join(projectName, 'src/lib/openai.ts'),
          `
import OpenAI from 'openai';
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
`
        );
      }

      // Create .env.local
      const envContent = [
        answers.features.includes('supabase') ? 
          'NEXT_PUBLIC_SUPABASE_URL=your-project-url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key' : '',
        answers.features.includes('openai') ? 
          'OPENAI_API_KEY=your-openai-key' : ''
      ].filter(Boolean).join('\n\n');

      if (envContent) {
        fs.writeFileSync(path.join(projectName, '.env.local'), envContent);
      }
    }

    console.log(chalk.green('\n✨ Project created successfully!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.white(`  1. cd ${projectName}`));
    if (answers.features.includes('supabase') || answers.features.includes('openai')) {
      console.log(chalk.white('  2. Update your .env.local with your API keys'));
      console.log(chalk.white('  3. npm run dev'));
    } else {
      console.log(chalk.white('  2. npm run dev'));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
} 