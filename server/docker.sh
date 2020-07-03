#!/usr/bin/env bash
# TODO handle other states than nonexistance, running and stopped,
IMAGE_NAME=${1:-mandarin-trainer};
DATA_DIR=${2:-~/mandarin-trainer-data/};
MYSQL_USER=root;
MYSQL_ROOT_PASSWORD=password;

# If we are already running
if [ -n "$(sudo docker ps -f name="$IMAGE_NAME" --format "{{.Image}}")" ] # If we don't format the output it will output column names even if there are no results
then
  echo "Image already running, don't need to do anything"
# If the container does not exist
elif [ -z "$(sudo docker ps -a -f name="$IMAGE_NAME" --format "{{.Image}}")" ]
then
  echo "container doesn't exist, executing docker run";
  sudo docker run \
    -p 3306:3306 \
    -v "$DATA_DIR":/var/lib/mysql \
    --name "$IMAGE_NAME" \
    -e MYSQL_USER=$MYSQL_USER \
    -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
    -d mysql;
# If somebody else is listening 3306   Will this filter out off instances?  I only want this block to appear
elif [ -n "$(sudo docker ps -f publish=3306)" ]
then
  echo "Another docker container is listening on 3306, cannot start $IMAGE_NAME";
# If we exist, but are exited
elif [ -z "$(sudo docker ps -f status=exited -f name="$IMAGE_NAME" --format "{{.Image}}")" ]
then
  echo "container off, starting"
  sudo docker start "$IMAGE_NAME";
else
  echo "ERROR: Could not determine container state"
fi