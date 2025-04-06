import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();

    const dataBaseVersionResult = await database.query("SHOW server_version;");
    const dataBaseVersion = dataBaseVersionResult.rows[0].server_version;

    const dataBaseMaxConnectionsResult = await database.query(
      "SHOW max_connections;",
    );
    const dataBaseMaxConnectionsValue =
      dataBaseMaxConnectionsResult.rows[0].max_connections;

    const databaseName = process.env.POSTGRES_DB;
    const dataBaseOpenedConnectionsResult = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });
    const dataBaseOpenedConnectionsValue =
      dataBaseOpenedConnectionsResult.rows[0].count;

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: dataBaseVersion,
          max_connections: parseInt(dataBaseMaxConnectionsValue),
          opened_connections: dataBaseOpenedConnectionsValue,
        },
      },
    });
  } catch (error) {
    console.log("\n Erro dentro do catch do controler");
    const publicErrorObject = new InternalServerError({
      cause: error,
    });
    console.log(publicErrorObject);
    response.status(500).json(publicErrorObject);
  }
}

export default status;
