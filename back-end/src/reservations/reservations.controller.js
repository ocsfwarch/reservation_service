const service = require("./reservations.service");
const reservationsService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const { mobile_number } = req.query;
  if (mobile_number) {
    const reservation = await reservationsService
      .search(mobile_number);
    res.json({
      data:
        [...reservation]
    })
  } else {
    const { date } = req.query;
    const data = await service.list(date)
    res.json({ data });
  }
}

async function create(req, res) {
  const newRestaurant = ({
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = req.body.data);
  const createdRestaurant = await service.create(newRestaurant);
  res.status(201).json({ data: createdRestaurant });
}

async function read(req, res) {
  const { reservation } = res.locals;
  res.json({ data: reservation })
}

async function validateReservation(req, res, next) {
  // validate data
  if (!req.body.data) {
    return next({
      status: 400,
      message: "Must include data!",
    });
  }

  // validate first name
  if (!req.body.data.first_name || req.body.data.first_name.length === 0) {
    return next({
      status: 400,
      message: "Must include valid first_name!",
    });
  }

  // validate last name
  if (!req.body.data.last_name || req.body.data.last_name.length === 0) {
    return next({
      status: 400,
      message: "Must include valid last_name!",
    });
  }

  // validate mobile number
  if (
    !req.body.data.mobile_number ||
    req.body.data.mobile_number.length === 0
  ) {
    return next({
      status: 400,
      message: "Must include valid mobile_number!",
    });
  }

  // validate reservation date
  if (
    !req.body.data.reservation_date ||
    !req.body.data.reservation_date.match(/\d{4}\-\d{2}\-\d{2}/g)
  ) {
    return next({
      status: 400,
      message: "Must include valid reservation_date!",
    });
  }

  if (new Date(req.body.data.reservation_date) < new Date()) {
    return next({
      status: 400,
      message: "Date must be in the future"
    });
  }

  // validate reservation time
  if (
    !req.body.data.reservation_time ||
    !req.body.data.reservation_time.match(/[0-9]{2}:[0-9]{2}/g)
  ) {
    return next({
      status: 400,
      message: "Must include valid reservation_time!",
    });
  }

  // validate people
  if (
    !req.body.data.people ||
    typeof req.body.data.people !== "number" ||
    req.body.data.people === 0
  ) {
    return next({
      status: 400,
      message: "Must include valid people!",
    });
  }

  // validate that reservation date is in the future
  const date = new Date(req.body.data.reservation_date);
  if (new Date(req.body.data.reservation_date).valueOf() < date.valueOf()) {
    return next({
      status: 400,
      message:
        "The reservation_date is in the past. Only future reservations are allowed!",
    });
  }

  // validate that reservation date does not land on a Tuesday
  if (date.getDay() === 1) {
    return next({
      status: 400,
      message: "Invalid reservation_date: restaurant closed on Tuesdays!",
    });
  }

  // validate if reservation time is within operating hours
  const replacedTime = req.body.data.reservation_time.replace(":", "");
  if (replacedTime < 1030 || replacedTime > 2130) {
    return next({
      status: 400,
      message: "The reservation_time is after store operating hours!",
    });
  }

  if (
    !req.body.data.reservation_time.match(/[0-9]{2}:[0-9]{2}/g)
  ) {
    return next({
      status: 400,
      message: "Must include valid reservation_time!",
    });
  }

  if (req.body.data.status === "seated") {

    return next({
      status: 400,
      message: "Reservation is already seated!",
    });
  }
  if (req.body.data.status === "finished") {
    return next({
      status: 400,
      message: "Reservation is already finished!",
    });
  }
  return next();
}

const validFields = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

function notNull(obj) {
  for (let key in obj) {
    if (!obj[key]) return false;
  }
  return true;
}

function hasValidFields(req, res, next) {
  const { data = {} } = req.body;
  const dataFields = Object.getOwnPropertyNames(data);
  validFields.forEach((field) => {
    if (!dataFields.includes(field)) {
      return next({
        status: 400,
        message: `The ${field} is missing`,
      });
    }
  });

  if (!notNull(data)) {
    return next({
      status: 400,
      message:
        "Invalid data format provided. Requires {string: [first_name, last_name, mobile_number], date: reservation_date, time: reservation_time, number: people}",
    });
  }

  if (!data.first_name || data.first_name.length === 0) {
    return next({
      status: 400,
      message: "Must include valid first_name!",
    });
  }

  if (!data.last_name || data.last_name.length === 0) {
    return next({
      status: 400,
      message: "Must include valid last_name!",
    });
  }

  if (
    !data.mobile_number
  ) {
    return next({
      status: 400,
      message: "Must include valid mobile_number!",
    });
  }

  const reserveDate = new Date(
    data.reservation_date
  );

  const todaysDate = new Date();

  if (typeof data.people !== "number") {
    return next({
      status: 400,
      message: "Needs to be a number, people.",
    });
  }

  if (!/\d{4}-\d{2}-\d{2}/.test(data.reservation_date)) {
    return next({
      status: 400,
      message: "reservation_date is not a date.",
    })
  }
  if (reserveDate.getDay() === 1) {
    return next({
      status: 400,
      message:
        "Reservations cannot be made on a Tuesday, the restaurant is closed.",
    });
  }
  if (reserveDate < todaysDate) {
    return next({
      status: 400,
      message: "Reservations must be made for a future date.",
    })
  }
  if (!/[0-9]{2}:[0-9]{2}/.test(data.reservation_time)) {
    return next({
      status: 400,
      message: "reservation_time is not a time.",
    });
  }
  if (data.reservation_time < "10:30" || data.reservation_time > "21:30") {
    return next({
      status: 400,
      message: "Reservations cannot be made before 10:30am or after 9:30pm."
    });
  }

  if (data.status === "seated" || data.status === "finished") {
    return next({
      status: 400,
      message: `invalid status: ${data.status}`
    });
  }
  next();
}

async function reservationExists(req, res, next) {
  const reservationId = req.params.reservation_id;
  const reservation = await service.read(req.params.reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    next();
  } else {
    next({
      status: 404,
      message: `Reservation id ${reservationId} is non-existent`
    });
  }
}


async function updateReservationStatus(req, res) {
  const { reservation } = res.locals;
  reservationsService
    .update(parseInt(reservation.reservation_id), req.body.data.status)
    .then((data) => res.status(200).json({ data: data[0] }));
}

async function validateReservationStatus(req, res, next) {
  const foundReservation = await reservationsService.read(
    parseInt(req.params.reservation_id)
  );
  if (!foundReservation) {
    return next({
      status: 404,
      message: `This ${req.params.reservation_id} is non-existent!`,
    });
  }
  if (foundReservation.status === "finished") {
    return next({
      status: 400,
      message: "Reservation is already finished!",
    });
  }
  if (
    req.body.data.status === "booked" ||
    req.body.data.status === "seated" ||
    req.body.data.status === "cancelled" ||
    req.body.data.status === "finished"
  ) {
    res.locals.reservation = foundReservation;
    return next();
  } else {
    return next({
      status: 400,
      message: "This reservation_status is unknown!",
    });
  }
}

async function edit(req, res, next) {
  const { reservation_id } = res.locals.reservation;
  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = req.body.data;

  const reservation = {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  };

  reservationsService
    .edit(reservation, parseInt(reservation_id))
    .then((data) => res.status(200).json({ data: data[0] }));
}


module.exports = {
  list: asyncErrorBoundary(list),
  create: [hasValidFields, asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(reservationExists), read],
  edit: [
    asyncErrorBoundary(validateReservation),
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(edit),
  ],
  update: [
    asyncErrorBoundary(validateReservationStatus),
    asyncErrorBoundary(updateReservationStatus),
  ],
};





