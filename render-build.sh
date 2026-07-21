#!/usr/bin/env bash
set -e
npm install
cd apps/api
npx prisma generate
npx nest build
