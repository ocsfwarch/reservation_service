import React, { useState } from "react";
import { createTable } from "../utils/api"
import { useHistory } from "react-router-dom";
import { today } from "../utils/date-time"
import ErrorAlert from "../layout/ErrorAlert"

export default function NewTable() {
	const history = useHistory();
	const [tablesError, setTablesError] = useState([]);

	const [table, setTable] = useState({
		table_name: "",
		capacity: "1",
	});

	function handleChange({ target: { name, value } }) {
		setTable((previousTable) => ({ ...previousTable, [name]: value }));
	}

	function handleNumberChange({ target: { name, value } }) {
		setTable((previousTable) => ({ ...previousTable, [name]: Number(value) }));
	}

	function handleSubmit(event) {
		const errors = [];
		event.preventDefault();
		event.stopPropagation();
		setTablesError([]);
		if (table.capacity < 1) {
			errors.push(new Error("Table must have at least one person."))
		}
		if (table.table_name.length > 2) {
			createTable(table)
				.then(() => {
					history.push(`/dashboard?date=${today()}`)
				})
		} else {
			errors.push(new Error("Table name must be two or more characters."))
		}
		if (errors.length > 0) {
			setTablesError(errors)
		}
	}
	


	return (
		<>
			<ErrorAlert error={tablesError} />
			<form>
				<label htmlFor="table_name">Table Name:&nbsp;</label>
				<input
					name="table_name"
					id="table_name"
					type="text"
					minLength={2}
					onChange={handleChange}
					value={table.table_name}
					required={true}
				/>

				<label htmlFor="capacity">Capacity:&nbsp;</label>
				<input
					name="capacity"
					id="capacity"
					type="number"
					min={1}
					onChange={handleNumberChange}
					value={table.capacity}
					required={true}
				/>

				<button type="submit" className="btn btn-primary mr-1" onClick={handleSubmit}>Submit</button>
				<button type="button" className="btn btn-outline-primary mr-1" onClick={history.goBack}>Cancel</button>
			</form>
		</>
	);
}