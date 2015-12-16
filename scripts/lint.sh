#!/bin/bash

BOLD=$(tput bold)
UNDERLINE=$(tput smul)
NORMAL=$(tput sgr0)

files_to_lint="."
if [ "$1" == "modified" ]; then
  files_to_lint=$(git diff --cached --name-only --diff-filter=ACM | grep '\.js$')
fi

if [ -n "$files_to_lint" ]; then
  echo
  echo "${UNDERLINE}${BOLD}ESLINT${NORMAL}"
  npm run eslint -- --quiet $files_to_lint
fi
