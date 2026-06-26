##############################################################
# Stage 1: pre-bake stripe-diag-collector into Verdaccio storage.
# Runs npm pack and generates the registry metadata JSON so
# verdaccio starts with the package already available — no
# runtime publish step, no auth dance.
##############################################################
FROM node:22-alpine AS storage-builder
COPY packages/ /tmp/packages/
COPY build-storage.js /tmp/build-storage.js
RUN node /tmp/build-storage.js \
      /tmp/packages/stripe-diag-collector \
      /storage/stripe-diag-collector && \
    node /tmp/build-storage.js \
      /tmp/packages/acme-payment-telemetry \
      /storage/acme-payment-telemetry && \
    chmod +x /tmp/packages/@acme/diagnostics/bin/check.js && \
    node /tmp/build-storage.js \
      /tmp/packages/@acme/diagnostics \
      /storage/@acme/diagnostics

##############################################################
# Stage 2: verdaccio runtime
##############################################################
FROM node:22-alpine
RUN npm install -g verdaccio@5 && apk add --no-cache wget

COPY config.yml /etc/verdaccio/config.yaml
# Pre-populated storage: stripe-diag-collector is available from first request.
COPY --from=storage-builder /storage /verdaccio/storage

EXPOSE 80
CMD ["verdaccio", "--config", "/etc/verdaccio/config.yaml"]
