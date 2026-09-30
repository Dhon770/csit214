function resourcename(resourceid) {
  const resource = getResources().filter(function (r) {
    return r.id === resourceid;
  })[0];
  return resource ? resource.name : "Unknown resource";
}

function overlaps(a, b) {
  return a.resourceId === b.resourceId && a.date === b.date && a.startTime < b.endTime && b.startTime < a.endTime;
}

function hasconflict(booking, allbookings) {
  return allbookings.some(function (other) {
    if (other.id === booking.id) {
      return false;
    }
    if (other.status !== "approved" && other.status !== "pending") {
      return false;
    }
    return overlaps(booking, other);
  });
}

function getqueryresourceid() {
  const params = new URLSearchParams(window.location.search);
  return params.get("resource");
}

function populateresourceoptions() {
  const select = document.getElementById("resourceselect");
  const resources = getResources().filter(function (r) {
    return r.status === "available";
  });
  const preselect = getqueryresourceid();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a resource…";
  placeholder.disabled = true;
  placeholder.selected = !preselect;
  select.appendChild(placeholder);

  resources.forEach(function (r) {
    const option = document.createElement("option");
    option.value = r.id;
    option.textContent = r.name;
    if (r.id === preselect) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

function showconfirmmessage(text, iswarning) {
  const box = document.getElementById("confirmmessage");
  const cssclass = iswarning ? "errormessage" : "confirmmessage";
  box.innerHTML = '<div class="' + cssclass + '">' + text + "</div>";
}

function handlebookingsubmit(event) {
  event.preventDefault();

  const resourceid = document.getElementById("resourceselect").value;
  const date = document.getElementById("dateinput").value;
  const starttime = document.getElementById("starttimeinput").value;
  const endtime = document.getElementById("endtimeinput").value;
  const requestedby = document.getElementById("requestedbyinput").value.trim();
  const purpose = document.getElementById("purposeinput").value.trim();

  if (!resourceid || !date || !starttime || !endtime || !requestedby || !purpose) {
    showconfirmmessage("Please fill in every field before submitting.", true);
    return;
  }

  if (endtime <= starttime) {
    showconfirmmessage("End time must be after start time.", true);
    return;
  }

  const booking = {
    id: "b" + Date.now(),
    resourceId: resourceid,
    requestedBy: requestedby,
    date: date,
    startTime: starttime,
    endTime: endtime,
    purpose: purpose,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
  addAuditEntry(requestedby, "booking_requested", "Requested booking of " + resourcename(resourceid) + " on " + date);

  const conflict = hasconflict(booking, bookings);
  if (conflict) {
    showconfirmmessage(
      "Booking request submitted as pending. Note: this time overlaps with another booking for the same resource, so it may need staff review.",
      true
    );
  } else {
    showconfirmmessage("Booking request submitted and is pending approval.", false);
  }

  document.getElementById("bookingform").reset();
  populateresourceoptions();
  renderallviews();
}
