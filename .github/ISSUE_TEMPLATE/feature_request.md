name: 💡 Feature Request
description: Suggest a new feature or improvement
title: "[FEATURE] Brief description"
labels: ["enhancement"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thanks for the suggestion! Help us understand your feature request.

  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      description: Describe the problem you're trying to solve
      placeholder: "I'm trying to... but currently..."
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Describe the solution you'd like
      description: How should this feature work?
      placeholder: "The feature should allow..."
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives considered
      description: Have you thought of other ways to solve this?
      placeholder: "Another approach could be..."

  - type: textarea
    id: additional
    attributes:
      label: Additional context
      description: Any other details?
      placeholder: "This would help developers who..."

  - type: checkboxes
    id: terms
    attributes:
      label: Before submitting
      options:
        - label: I checked existing issues and discussions
          required: true
        - label: This is not a duplicate
          required: true
