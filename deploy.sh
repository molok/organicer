#!/bin/zsh
set -exu
#nvm use --delete-prefix v12.13.1
yarn build && \
    aws s3 cp build/ s3://organicer/ --recursive --profile personal && \
    aws cloudfront create-invalidation --distribution-id E3O2QTIE7KB9ED --profile personal --paths '/*'

