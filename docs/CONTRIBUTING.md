# Contributing to Telegram Bot Project

Thank you for your interest in contributing to the [CodeModule](https://t.me/CodeModule) Bot Project! Your contributions help improve the project and support the community. This document provides guidelines for contributing to this project. Please follow these instructions to ensure a smooth process.

## Table of Contents
- [Contributing to Telegram Bot Project](#contributing-to-telegram-bot-project)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [How to Contribute](#how-to-contribute)
  - [Testing](#testing)
  - [Commit Messages](#commit-messages)
  - [Pull Request Process](#pull-request-process)
  - [Code of Conduct](#code-of-conduct)

## Getting Started

1. **Fork the Repository:** Click the "Fork" button at the top right corner of the repository page on GitHub to create a personal copy of the repository.
2. **Clone Your Fork:** Clone the repository to your local machine using the following command:
   ```sh
   git clone https://github.com/CodeModule-ir/cop.git
   ```
3. **Set Up Your Environment:**
   - Ensure you have [Node.js](https://nodejs.org/) installed.
   - Install project dependencies:
     ```sh
     cd cmcop
     npm install
     ```

## How to Contribute

1. **Identify an Issue:** Look through the issues in the repository or propose a new feature or fix.
2. **Create a Branch:** Create a new branch for your changes:
   ```sh
   git checkout -b feature/your-feature-name
   ```
3. **Make Your Changes:** Implement your changes or new features.
4. **Commit Your Changes:** Commit your changes with a descriptive message:
   ```sh
   git add .
   git commit -m "Add a descriptive commit message"
   ```
5. **Push Your Branch:** Push your branch to your fork:
   ```sh
   git push origin feature/your-feature-name
   ```

## Testing

- **Run Tests:** Use Mocha to run tests and ensure your changes do not break existing functionality:
  ```sh
  npm test
  ```
- **Add Tests:** If you add new features or fix bugs, include relevant tests to cover your changes.

## Commit Messages

Follow the [Semantic Commit Message](https://www.conventionalcommits.org/en-v1.0.0/) convention for commit messages:
- **feat:** A new feature
- **fix:** A bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, missing semi-colons, etc.)
- **refactor:** Code changes that neither fix a bug nor add a feature
- **test:** Adding or correcting tests
- **chore:** Changes to the build process or auxiliary tools and libraries

Example:
```sh
git commit -m "feat: add new 'warn' command with reason parameter"
```

## Pull Request Process

1. **Open a Pull Request:** Go to the repository on GitHub and open a new pull request. Provide a clear description of your changes and why they are necessary.
2. **Review Process:** Your pull request will be reviewed by me or other members.
3. **Address Feedback:** Make the requested changes and push them to your branch.
4. **Merge:** Once approved, your pull request will be merged into the main branch.

## Code of Conduct

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a positive and respectful environment for everyone.