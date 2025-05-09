# GraphQL Microservices Lab

## Описание

Этот проект реализует микросервисную архитектуру с использованием Apollo Federation. Фронтенд интегрирован с микросервисами через гейтвей GraphQL.

## Авторы

* Смирнова Глафира, К3342
* Самойленко Ева, К3344
* Федотова Александра, К3342
* Федоров Лев, К3344

## Компоненты

* **Frontend**: React + Apollo Client

    Взаимодействует с API Gateway через GraphQL.
* **API Gateway**: Apollo Server (Federation)

    Агрегирует схемы всех микросервисов и маршрутизирует запросы.
* **Users Service**: Node.js, PostgreSQL

    Управление пользователями (создание, просмотр, обновление, удаление).
* **Products Service**: Node.js, PostgreSQL

    Управление товарами (создание, просмотр, обновление, удаление).


* **Orders Service**: Node.js, MongoDB

    Создание и управление заказами. Каждый заказ связан с пользователем и товаром. Возможны действия: создание, обновление, удаление и просмотр заказов.

Схема:

[Frontend] → [GraphQL Gateway] → [Users | Products | Orders Services] → [PostgreSQL / MongoDB]

## Функциональность

* CRUD-операции для юзеров, товаров и заказов
* UI с формами и таблицами для взаимодействия с системой
* Проект контейнеризирован с использованием Docker

## Запуск

1. Клонировать репозиторий:

   ```bash
   git clone https://github.com/GlafiraSmiirnova/graphql-microservices-lab.git
   cd graphql-microservices-lab
   ```

2. Убедиться, что установлены:

   * Docker + Docker Compose
   * Node.js (ESM, >= 18)

3. Запустить:

   ```bash
   docker compose up --build -d
   ```

   или (при наличии GNU Make)

   ```bash
   make up
   ```

   Удобные команды для запуска/остановки/логирования контейнеров перечислены в ```Makefile```

   При возникновении проблем с запуском gateway (```docker compose logs -f gateway```) перезапустить только этот контейнер:

   ```bash
   docker compose restart gateway
   ```

4. Открыть:

   * Frontend: [http://localhost:5173](http://localhost:5173)
   * Gateway Playground: [http://localhost:4000/graphql](http://localhost:4000/graphql)

## GraphQL Пример

```graphql
query {
  orders {
    id
    status
    quantity
    user {
      name
    }
    product {
      name
    }
  }
}
```

## .env примеры

```env
# gateway/.env
USERS_SERVICE_URL=http://users-service:4001/graphql
PRODUCTS_SERVICE_URL=http://products-service:4002/graphql
ORDERS_SERVICE_URL=http://orders-service:4003/graphql

# users-service/.env
POSTGRES_HOST=postgres-users
POSTGRES_DB=usersdb
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
PORT=4001

# products-service/.env
POSTGRES_HOST=postgres-products
POSTGRES_DB=productsdb
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
PORT=4002

# orders-service/.env
MONGODB_URI=mongodb://mongodb-orders:27017/ordersdb
PORT=4003
```

## Видео

Демо-ролик с работой системы: \[ссылка]