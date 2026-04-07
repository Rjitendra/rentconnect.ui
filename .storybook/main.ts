import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../.storybook/**/*.mdx',
    '../projects/shared/src/lib/components/**/*.stories.@(ts|mdx)',
    '../src/app/common/components/**/*.stories.@(ts|mdx)',
  ],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
};

export default config;
