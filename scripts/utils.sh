red() {
  echo '\0[31m'$1'\e[0m'
}
green() {
  echo '\0[32m'$1'\e[0m'
}
blue() {
  echo '\0[33m'$1'\e[0m'
}

symlink-env() {
  # What happens if the symlink already exists?
  ln -f .env reader/.env
  ln -f .env server/.env
}

npm_version() {
  node --eval="process.stdout.write(require('./package.json').version)";
}


deploy_language_trainer() {

  local SSH_USER=root;
  local SSH_HOST=marvinirwin.com;

  local OPTIND o BUILD_CLIENT BUILD_SERVER;

  while getopts ":cs:" o; do
      case "${o}" in
          s)
              BUILD_CLIENT="${OPTARG:-1}"
              ;;
          c)
              BUILD_CLIENT="${OPTARG:-1}"
              ;;
          *)
            ;;
      esac
  done
  shift $((OPTIND-1))
  # Build the server
  pushd server || exit;
  local SERVER_VERSION=$(npm_version);
  [ -n "$BUILD_SERVER" ] && npm run build;
  popd || exit;
  # Build the reader
  pushd reader || exit;
  local READER_VERSION=$(npm_version);
  [ -n "$BUILD_CLIENT" ] && npm run build;
  popd || exit;

  cp -rf reader/build/* server/public;
  pushd server || exit;

  local FOLDER="/language-trainer-$READER_VERSION-$SERVER_VERSION";
  local DEST="$SSH_USER@$SSH_HOST:$FOLDER";

  rsync -a dist/ "$DEST";
  rsync -a cache/ "$DEST/cache";
  rsync -a public/ "$DEST/public";
  rsync -a package.json "$DEST/package.json"

  popd || exit;
  ssh -t "$SSH_USER@$SSH_HOST" "
  rm public/video;
  if [ \"\$(tmux ls | grep -q language-trainer)\" ]; then
    tmux attach -t \"language-trainer\";
  else
    tmux new-session -s \"language-trainer\";
  fi
  cd $FOLDER;
  rm -rf video;
  ln -s /video video;
  npm install;
  ln -s /.language-trainer-env .env;
  node main.js
  ";
}


# Takes a list of keys $1
# and a function which resolves the current value for that key $2
# then we ask the user to confirm the value of the key
confirm-keys() {
  KEYS=$1;
  GET_VALUE_FUNC=$2;
  OUTPUT_LINES=();
  for KEY in $KEYS; do
    CURRENT_VALUE=$($GET_VALUE_FUNC "$KEY");
    read -r -p "$KEY ($CURRENT_VALUE)" NEW_VALUE;
    NEW_VALUE=${NEW_VALUE:-$CURRENT_VALUE}
    OUTPUT_LINES+=("$KEY=$NEW_VALUE");
  done;
  echo "$(IFS=$'\n'; echo "${OUTPUT_LINES[*]}")";
}


# DESIRED_KEY
get-value-in-env() {
  DESIRED_KEY=$1;
  ENV_LINES=$(cat .env);
  for LINE in $ENV_LINES; do
    KEY=$(get-env-key "$LINE");
    VALUE=$(get-env-value "$LINE");
    if [ "$KEY" = "$DESIRED_KEY" ]; then
      echo "$VALUE";
      return;
    fi
  done;
}

confirm-env-keys() {
  LINES=$(cat .template.env);
  # Will this interpolate?
  KEYS=$(map "get-env-key" "$LINES");
  confirm-keys "$KEYS" "get-value-in-env";
}

get-env-key() {
  echo "$1" | awk -F= '{print $1}';
}
get-env-value() {
  echo "$1" | awk -F= '{$1 = ""; print substr($0, 2); }';
}

map() {
  FUNC=$1;
  LINES=$2;
  RESULTS=();
  for LINE in $LINES; do
    RESULTS+=("$($FUNC "$LINE")")
  done
  echo "$(IFS=$'\n'; echo "${RESULTS[*]}")";
}

