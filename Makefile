up:
	docker compose up --build -d

down:
	docker compose down

restart:
	docker compose down && docker compose up --build -d

logs:
	docker compose logs -f

logs-gateway:
	docker compose logs -f gateway

logs-users:
	docker compose logs -f users-service

logs-products:
	docker compose logs -f products-service

logs-orders:
	docker compose logs -f orders-service

logs-frontend:
	docker compose logs -f frontend

ps:
	docker compose ps

clean:
	docker compose down -v --remove-orphans

rebuild:
	docker compose build --no-cache
