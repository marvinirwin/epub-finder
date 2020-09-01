cd reader || exit;
npm run build;
cd ../server || exit;
npm run build;
mkdir dist/public;
cp ../reader/build/* dist/public/*;
mv dist ../mandarin-trainer-server;