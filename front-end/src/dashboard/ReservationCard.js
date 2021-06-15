import React from "react";

const ReservationCard = ({ reservation, onCancel }) => {
  const handleCancel = () => {
    if (window.confirm("Do you want to cancel this reservation? This cannot be undone.")) {
      onCancel(reservation.reservation_id)
    }
  }

  return (
    <>
      <ul className="list-group-item list-inline" >
        <h6>
          Reservation for: {`${reservation.first_name} ${reservation.last_name}`}{" "}
        </h6>
        <li>Mobile Number: {reservation.mobile_number}</li>
        <li>Time: {reservation.reservation_date}</li>
        <li>Reservation Time: {reservation.reservation_time}</li>
        <li>People: {reservation.people}</li>
        <li data-reservation-id-status={reservation.reservation_id}>{reservation.status}</li>
        {reservation.status === "booked" ? (
          <a href={`/reservations/${reservation.reservation_id}/seat`} className="btn btn-outline-primary mr-2">Seat</a>) : null
        }
        {reservation.status !== "seated" ? (
          <a href={`/reservations/${reservation.reservation_id}/edit`} className="btn btn-primary mr-2">Edit</a>
        ) : null
        }
        <button className="btn btn-outline-primary mr-2" data-reservation-id-cancel={reservation.reservation_id} onClick={handleCancel}>Cancel</button>
      </ul>
    </ >
  );
};

export default ReservationCard;




