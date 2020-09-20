xhost + 127.0.0.1

if [[ -n $(docker ps -a --quiet --filter 'name=gecko_quickstrom') ]];
then
  docker rm -f gecko_quickstrom
fi

docker run  -p 4444:4444 \
  -d \
  -e DISPLAY=host.docker.internal:0 \
  --name gecko_quickstrom \
  --entrypoint "" \
  instrumentisto/geckodriver \
  /bin/bash -c '/opt/firefox/firefox --marionette & geckodriver --log=debug --host=0.0.0.0 --connect-existing --marionette-port 2828'


docker run \
  --network=host \
  --rm \
  --mount=type=bind,source=$PWD/specs,target=/specs \
  quickstrom/quickstrom:latest \
  quickstrom check \
  /specs/Default.spec.purs \
  http://host.docker.internal:3000/