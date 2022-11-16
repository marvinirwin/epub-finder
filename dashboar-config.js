module.exports = {
	sshTunnels: [
		// Tell dashboar that it’s needs to be use whatever widget is used for ssh tunnels
		{
			configKey: "LanguageTrainer keycloak ssh tunnel",
			storeParameters: {
				username: "ssh tunnel username eg. root",
				password: "ssh tunnel password eg. icecream99",
				host: "ssh tunnel host eg. 165.227.49.247",
				port: "ssh tunnel port eg. 22",
				dstHost: "ssh tunnel destination host eg. 127.0.0.1",
				dstPort: "ssh tunnel destination port eg. 8080",
				localHost: "ssh tunnel local host eg. 127.0.0.1",
				localPort: "ssh tunnel destination port eg. 22"
			},
			command: ({keyCloakSshTunnel}) => keyCloakSshTunnel
		},
	],
	postgresqlConnections: [
		{
			configKey: "LanguageTrainer Postgres database",
			storeParameters: {
				host: {
					sources: {
						sources: "Environment",
						envKey: "TYPEORM_HOST"
					}
				},
				user: {
					sources: {
						sources: "Environment",
						envKey: "TYPEORM_USERNAME"
					}
				},
				password: {
					sources: {
						sourceType: "Environment",
						envKey: "TYPEORM_PASSWORD"
					}
				},
				database: {
					sources: {
						sources: "Environment",
						envKey: "TYPEORM_DATABASE"
					}
				},
				port: {
					type: 'number',
					sources: {
						sources: "Environment",
						envKey: "TYPEORM_PORT"
					}
				}
			},
		}
	],
	repeatedCommands: [
		{
			configKey: "PingKeycloak",
			// Ping the keycloak instance
			command: 'echo "Pinging keycloak on localhost:8080"; ping localhost:8080',
		},
	],
	watchedEnvironmentVariables: [
		[
			"TYPEORM_HOST",
			"TYPEORM_USERNAME",
			"TYPEORM_PASSWORD",
			"TYPEORM_DATABASE",
			"TYPEORM_PORT",
			"TYPEORM_MIGRATIONS_RUN",
			"CLOUD_CONVERT_API_KEY",
			"SANDBOX_CLOUD_CONVERT_API_KEY",
			"PUBLIC_URL",
			"PROD",
			"READING_DOCUMENTS_DIR",
			"TEST_READING_DOCUMENTS_DIR",
			"FREQUENCY_DOCUMENTS_DIR",
			"TEST_FREQUENCY_DOCUMENTS_DIR",
			"DOCUMENT_S3_ACCESS_KEY_ID",
			"DOCUMENT_S3_ACCESS_KEY_SECRET",
			"DOCUMENT_S3_ACCESS_KEY_ID",
			"DOCUMENT_CONVERTER_OUTPUT_S3_ACCESS_KEY_SECRET",
			"DOCUMENT_S3_REGION",
			"DOCUMENT_S3_BUCKET",
			"AZURE_IMAGE_SEARCH_ENDPOINT",
			"AZURE_IMAGE_SEARCH_KEY",
			"SESSION_SECRET_KEY",
			"HTTP_PORT",
			"SYTHTHESIZED_WAV_CACHE_DIR",
			"AZURE_SPEECH_LOCATION",
			"AZURE_SPEECH_KEY1",
			"AZURE_TRANSLATOR_KEY1",
			"AZURE_TRANSLATOR_REGION",
			"VIDEO_DIR",
			"KEYCLOAK_URL",
			"KEYCLOAK_REALM",
			"KEYCLOAK_CLIENT_ID",
			"KEYCLOAK_CLIENT_SECRET",
			"TYPEORM_ENTITIES",
			"TYPEORM_MIGRATIONS"
		]
	],
	healthChecks: [
		{
			url: "http://localhost:3000",
			failureMessage: "The LanguageTrainer client is not running on localhost:3000.  Run `cd epub-finder/reader; npm i; npm run start` to start it",
			successMessage: "LanguageTrainer is running on http://localhost:3000 !",
			configKey: "Client healthcheck"
		},
		{
			url: "http://localhost:3001",
			failureMessage: "The LanguageTrainer server is not running on localhost:3001.  Run `cd epub-finder/server; npm i; npm run start` to start it",
			successMessage: "The LanguageTrainer server is running on localhost:3001!",
			configKey: "Server healthcheck"
		},
	],
	repositoryConfigs: [
		{
			url: "https://github.com/marvinirwin/epub-finder"
		}
	]
}
