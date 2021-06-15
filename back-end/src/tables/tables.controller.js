const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const tablesService = require("./tables.service");
const reservationsService = require("../reservations/reservations.service")

// await data from list service. respond w json obj of data
async function list(req, res) {
    const data = await tablesService.list();
    res.json({ data })
}

// respond w status 201 and json obj awaiting the create service's return 
async function create(req, res) {
    res.status(201).json({ data: await tablesService.create(req.body.data) })
}

async function update(req, res) {
    const { table } = res.locals;
    const { reservation_id } = req.body.data;
    const updatedTable = {
        ...table,
        occupied: true,
        reservation_id,
    };
    reservationsService
        .update(parseInt(reservation_id), "seated");

    tablesService
        .update(updatedTable)
        .then((data) => res.status(200).json({ data: data[0] }));
}

async function validateData(req, res, next) {
    const { data } = req.body
    if (!data) {
        next({
            status: 400,
            message: "data is missing"
        })
    }
    res.locals.data = data;
    return next()
}

// validate table data. does table name exists? is it less than 2 chars? does capacity exists? is it not a number? if no errors, run next
async function validateCreateTableData(req, res, next) {
    const { data } = req.body
    if (!data.table_name) {
        next({
            status: 400,
            message: "table_name is missing or empty"
        })
    }
    if (data.table_name.length < 2) {
        next({
            status: 400,
            message: "table_name is too short"
        })
    }
    if (!data.capacity) {
        next({
            status: 400,
            message: "capacity is missing or zero"
        })
    }
    if (typeof data.capacity !== "number") {
        next({
            stats: 400,
            message: "Capacity is not a number"
        })
    }
    return next()
}

async function tableExists(req, res, next) {
    const tableId = req.params.table_id
    const foundTable = await tablesService.read(tableId)
    if (!foundTable) {
        next({
            status: 404,
            message: `table ${tableId} not found`
        })
    } else {
        res.locals.table = foundTable

        return next()
    }
}

async function reassignTable(req, res, next) {
    const { table_id } = req.params;
    const { table } = res.locals;

    if (!table.reservation_id) {
        next({
            status: 400,
            message: `${table_id} is not occupied.`,
        });
    }

    reservationsService.update(table.reservation_id, "finished");

    const data = await tablesService.resetTable(table_id);
    res.status(200).json({ data: data[0] });
}

async function reservationExists(req, res, next) {
    const { reservation_id } = res.locals.data;
    if (!reservation_id) {
        return next({
            status: 400,
            message: "reservation_id is missing",
        });
    }

    const reservation = await reservationsService.read(reservation_id);

    if (!reservation) {
        return next({
            status: 404,
            message: `Reservation with ID ${reservation_id} does not exist.`,
        });
    }

    if (reservation.status === "seated") {
        return next({
            status: 400,
            message: `Reservation is already seated.`
        });
    }

    res.locals.reservation = reservation;
    return next();
}

async function validateReservationData(req, res, next) {
    let table = res.locals.table;

    const { data } = req.body
    if (!data) {
        next({
            status: 400,
            message: "data is missing"
        })
    }

    if (!data.reservation_id) {
        next({
            status: 400,
            message: "reservation_id is missing"
        })
    }

    const reservation = await reservationsService.read(data.reservation_id)
    if (!reservation) {
        next({
            status: 404,
            message: `reservation with id ${data.reservation_id} does not exists`
        })
    }
    // table is occupied
    if (table.reservation_id) {
        next({
            status: 400,
            message: "table is occupied"
        })
    }
    // more people than capacity for table
    if (reservation.people > table.capacity) {
        next({
            status: 400,
            message: "table does not have sufficient capacity"
        })
    }
    next();
}

module.exports = {
    list:
        [
            asyncErrorBoundary(list)
        ],
    create:
        [
            asyncErrorBoundary(validateData),
            asyncErrorBoundary(validateCreateTableData),
            asyncErrorBoundary(create)
        ],
    update:
        [
            asyncErrorBoundary(validateData),
            asyncErrorBoundary(reservationExists),
            asyncErrorBoundary(tableExists),
            asyncErrorBoundary(validateReservationData),
            asyncErrorBoundary(update),
        ],
    reassignTable: [asyncErrorBoundary(tableExists),
    asyncErrorBoundary(reassignTable)],
}