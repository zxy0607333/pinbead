#!/usr/bin/env bash
set -euo pipefail

# Summary:
#   Build and optionally push the Docker image for this project.
#
# Default image repository:
#   zhangxianyuan/yukid-tool
#
# Default tag format:
#   zhangxianyuan/yukid-tool:pinbead-<version>
#   zhangxianyuan/yukid-tool:pinbead-latest
#
# Examples:
#   ./build.sh 0.1.0 --push
#   ./build.sh --push --login
#   IMAGE_REPO=registry.example.com/myteam/yukid-tool ./build.sh 0.1.0 --push

ENV_FILE_PATH="${ENV_FILE_PATH:-.env}"
APP_NAME="${APP_NAME:-}"
IMAGE_REPO="${IMAGE_REPO:-}"
DOCKERFILE_PATH="${DOCKERFILE_PATH:-}"
PLATFORM="${PLATFORM:-}"
VERSION="${VERSION:-}"

PUSH=false
LATEST=true
LOGIN=false
LOAD=false

ENV_FILE_KEYS=(
  APP_NAME
  IMAGE_REPO
  DOCKERFILE_PATH
  PLATFORM
  VERSION
  DOCKER_USERNAME
  DOCKER_PASSWORD
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_GA_MEASUREMENT_ID
  NEXT_PUBLIC_ADSENSE_CLIENT_ID
)

PUBLIC_BUILD_ARG_KEYS=(
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_GA_MEASUREMENT_ID
  NEXT_PUBLIC_ADSENSE_CLIENT_ID
)

usage() {
  cat <<EOF
Usage:
  ./build.sh [version] [options]

Examples:
  ./build.sh 0.1.0 --push
  ./build.sh --push --login
  IMAGE_REPO=registry.example.com/myteam/yukid-tool ./build.sh 0.1.0 --push
  APP_NAME=pinbead IMAGE_REPO=zhangxianyuan/yukid-tool ./build.sh --load

Options:
  --push         Build and push images
  --login        Run docker login before push using DOCKER_USERNAME/DOCKER_PASSWORD
  --latest       Also tag latest (default)
  --no-latest    Skip the latest tag
  --load         Load the built image into local Docker
  --platform     Target platform, default: linux/amd64
  -h, --help     Show this help

Environment variables:
  APP_NAME         Tag prefix, default: pinbead
  IMAGE_REPO       Image repository, default: zhangxianyuan/yukid-tool
  VERSION          Version string, defaults to package.json version
  PLATFORM         Target platform, default: linux/amd64
  DOCKERFILE_PATH  Dockerfile path, default: Dockerfile
  DOCKER_USERNAME  Optional, used with --login
  DOCKER_PASSWORD  Optional, used with --login

Tag format:
  ${IMAGE_REPO:-zhangxianyuan/yukid-tool}:${APP_NAME:-pinbead}-<version>
  ${IMAGE_REPO:-zhangxianyuan/yukid-tool}:${APP_NAME:-pinbead}-latest

Forwarded build args:
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_GA_MEASUREMENT_ID
  NEXT_PUBLIC_ADSENSE_CLIENT_ID

Automatic env loading:
  ENV_FILE_PATH    Path to env file, default: .env
EOF
}

is_env_key_allowed() {
  local candidate="$1"

  for allowed_key in "${ENV_FILE_KEYS[@]}"; do
    if [[ "$allowed_key" == "$candidate" ]]; then
      return 0
    fi
  done

  return 1
}

