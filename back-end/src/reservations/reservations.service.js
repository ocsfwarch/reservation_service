
const knex = require("../db/connection")
const tableName = "reservations"

function list(reservation_date) {
  return knex(tableName)
    .where({ reservation_date })
    .whereNot({ status: "finished" })
    .orderBy("reservation_time", "asc");
}

function search(mobile_number) {
  return knex("reservations")
    .select("*")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

function create(newRestaurant) {
  return knex(tableName)
    .insert(newRestaurant, "*")
    .then((createdRestaurant) => createdRestaurant[0]);
}

function read(reservation_id) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: reservation_id })
    .first();
}

async function update(reservation_id, status) {
  return knex("reservations")
    .update({ status: status })
    .where({ reservation_id: reservation_id })
    .returning("*");
}

async function edit(editedReservation, reservation_id) {
  return knex(tableName)
    .update(editedReservation)
    .where({ reservation_id: reservation_id })
    .returning("*");
}



module.exports = {
  list,
  search,
  create,
  read,
  update,
  edit
}