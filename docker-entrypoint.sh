./run-keycloak.sh & \
./run-server.sh & \
node server/proxy.js & \
wait -n

# Exit with status of process that exited first
exit $?