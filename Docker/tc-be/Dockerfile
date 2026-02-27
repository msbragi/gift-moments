# Base Debian slim - glibc compatibile, dimensioni ridotte
FROM node:22-bookworm-slim

WORKDIR /opt/tc-be/app

# Install dependencies in single layer per ridurre dimensioni
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    wget \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/apt/* \
    && rm -rf /tmp/*

# Copy files e extract in single layer per efficienza
COPY be-dist.zip be-node_modules.zip ./

RUN chown -R node:node /opt/tc-be
# Switch to node user after default installation to avoid permission issues
USER node

# Extract e setup permissions in single RUN (ottimizzazione layer)
RUN unzip be-dist.zip \
    && unzip be-node_modules.zip \
    && rm be-dist.zip be-node_modules.zip \
    && mkdir -p data/sqlite uploads logs

EXPOSE 3000

# Health check ottimizzato
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api || exit 1

# Process management ottimizzato
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "/opt/tc-be/app/dist/src/main.js"]