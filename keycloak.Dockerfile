FROM keycloak

CMD ["/opt/keycloak/bin/kc.sh", "start", "--hostname 0.0.0.0"]
