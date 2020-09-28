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

build-mandarin-trainer() {
  # Clear the folder we're copying
  rm -r dist;

  # Build the server
  pushd server;
  npm run build;
  popd;
  mv server/dist dist;
  # Build the reader
  pushd reader;
  npm run build;
  popd;
  mv reader/build dist/public/reader;

  mkdir dist/wav_cache; # Make the wav_cache
  confirm-env-keys > dist/.env # Make the .env

  scp -r dist root@marvinirwin.com:/mandarin-trainer;
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

