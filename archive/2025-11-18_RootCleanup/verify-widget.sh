#!/bin/bash
set -euo pipefail

echo "Cleaning build cache..."
rm -rf .next

echo "Installing dependencies..."
npm install

echo "Starting dev server (background)..."
PORT=3000 npm run dev > dev.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID' EXIT

sleep 5

echo "Running verification script..."
node scripts/verify-widget.mjs

kill $SERVER_PID
