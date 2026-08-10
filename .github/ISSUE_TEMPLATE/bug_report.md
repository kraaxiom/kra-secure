name: 🐛 Bug Report
description: Report a bug or issue you've encountered
title: "[BUG] Brief description"
labels: ["bug"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to report a bug! Please fill out the form below to help us diagnose and fix the issue quickly.

  - type: input
    id: version
    attributes:
      label: kra-secure version
      description: Which version are you using? (run `npm list kra-secure`)
      placeholder: "2.0.3"
    validations:
      required: true

  - type: input
    id: node_version
    attributes:
      label: Node.js version
      description: Output of `node --version`
      placeholder: "v18.12.0"
    validations:
      required: true

  - type: input
    id: os
    attributes:
      label: Operating System
      description: Where does this happen? (Windows, macOS, Linux)
      placeholder: "macOS Monterey"
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Describe the bug
      description: Clear description of what the bug is
      placeholder: "When I run `kra-secure build`, it..."
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      description: How can we reproduce this bug?
      placeholder: |
        1. Create a file with content...
        2. Run command...
        3. Observe error...
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
      description: What should happen instead?
      placeholder: "The build should complete without errors"
    validations:
      required: true

  - type: textarea
    id: code
    attributes:
      label: Code snippet or config
      description: Share relevant code (config file, source, etc.)
      render: javascript

  - type: textarea
    id: error
    attributes:
      label: Error output
      description: Full error message or stack trace
      render: bash

  - type: textarea
    id: additional
    attributes:
      label: Additional context
      description: Any other context?
      placeholder: "I recently updated from v1.x to v2.x..."
