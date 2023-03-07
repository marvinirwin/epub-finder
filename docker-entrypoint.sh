# Start the first process
# ./run-keycloak.sh &

# Start the second process
./run-server.sh &

# Start the reverse proxy to send requests between them
node server/proxy.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?