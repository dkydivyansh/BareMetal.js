# Contributing to BareMetal.js

First off, thank you for considering contributing to BareMetal.js! It's people like you that make BareMetal.js such a great tool.

## How to Contribute

### Reporting Bugs

If you find a bug in the source code, you can help us by submitting an issue to our GitHub Repository. Even better, you can submit a Pull Request with a fix.

When reporting an issue, please include:
- A quick summary of the issue
- Steps to reproduce
- Expected behavior vs actual behavior
- Browser and OS version

### Suggesting Enhancements

If you have an idea to improve BareMetal.js, we would love to hear it! Please open an issue to discuss your idea before implementing it to ensure it aligns with the project's goals.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Issue that pull request!

## Code Style

- We use ES modules (no build step for the core engine).
- Keep dependencies to absolute zero.
- Maintain a clean, minimalist approach. Performance is a key feature.

## Development Setup

To run the project locally:

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/BareMetal.js.git
   ```
2. Navigate to the project directory:
   ```bash
   cd BareMetal.js
   ```
3. Start a local server. For example:
   ```bash
   npx serve .
   ```
4. Open `http://localhost:3000/demo/page1.html` in your browser.

Thanks for contributing!
