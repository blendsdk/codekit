import { PostgreSQLDatabase } from "@blendsdk/schemakit";

const db = new PostgreSQLDatabase();

const table1 = db.addTable("table1");
const table2 = db.addTable("table2");

table1
    .primaryKeyColumn("id")
    .stringColumn("column1")
    .numberColumn("column2")
    .booleanColumn("column3")
    .dateTimeColumn("column4")
    .decimalColumn("column5")
    .guidColumn("column6");

table2
    .primaryKeyColumn("id")
    .stringColumn("column1")
    .numberColumn("column2");

export { db };
