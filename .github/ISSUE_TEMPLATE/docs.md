name: Documentation Issue
description: Report missing or unclear documentation
title: "[DOCS] Brief description"
labels: ["documentation"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Help us improve our documentation!

  - type: input
    id: location
    attributes:
      label: Where is the issue?
      description: URL or section name (e.g., README.md, docs/CLI.md)
      placeholder: "README.md - Quick Start section"
    validations:
      required: true

  - type: textarea
    id: issue
    attributes:
      label: What's wrong or missing?
      description: Describe the documentation issue
      placeholder: "The example is unclear because..."
    validations:
      required: true

  - type: textarea
    id: suggestion
    attributes:
      label: Suggested improvement
      description: How should this be improved?
      placeholder: "It would be clearer if we added..."
