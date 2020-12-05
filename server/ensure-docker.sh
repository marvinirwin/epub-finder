#!/usr/bin/env bash
# TODO handle other states than nonexistance, running and stopped,
IMAGE_NAME=${1:-mandarin-trainer};
DATA_DIR=${2:-~/mandarin-trainer-data/};
SQL_ROOT_PASSWORD=password;

# If we are already running
if [ -n "$(sudo docker ps -f name="$IMAGE_NAME" --format "{{.Image}}")" ] # If we don't format the output it will output column names even if there are no results
then
  echo "Image already running, don't need to do anything"
# If the container does not exist
elif [ -z "$(sudo docker ps -a -f name="$IMAGE_NAME" --format "{{.Image}}")" ]
then
  echo "container doesn't exist, executing docker run";
  sudo docker run \
    -e PGDATA=/var/lib/postgresql/data/pgdata \
    -v "$DATA_DIR":/var/lib/postgresql/data \
    -p 5432:5432 \
    --name "$IMAGE_NAME" \
    -e POSTGRES_PASSWORD=$SQL_ROOT_PASSWORD \
    -d postgres;
elif [ -n "$(sudo docker ps -f publish=5432)" ]
then
  echo "Another docker container is listening on 5432, cannot start $IMAGE_NAME";
# If we exist, but are exited
elif [ -z "$(sudo docker ps -f status=exited -f name="$IMAGE_NAME" --format "{{.Image}}")" ]
then
  echo "container off, starting"
  sudo docker start "$IMAGE_NAME";
else
  echo "ERROR: Could not determine container state"
fi