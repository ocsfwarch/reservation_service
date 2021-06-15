/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the request.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

//// RESERVATION UTILS ////

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );

  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

export function formatPhoneNumber(value) {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 5) return phoneNumber;
  if (phoneNumberLength < 8) {
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`
  }
  return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(
    3,
    6
  )}-${phoneNumber.slice(6, 10)}`
}

export async function createReservation(reservation, signal) {
  const url = `${API_BASE_URL}/reservations`;
  reservation.people = Number(reservation.people);
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: reservation }),
  };
  return await fetchJson(url, options)
    .then(formatReservationDate)
    .then(formatReservationTime);
}

export async function readReservation(id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${id}`);
  return await fetchJson(url, { headers, signal }, []);
}



export async function editReservation(reservation, reservation_id, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation_id}`;
  reservation.people = +reservation.people;
  const data = { data: reservation };

  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify(data)
  };
  return await fetchJson(url, options);
}

export async function deleteReservation(reservation_id, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation_id}/status`;
  const data = { data: { status: "cancelled" } };
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  };
  return await fetchJson(url, options);
}

export async function updateReservationStatus(reservation_id, status, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation_id}/status`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { status } }),
  };
  return await fetchJson(url, options);
}


//// TABLES UTIL //// 

export async function listTables(signal) {
  const url = `${API_BASE_URL}/tables`;

  return await fetchJson(url, { headers, signal }, [])
}

export async function createTable(table, signal) {
  const url = `${API_BASE_URL}/tables`;
  const data = { data: table };
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  };
  return await fetchJson(url, options, table);
}

export async function assignReservationToTable(
  { reservation_id, table_id }) {
  const url = new URL(`${API_BASE_URL}/tables/${table_id}/seat`);
  const data = { data: { reservation_id: reservation_id } };
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  };
  return await fetchJson(url, options);
}

export async function deleteTable(tableId, signal) {
  const url = `${API_BASE_URL}/tables/${tableId}/seat`;
  const options = { method: "DELETE", signal };
  return await fetchJson(url, options);
}

///////// SEARCH UTIL
export async function mobileSearch(mobile_number, signal) {
  const url = new URL(
    `${API_BASE_URL}/reservations?mobile_number=${mobile_number}`
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}
