FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY src ./src
COPY dbschema ./dbschema

# Create non-root user
RUN adduser -D -s /bin/sh banking
RUN chown -R banking:banking /app
USER banking

EXPOSE 3000

CMD ["bun", "src/app.ts"] 