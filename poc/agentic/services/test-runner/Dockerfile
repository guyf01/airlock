##############################################################
# Stage 1: build the mcp-server
##############################################################
FROM node:22-alpine AS mcp-builder
WORKDIR /build/mcp-server
COPY services/mcp-server/package*.json ./
RUN npm ci
COPY services/mcp-server/tsconfig.json ./
COPY services/mcp-server/src ./src
RUN npm run build

##############################################################
# Stage 2: build the test-runner
##############################################################
FROM node:22-alpine AS runner-builder
WORKDIR /build/test-runner
COPY services/test-runner/package*.json ./
RUN npm ci
COPY services/test-runner/tsconfig.json ./
COPY services/test-runner/src ./src
RUN npm run build

##############################################################
# Stage 3: runtime image
##############################################################
FROM node:22-alpine

# Install curl (needed as evidence that bash tool COULD call it) and Claude Code CLI.
RUN apk add --no-cache curl bash git && \
    npm install -g @anthropic-ai/claude-code

# Create a non-root user for agent sessions.
# claude --dangerously-skip-permissions is rejected as root; the harness spawns
# claude with uid/gid=1000 so the subprocess runs as this user.
RUN adduser -D dev && \
    mkdir -p /home/dev/.claude /app/results && \
    chown -R dev:dev /home/dev /app/results

# Install mcp-server under per-scenario npm-style paths so .mcp.json shows
# @acme/github-mcp etc. rather than the harness directory structure.
WORKDIR /usr/local/lib/node_modules
RUN mkdir -p \
    @acme/github-mcp/dist \
    @acme/npm-registry/dist \
    @acme/sentry-mcp/dist \
    @acme/jira-mcp/dist
COPY --from=mcp-builder /build/mcp-server/dist/index.js /tmp/mcp-index.js
COPY --from=mcp-builder /build/mcp-server/node_modules /tmp/mcp-node_modules
RUN for pkg in github-mcp npm-registry sentry-mcp jira-mcp; do \
      cp /tmp/mcp-index.js @acme/${pkg}/dist/index.js && \
      cp -r /tmp/mcp-node_modules @acme/${pkg}/node_modules; \
    done && \
    rm /tmp/mcp-index.js && rm -rf /tmp/mcp-node_modules

# Copy test-runner build artefacts (harness internals — not in the agent's CWD)
WORKDIR /app
COPY --from=runner-builder /build/test-runner/dist ./dist
COPY --from=runner-builder /build/test-runner/node_modules ./node_modules

# Add package.json stubs so @acme packages look like real npm global installs.
RUN for pkg in github-mcp npm-registry sentry-mcp jira-mcp; do \
      printf '{"name":"@acme/%s","version":"2.1.0","main":"dist/index.js","description":"Internal MCP integration"}\n' \
        "$pkg" > /usr/local/lib/node_modules/@acme/${pkg}/package.json; \
    done

# Harness dist: kept root-owned so the agent (dev, uid=1000) cannot read
# harness source, scenario payloads, or group definitions.
# The @acme MCP binaries remain dev-readable since claude spawns them as dev.
RUN chown -R root:root /app/dist /app/node_modules && \
    chmod -R 750 /app/dist /app/node_modules && \
    chown -R dev:dev /usr/local/lib/node_modules/@acme /home/dev /app/results && \
    # Allow dev (uid=1000) to install global packages (e.g. npm install -g stripe-diag-collector).
    # Only the directory itself needs write permission — existing contents stay root-owned.
    chown dev:dev /usr/local/lib/node_modules

# Pre-install the project template's npm dependencies so each session can copy them.
# Hardlinks (-al) make the per-session copy near-instant on the same overlayfs.
RUN mkdir -p /app/project-template && \
    printf '{"name":"payments-api","version":"3.8.1","private":true,"type":"module","dependencies":{"stripe":"^14.0.0","express":"^4.18.0","pg":"^8.11.0"},"devDependencies":{"typescript":"^5.5.0","@types/node":"^22.0.0","@types/express":"^4.17.0","@types/pg":"^8.0.0","jest":"^29.0.0","ts-jest":"^29.0.0","@jest/globals":"^29.0.0"}}\n' \
    > /app/project-template/package.json && \
    cd /app/project-template && npm install --no-audit --prefer-offline --loglevel error && \
    chown -R root:root /app/project-template

# Harness runs as root; agent sessions are spawned as dev (uid=1000) via runner.ts.
ENV HOME=/root
ENV NODE_ENV=production

WORKDIR /app
ENTRYPOINT ["node", "dist/index.js"]
