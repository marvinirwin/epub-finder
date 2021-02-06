red() {
  echo '\0[31m'$1'\e[0m'
}
green() {
  echo '\0[32m'$1'\e[0m'
}
blue() {
  echo '\0[33m'$1'\e[0m'
}

symlink_env() {
  # What happens if the symlink already exists?
  ln -f .env reader/.env
  ln -f .env server/.env
}

npm_version() {
  node --eval="process.stdout.write(require('./package.json').version)";
}

SSH_USER=root;
SSH_HOST="$marvinirwin";

while getopts 'cs' o; do
    case "${o}" in
        s)
            BUILD_SERVER="${OPTARG:-1}"
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
SERVER_VERSION=$(npm_version);
[ -n "$BUILD_SERVER" ] && npm run build;
popd || exit;
# Build the reader
pushd reader || exit;
READER_VERSION=$(npm_version);
[ -n "$BUILD_CLIENT" ] && npm run build;
popd || exit;

# cp -rf reader/build/* server/public;

FOLDER="/language-trainer-$READER_VERSION-$SERVER_VERSION";
DEST="$SSH_USER@$SSH_HOST:$FOLDER";

echo "rsyncing server code"
rsync -v -a server/dist/* "$DEST";

echo "rsyncing reader code"
rsync -v -a --exclude video --exclude books reader/build/*  "$DEST/public"

echo "rsyncing server package.json"
rsync -v -a server/package.json "$DEST/package.json"

# popd || exit;
[ ! -n "$BUILD_SERVER" ] && exit;
exit;
ssh -t "$SSH_USER@$SSH_HOST" "
if [ \"\$(tmux ls | grep -q language-trainer)\" ]; then
  tmux attach -t \"language-trainer\";
else
  tmux new-session -s \"language-trainer\";
fi

cd $FOLDER;
rm -rf public/video;
ln -s /video public/video;
npm install;
ln -s /.language-trainer.env .env;
node main.js
";
