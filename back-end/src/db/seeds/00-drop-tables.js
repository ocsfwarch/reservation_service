// delete entries
module.exports.seed = function (knex) {
    return knex("tables").del();
}