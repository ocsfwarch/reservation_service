import React from "react";
import { useHistory } from "react-router";
import { deleteTable } from "../utils/api";

const TableCard = ({ table, loadDashboard }) => {

  const finishTable = async (e) => {
    e.preventDefault();
    if (
      window.confirm(
        "Is this table ready to seat new guests? \n\n This cannot be undone."
      )
    ) {
      const returnedTable = await deleteTable(table.table_id);

      if (returnedTable) { loadDashboard() };
    }
  };

  return (
    <ul className="list-group-item">
      <li>Name: {table.table_name}</li>
      <li>Capacity: {table.capacity}</li>
      <li data-table-id-status={table.table_id}>
        Status: {table.reservation_id ? "occupied" : "free"}
      </li>

      {table.reservation_id ? (
        <button
        className="btn btn-secondary mr-1"
          data-table-id-finish={table.table_id}
          onClick={finishTable}
        >
          Finish
        </button>
      ) : null}
    </ul>
  );
};

export default TableCard;



