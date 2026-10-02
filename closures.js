function resourcename(resourceid) {
  const resource = getResources().filter(function (r) {
    return r.id === resourceid;
  })[0];
  return resource ? resource.name : "Unknown resource";
}

function bookingstatusbadgeclass(status) {
  if (status === "approved") {
    return "badgesuccess";
  }
  if (status === "pending") {
    return "badgewarning";
  }
  if (status === "cancelled") {
    return "badgemuted";
  }
  return "badgedanger";
}

function bookingstatuslabel(status) {
  if (status === "approved") {
    return "Approved";
  }
  if (status === "pending") {
    return "Pending";
  }
  if (status === "cancelled") {
    return "Cancelled";
  }
  return "Rejected";
}

function setresourcestatus(resourceid, status) {
  const resources = getResources();
  const resource = resources.filter(function (r) {
    return r.id === resourceid;
  })[0];
  if (!resource) {
    return;
  }
  resource.status = status;
  saveResources(resources);
}

function findaffectedbookingids(resourceid, startdate, enddate) {
  return getBookings()
    .filter(function (b) {
      return (
        b.resourceId === resourceid &&
        (b.status === "approved" || b.status === "pending") &&
        b.date >= startdate &&
        b.date <= enddate
      );
    })
    .map(function (b) {
      return b.id;
    });
}

function populateclosureresourceoptions() {
  const select = document.getElementById("resourceselect");

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a resource…";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  getResources().forEach(function (r) {
    const option = document.createElement("option");
    option.value = r.id;
    option.textContent = r.name;
    select.appendChild(option);
  });
}

function showclosuremessage(text, iswarning) {
  const box = document.getElementById("confirmmessage");
  const cssclass = iswarning ? "errormessage" : "confirmmessage";
  box.innerHTML = '<div class="' + cssclass + '">' + text + "</div>";
}

function handleclosuresubmit(event) {
  event.preventDefault();

  const resourceid = document.getElementById("resourceselect").value;
  const reason = document.getElementById("reasoninput").value.trim();
  const startdate = document.getElementById("startdateinput").value;
  const enddate = document.getElementById("enddateinput").value;

  if (!resourceid || !reason || !startdate || !enddate) {
    showclosuremessage("Please fill in every field before submitting.", true);
    return;
  }

  if (enddate < startdate) {
    showclosuremessage("End date must be on or after the start date.", true);
    return;
  }

  const affectedbookingids = findaffectedbookingids(resourceid, startdate, enddate);

  const closure = {
    id: "c" + Date.now(),
    resourceId: resourceid,
    startDate: startdate,
    endDate: enddate,
    reason: reason,
    affectedBookingIds: affectedbookingids,
    createdAt: new Date().toISOString()
  };

  const closures = getClosures();
  closures.push(closure);
  saveClosures(closures);

  setresourcestatus(resourceid, "closed");
  addAuditEntry("Council Staff", "closure_created", "Scheduled closure of " + resourcename(resourceid) + " (" + reason + ")");

  const message =
    affectedbookingids.length > 0
      ? "Closure scheduled. " + affectedbookingids.length + " existing booking(s) fall within this closure and may need to be cancelled below."
      : "Closure scheduled. No existing bookings are affected.";
  showclosuremessage(message, affectedbookingids.length > 0);

  document.getElementById("closureform").reset();
  populateclosureresourceoptions();
  renderallclosureviews();
}
