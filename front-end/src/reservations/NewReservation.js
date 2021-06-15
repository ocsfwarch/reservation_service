import React, { useState, useEffect } from "react";
import { createReservation, formatPhoneNumber, readReservation, editReservation } from "../utils/api";
import { useHistory, useParams } from "react-router";
import ErrorAlert from "../layout/ErrorAlert";

export default function NewReservation() {
  const [errors, setErrors] = useState([]);
  const history = useHistory();

  const [formFields, setFormFields] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 0,
  });
  const { reservation_id } = useParams();

  useEffect(() => {
    const abortController = new AbortController();
    if (reservation_id) {
      readReservation(reservation_id, abortController.signal)
        .then((reservation) => {
          setFormFields({
            ...reservation,
            reservation_date: new Date(reservation.reservation_date)
              .toISOString()
              .substr(0, 10),
          })
        })
        .catch(setErrors)
    }
    return () => abortController.abort()

  }, [reservation_id]);

  const phoneNumberFormatter = ({ target }) => {
    const formattedInputValue = formatPhoneNumber(target.value);
    setFormFields({
      ...formFields,
      mobile_number: formattedInputValue.replace(/[^\d]/g, "")
    });
  };

  // make errors list
  const validateDate = () => {
    const errorsArr = [];
    const today = new Date();
    const reservationDate = new Date(formFields.reservation_date);
    const reservationTime = formFields.reservation_time;
    //1 equals tuesday, push err to errorsArr
    if (reservationDate.getDay() === 1) {
      errorsArr.push({
        message: "We are closed on Tuesdays, hope to see you soon!",
      });
    }
    if (reservationDate < today) {
      errorsArr.push({
        message:
          "Reservations cannot be made in the past, pick today's date or a future date.",
      });
    }
    if (reservationTime.localeCompare("10:30") === -1) {
      errorsArr.push({ message: "We are closed before 10:30AM" });
    } else if (reservationTime.localeCompare("21:30") === 1) {
      errorsArr.push({ message: "We are closed after 9:30PM" });
    } else if (reservationTime.localeCompare("21:00") === 1) {
      errorsArr.push({
        message:
          "You must book at least 30 minutes before the restaurant closes",
      });
    }
    // set state defined above
    setErrors(errorsArr);
    if (errorsArr.length > 0) {
      return false;
    }
    return true;
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors([]);
    const foundErrors = validateDate();
    if (!foundErrors.length) {
      if (reservation_id) {
        await editReservation(formFields, reservation_id)
        history.push(`/dashboard?date=${formFields.reservation_date}`)
      }
      else {
        await createReservation(formFields);
        history.push(`/dashboard?date=${formFields.reservation_date}`);
      }
    } else {
      const errorMessage = { message: `${foundErrors.join(",").trim()}` }
      setErrors(errorMessage)
    }
  }


  return (
    <>
      <form onSubmit={handleSubmit}>
        {errors.length > 0 && <ErrorAlert error={errors} />}
        <div className="form-group">
          <label htmlFor="first_name">First Name:&nbsp;</label>
          <input
            required
            name="first_name"
            type="text"
            placeholder="First Name"
            className="form-control"
            id="first_name"
            value={formFields.first_name}
            onChange={(event) =>
              setFormFields({
                ...formFields,
                first_name: event.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last Name:&nbsp;</label>
          <input
            required
            name="last_name"
            type="text"
            placeholder="last_name"
            className="form-control"
            id="last_name"
            value={formFields.last_name}
            onChange={(event) =>
              setFormFields({
                ...formFields,
                last_name: event.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="mobile_number">Mobile Number:&nbsp;</label>
          <input
            required
            type="tel"
            name="mobile_number"
            placeholder="Mobile Number"
            className="form-control"
            id="mobile_number"
            value={formFields.mobile_number}
            onChange={phoneNumberFormatter}
          />
        </div>
        <div className="form-group">
          <label htmlFor="reservation_date">Date of Reservation:&nbsp;</label>
          <input
            required
            type="date"
            name="reservation_date"
            placeholder="Date of Reservation"
            className="form-control"
            id="reservation_date"
            value={formFields.reservation_date}
            onChange={(event) =>
              setFormFields({
                ...formFields,
                reservation_date: event.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="reservation_time">Time of Reservation:&nbsp;</label>
          <input
            required
            type="time"
            name="reservation_time"
            placeholder="Date of Reservation"
            className="form-control"
            id="reservation_time"
            value={formFields.reservation_time}
            onChange={(event) =>
              setFormFields({
                ...formFields,
                reservation_time: event.target.value,
              })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="people">Number In Party:&nbsp;</label>
          <input
            required
            type="number"
            name="people"
            placeholder="Number in Party"
            className="form-control"
            id="people"
            min="1"
            value={formFields.people}
            onChange={(event) =>
              setFormFields({
                ...formFields,
                people: event.target.value,
              })
            }
          />
        </div>
        <div>
          <button
            type="submit"
            className="btn btn-primary mx-2"
          >
            Submit
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => history.goBack()}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}