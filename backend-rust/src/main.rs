use actix_web::{web, App, HttpResponse, HttpServer, Result};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use redis::AsyncCommands;
use uuid::Uuid;
use docker_api::Docker;
use std::sync::Arc;

#[derive(Serialize)]
struct Health {
    status: String,
}

async fn health() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(Health { status: "ok".to_string() }))
}

#[derive(Deserialize)]
struct StartLab {
    user_id: Uuid,
    course_id: Uuid,
}

async fn start_lab(
    pool: web::Data<PgPool>,
    redis: web::Data<redis::Client>,
    info: web::Json<StartLab>,
) -> Result<HttpResponse> {
    // Create Docker container for lab env (Node/Python/etc)
    let docker = Docker::new("unix:///var/run/docker.sock");
    let uuid = Uuid::new_v4();
    let container = docker.containers().create(&docker_api::models::ContainerCreate {
        name: format!("lab-{}", uuid),
        config: Some(Box::new(docker_api::models::ContainerConfig {
            image: Some("node:20".to_string()),  // Coding env image
            tty: Some(true),
            stdin_open: Some(true),
            // ...
            ..Default::default()
        })),
        ..Default::default()
    }).await.unwrap();

    container.start().await.unwrap();

    // Redis: store lab session
    let mut con = redis.get_async_connection().await.unwrap();
    con.set_ex(&format!("lab:{}", info.user_id), container.id().to_string(), 3600).await.unwrap();

    Ok(HttpResponse::Ok().json(format!("Lab {} started", uuid)))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::init();

    let pool = PgPool::connect(&std::env::var("DATABASE_URL").unwrap()).await.unwrap();
    let redis_client = redis::Client::open("redis://localhost:6379").unwrap();

    let pool_data = web::Data::new(pool);
    let redis_data = web::Data::new(redis_client);

    HttpServer::new(move || {
        App::new()
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
            )
            .app_data(pool_data.clone())
            .app_data(redis_data.clone())
            .route("/health", web::get().to(health))
            .route("/api/labs/start", web::post().to(start_lab))
            .route("/ws/lab/{user_id}", web::get().to(ws_lab_handler))  // WS for terminal
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}

// Placeholder WS handler for Xterm.js
async fn ws_lab_handler() -> Result<HttpResponse> {
    // Implement WebSocket for Monaco/Xterm forwarding to container
    Ok(HttpResponse::Ok().body("WS Lab"))
}

