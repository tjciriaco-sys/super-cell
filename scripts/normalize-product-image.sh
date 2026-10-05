#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Uso: $0 imagem-de-origem arquivo-de-destino.webp" >&2
  exit 1
fi

source_image="$1"
destination_image="$2"

mkdir -p "$(dirname "$destination_image")"
convert "$source_image" \
  -auto-orient \
  -fuzz 8% -trim +repage \
  -resize '720x720' \
  -background '#ffffff' \
  -gravity center \
  -extent 900x900 \
  -strip \
  -quality 88 \
  "$destination_image"
