const knex = require("../db/connection")
const tableName = "tables";

// rtn knex query selecting all table. order them by table_name
function list() {
  return knex(tableName)
    .orderBy("table_name")
}

// knex query table and inserts all newTable data, then applies it to beginning of tables arr?
function create(newTable) {
  return knex(tableName)
    .insert(newTable, "*")
    .then((createdTable) => createdTable[0])
}

function read(table_id) {
  return knex(tableName)
    .where({ table_id })
    .first()
}
function update(updatedTable) {
  return knex(tableName)
    .update(updatedTable)
    .where({ table_id: updatedTable.table_id })
    .returning("*");
}

function resetTable(tableId) {
  return knex("tables")
    .where({ table_id: tableId })
    .update({ reservation_id: null, occupied: false })
    .returning("*");
}

module.exports = {
  list,
  create,
  read,
  update,
  resetTable,
}
