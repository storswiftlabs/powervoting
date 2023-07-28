## How to Deploy

### 1. Deploy Contract
Please follow Aleo offical guide to deploy the contract: https://developer.aleo.org/testnet/getting_started/deploy_execute


### 2. Deploy Backend Tools
Backend tools are used to store some strings which are not able to be stored in Aleo, the codes are in backend folder. Please follow the following guides to deploy them.

1. create database

```sql
create database powervoting;
```

1. create table

```sql
CREATE TABLE `tbl_text` (
  `id` int NOT NULL AUTO_INCREMENT,
  `text` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

1. Modify database related configurations in the code

backend/powervoting/main.go 21 lines

```sql
DSN:fmt.Sprintf("%s:%s@tcp(%s)/powervoting?charset=utf8&parseTime=True&loc=Local", "【username】", "【password】", "【host】"),
```

## Service startup

`cd backend/powervoting`

1. install module

```sql
go mod tidy
```

1. Start

```bash
# start
go run main.go

# Background startup
nohup go run main.go &
```

show `[GIN-debug] Listening and serving HTTP on :9999`means start success


### 3. Deploy Frandend Codes
1, Please firstly change programID in index.js to the acture program id which is deployed by step 1.
2, Please use [fleek](https://fleek.co/) to deploy the front end codes, here is the guide: https://docs.fleek.co/