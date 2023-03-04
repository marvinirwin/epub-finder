# Start the first process
./run-keycloak.sh &

# Start the second process
./run-server.sh &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?