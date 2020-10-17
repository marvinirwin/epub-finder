import DatabaseConfig from "../src/config/database.config"
import {MysqlConnectionOptions} from "typeorm/driver/mysql/MysqlConnectionOptions";
import {createConnection} from "typeorm";
export default createConnection(DatabaseConfig as MysqlConnectionOptions).catch(e => { throw e;
});