FROM rust:1.80 AS builder

WORKDIR /usr/src/app
COPY Cargo.toml .
COPY Cargo.lock* ./
RUN cargo fetch

COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates docker.io && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /usr/src/app/target/release/lms-backend-rust .

EXPOSE 8080
CMD ["./lms-backend-rust"]