load_env_file() {
  local env_file_path="$1"

  if [[ ! -f "$env_file_path" ]]; then
    return
  fi

  echo "[INFO] Loading environment from ${env_file_path}"

  while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
    local line="${raw_line%$'\r'}"

    if [[ "$line" =~ ^[[:space:]]*$ || "$line" =~ ^[[:space:]]*# ]]; then
      continue
    fi

    if [[ "$line" =~ ^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=[[:space:]]*(.*)$ ]]; then
      local key="${BASH_REMATCH[2]}"
      local value="${BASH_REMATCH[3]}"

      if ! is_env_key_allowed "$key"; then
        continue
      fi

      if [[ "$value" =~ ^\"(.*)\"$ ]]; then
        value="${BASH_REMATCH[1]}"
      elif [[ "$value" =~ ^\'(.*)\'$ ]]; then
        value="${BASH_REMATCH[1]}"
      fi

      if [[ -z "${!key:-}" ]]; then
        export "${key}=${value}"
      fi
    fi
  done < "$env_file_path"
}

resolve_version() {
  if [[ -n "$VERSION" ]]; then
    printf '%s\n' "$VERSION"
    return
  fi

  if [[ -f "package.json" ]]; then
    local detected_version
    detected_version="$(node -p "require('./package.json').version" 2>/dev/null || true)"
    if [[ -n "$detected_version" ]]; then
      printf '%s\n' "$detected_version"
      return
    fi
  fi

  printf '0.1.0\n'
}

resolve_registry() {
  local image_repo="$1"
  local first_segment="${image_repo%%/*}"

  if [[ "$first_segment" == "$image_repo" ]]; then
    printf 'docker.io\n'
    return
  fi

  if [[ "$first_segment" == *.* || "$first_segment" == *:* || "$first_segment" == "localhost" ]]; then
    printf '%s\n' "$first_segment"
    return
  fi

  printf 'docker.io\n'
}

ensure_dockerfile() {
  if [[ ! -f "$DOCKERFILE_PATH" ]]; then
    echo "[ERROR] Dockerfile not found: ${DOCKERFILE_PATH}" >&2
    exit 1
  fi
}

ensure_buildx() {
  if ! docker buildx version >/dev/null 2>&1; then
    echo "[ERROR] docker buildx is required but not available." >&2
    exit 1
  fi

  docker buildx inspect --bootstrap >/dev/null 2>&1 || true
}

ensure_option_value() {
  local option_name="$1"
  local option_value="${2:-}"

  if [[ -z "$option_value" ]]; then
    echo "[ERROR] ${option_name} requires a value." >&2
    exit 1
  fi
}

ensure_tag_prefix() {
  if [[ -z "$APP_NAME" ]]; then
    echo "[ERROR] APP_NAME cannot be empty." >&2
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --push)
      PUSH=true
      shift
      ;;
    --login)
      LOGIN=true
      shift
      ;;
    --latest)
      LATEST=true
      shift
      ;;
    --no-latest)
      LATEST=false
      shift
      ;;
    --load)
      LOAD=true
      shift
      ;;
    --platform)
      ensure_option_value "--platform" "${2:-}"
      PLATFORM="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      if [[ -z "$VERSION" ]]; then
        VERSION="$1"
        shift
      else
        echo "[ERROR] Unknown argument: $1" >&2
        usage
        exit 1
      fi
      ;;
  esac
done

load_env_file "$ENV_FILE_PATH"

APP_NAME="${APP_NAME:-pinbead}"
IMAGE_REPO="${IMAGE_REPO:-zhangxianyuan/yukid-tool}"
DOCKERFILE_PATH="${DOCKERFILE_PATH:-Dockerfile}"
PLATFORM="${PLATFORM:-linux/amd64}"
VERSION="${VERSION:-}"

ensure_tag_prefix
ensure_dockerfile
ensure_buildx

if [[ "$PUSH" == "true" && "$LOAD" == "true" ]]; then
  echo "[ERROR] --push and --load cannot be used together." >&2
  exit 1
fi

if [[ "$PUSH" == "false" && "$LOAD" == "false" ]]; then
  if [[ "$PLATFORM" == *,* ]]; then
    echo "[ERROR] Multi-platform build requires --push." >&2
    exit 1
  fi

  LOAD=true
fi

VERSION="$(resolve_version)"
FULL_VERSION_IMAGE="${IMAGE_REPO}:${APP_NAME}-${VERSION}"
FULL_LATEST_IMAGE="${IMAGE_REPO}:${APP_NAME}-latest"

echo "[INFO] Image repository: ${IMAGE_REPO}"
echo "[INFO] Tag prefix: ${APP_NAME}"
echo "[INFO] Version image: ${FULL_VERSION_IMAGE}"
if [[ "$LATEST" == "true" ]]; then
  echo "[INFO] Latest image: ${FULL_LATEST_IMAGE}"
fi
echo "[INFO] Dockerfile: ${DOCKERFILE_PATH}"
echo "[INFO] Platform: ${PLATFORM}"

if [[ "$LOGIN" == "true" ]]; then
  if [[ -z "${DOCKER_USERNAME:-}" || -z "${DOCKER_PASSWORD:-}" ]]; then
    echo "[ERROR] --login requires DOCKER_USERNAME and DOCKER_PASSWORD." >&2
    exit 1
  fi

  REGISTRY_HOST="$(resolve_registry "$IMAGE_REPO")"
  echo "[INFO] Logging in to registry: ${REGISTRY_HOST}"
  echo "$DOCKER_PASSWORD" | docker login "$REGISTRY_HOST" --username "$DOCKER_USERNAME" --password-stdin
fi

BUILD_ARGS=(
  buildx
  build
  --platform "$PLATFORM"
  -f "$DOCKERFILE_PATH"
  -t "$FULL_VERSION_IMAGE"
)

if [[ "$LATEST" == "true" ]]; then
  BUILD_ARGS+=(-t "$FULL_LATEST_IMAGE")
fi

for key in "${PUBLIC_BUILD_ARG_KEYS[@]}"; do
  value="${!key:-}"
  if [[ -n "$value" ]]; then
    BUILD_ARGS+=(--build-arg "${key}=${value}")
  fi
done

if [[ "$PUSH" == "true" ]]; then
  BUILD_ARGS+=(--push)
elif [[ "$LOAD" == "true" ]]; then
  BUILD_ARGS+=(--load)
fi

BUILD_ARGS+=(.)

echo "[INFO] Starting docker build..."
docker "${BUILD_ARGS[@]}"

echo "[DONE] Build complete"
echo "[DONE] ${FULL_VERSION_IMAGE}"
if [[ "$LATEST" == "true" ]]; then
  echo "[DONE] ${FULL_LATEST_IMAGE}"
fi

if [[ "$PUSH" == "true" ]]; then
  echo
  echo "[INFO] Pull examples:"
  echo "docker pull ${FULL_VERSION_IMAGE}"
  if [[ "$LATEST" == "true" ]]; then
    echo "docker pull ${FULL_LATEST_IMAGE}"
  fi
fi
