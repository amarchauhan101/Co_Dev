import React, { useState } from "react";

function Task() {
  const [title, settitle] = useState("");
  const [description, setdescription] = useState("");
  const [dueDate, setdueDate] = useState("");
  const [status, setstatus] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  

  return (
    <div>
      <form>
        <label>Title:</label>
        <br />
        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => settitle(e.target.value)}
          placeholder="write title"
        />
        <label>Description:</label>
        <br />
        <input
          type="text"
          name="description"
          value={description}
          onChange={(e) => setdescription(e.target.value)}
          placeholder="write description"
        />
        <label>DueDate:</label>
        <br />
        <input
          type="date"
          name="date"
          value={dueDate}
          onChange={(e) => setdueDate(e.target.value)}
        />
        <select
          name="status"
          value={status}
          onChange={(e) => setstatus(e.target.value)}
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

      </form>
    </div>
  );
}

export default Task;
