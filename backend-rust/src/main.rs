use actix_web::{web, App, HttpResponse, HttpServer, Result, HttpRequest, Error as ActixError};
use actix_web_actors::ws;
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use redis::Client;
use uuid::Uuid;
use docker_api::Docker;
use anyhow::Result as AnyResult;
use std::sync::Arc;
use tracing::{info, error};

#[derive(Serialize)]
struct Health { status: String }

async fn health() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(Health { status: "ok".to_string() }))
}

#[derive(Deserialize)]
struct StartLab { user_id: Uuid, course_id: Uuid }

async fn start_lab(
    pool: web::Data<PgPool>,
    redis: web::Data<Client>,
    info: web::Json<StartLab>,
) -> AnyResult<HttpResponse> {
    let docker = Docker::new("unix:///var/run/docker.sock");
    let uuid = Uuid::new_v4();
    let container_name = format!("lab-{}", uuid);

    let container = docker
        .containers()
        .create(&docker_api::models::ContainerCreate {
            name: container_name.clone(),
            config: Some(Box::new(docker_api::models::ContainerConfig {
                image: Some("node:20".to_string()),
                tty: Some(true),
                stdin_open: Some(true),
                ..Default::default()
            })),
            ..Default::default()
        })
        .await?;

    container.start().await?;

    // Store in Redis
    let mut con = redis.get_async_connection().await?;
    con.set_ex(&format!("lab:{}", info.user_id), container.id().unwrap_or_default(), 3600).await?;

    info!("Lab container {} started for user {}", uuid, info.user_id);
    Ok(HttpResponse::Ok().json(format!("Lab {} started", uuid)))
}

// Simple WS echo for lab terminal (extend for Docker exec later)
struct LabWs;

impl actix_web_actors::ws::Websocket for LabWs {
    fn started(&mut self, ctx: &mut ws::WebsocketContext<Self>) {
        info!("Lab WS started");
    }

    fn binary(&mut self, bytes: bytes::Bytes, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.binary(bytes);
    }

    fn text(&mut self, msg: ws::Message, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.text(msg);
    }
}

async fn ws_lab_handler(req: HttpRequest, stream: web::Payload) -> AnyResult<HttpResponse> {
    ws::start(LabWs, req, stream)
}

#[actix_web::main]
async fn main() -> AnyResult<()> {
    tracing_subscriber::init();

    let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| "postgresql://postgres:lms_secure_pass_2024_change_me@localhost:5432/lms".to_string());
    let pool = PgPool::connect(&database_url).await?;
    let redis_client = Client::open(std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".to_string()))?;

    let pool_data = web::Data::new(pool);
    let redis_data = web::Data::new(redis_client);

    info!("Rust backend starting on 0.0.0.0:8080");

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
            .route("/ws/lab/{user_id}", web::get().to(ws_lab_handler))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await?;

    Ok(())
}
