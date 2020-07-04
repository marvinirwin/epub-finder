import mysql, {Connection} from "mysql2/promise";

export function getConnection() {
    return mysql.createConnection({
        host: "localhost",
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_USER
    });
}
export async function query<T>(
    conn: Connection | Promise<Connection>,
    sql: string, values: any | any[] | { [param: string]: any }): Promise<T[]> {
    const [rows,] = await (await conn).execute(sql, values);
    return rows as T[];
}