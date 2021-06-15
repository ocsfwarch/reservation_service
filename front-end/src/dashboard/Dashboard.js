import React, { useEffect, useState } from "react";
import { listReservations, listTables, updateReservationStatus } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { previous, today, next } from "../utils/date-time";
import { useHistory } from "react-router-dom";
import TableCard from "./TableCard";
import ReservationCard from "./ReservationCard";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState([]);
	const [tablesError, setTablesError] = useState([]);
  const [tables, setTables] = useState([]);
  
  const history = useHistory();

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError([]);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(err => setReservationsError([ err ]))

    listTables(abortController.signal)
      .then(setTables)
      .catch(err => setTablesError([ err ]))
    return () => abortController.abort();
  }

  function onCancel(reservation_id) {
    const abortController = new AbortController();
    updateReservationStatus(reservation_id, "cancelled", abortController.signal)
      .then(loadDashboard)
      .catch(setReservationsError)
    return () => abortController.abort()
  }

  const filteredReservations = reservations.filter((reservation) => {
    return reservation.status === "booked" || reservation.status === "seated";
  })

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <ErrorAlert error={reservationsError} />

      <button type="button" className="btn btn-outline-primary mr-1" onClick={() => history.push(`/dashboard?date=${previous(date)}`)}>Back</button>
      <button type="button" className="btn btn-primary mr-1" onClick={() => history.push(`/dashboard?date=${today()}`)}>Today</button>
      <button type="button" className="btn btn-outline-primary mr-1" onClick={() => history.push(`/dashboard?date=${next(date)}`)}>Next</button>

      <div>
        <br></br>
      <h4>Reservations</h4>
      <div className="card-body">
        {filteredReservations.map((reservation) => {
          return <ReservationCard key={reservation.reservation_id} reservation={reservation} setReservationsError={setReservationsError} loadDashboard={loadDashboard} onCancel={onCancel} />
        })}
      </div>
      <h4 className="mb-0">Tables</h4>
      <div className="card-body col-sm-8">
        {tables.map((table) => {
          return <TableCard key={table.table_id} table={table} loadDashboard={loadDashboard} />
        })}
      </div>
      </div>
    </main>
  );
}

export default Dashboard;
