deploy:
	docker compose build bb-front
	docker compose up -d bb-front
