# create-studiocms

[![NPM Version](https://img.shields.io/npm/v/create-studiocms?style=for-the-badge&logo=npm)](https://npm.im/create-studiocms)
[![Formatted with Biome](https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=for-the-badge&logo=biome)](https://biomejs.dev/)

CLI Utility Toolkit used for setting up a new project using a StudioCMS Ecosystem packages, as well as other utilities.

> [!WARNING]
> This package has not yet been released.  The goal is to release this alongside the StudioCMS v0.1.0-beta.8 release!

## Quickstart

### Use with NPM

```sh
npm create studiocms@latest
```

### Use with PNPM

```sh
pnpm create studiocms
```

### Use with Yarn

```sh
yarn create studiocms
```

`create-studiocms` automatically runs in _interactive_ mode, but you can also specify your project name and template with command line arguments.

```sh
# npm
npm create studiocms@latest --template studiocms/basics --project-name my-studiocms-project

# yarn
yarn create studiocms --template studiocms/basics --project-name my-studiocms-project

# pnpm
pnpm create studiocms --template studiocms/basics --project-name my-studiocms-project
```

[Check out the full list][templates] of templates, available on GitHub.

When using `--template` the default behavior is to search the Templates repo and is declared as folders. for example the `studiocms/basics` templates points to the `basics` project within the `studiocms` folder at the root of the repo.

## Full CLI Options and commands

### Main Entrypoint

```log
Usage: create-studiocms [options] [command]

Options:
  -V, --version  Output the current version of the CLI Toolkit.
  -h, --help     display help for command
  --color        force color output
  --no-color     disable color output

Commands:
  help           Show help for command
  interactive *  Start the interactive CLI.

  * Indicates the default command that is run when calling this CLI.
```

### Interactive (Default command)

```log
Usage: create-studiocms interactive [options]

Start the interactive CLI. Powered by Clack.cc.

This command will open an interactive CLI prompt to guide you through
the process of creating a new StudioCMS(or StudioCMS Ecosystem package)
project using one of the available templates.

Options:
  -t, --template [template]          The template to use.
  -r, --template-ref [template-ref]  The template reference to use.
  -p, --project-name [project-name]  The name of the project.
  -i, --install                      Install dependencies.
  -g, --git                          Initialize a git repository.
  -y, --yes                          Skip all prompts and use default values.
  -n, --no                           Skip all prompts and use default values.
  -q, --skip-banners                 Skip all banners and messages.
  --do-not-install                   Do not install dependencies.
  --do-not-init-git                  Do not initializing a git repository.
  --dry-run                          Do not perform any actions.
  -h, --help                         display help for command
```

[templates]: https://github.com/withstudiocms/templates