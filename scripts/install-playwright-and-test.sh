#!/bin/sh

set -eu

sed -i \
  's|http://deb.debian.org|https://deb.debian.org|g' \
  /etc/apt/sources.list.d/debian.sources

cat > /etc/apt/apt.conf.d/99network <<'EOF'
Acquire::ForceIPv4 "true";
Acquire::Retries "3";
EOF

apt-get update

npx playwright install \
  --with-deps \
  --only-shell \
  chromium

npm run build
npm run test:a11y