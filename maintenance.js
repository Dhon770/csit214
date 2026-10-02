const STAFFMEMBERS = ["Dave Whitfield", "Priya Shah", "Tom Nguyen"];

function resourcename(resourceid) {
  const resource = getResources().filter(function (r) {
    return r.id === resourceid;
  })[0];
  return resource ? resource.name : "Unknown resource";
}

function prioritylabel(priority) {
  if (priority === "high") {
    return "High";
  }
  if (priority === "medium") {
    return "Medium";
  }
  return "Low";
}

function maintenancestatusbadgeclass(status) {
  if (status === "reported") {
    return "badgedanger";
  }
  if (status === "assigned") {
    return "badgewarning";
  }
  if (status === "in_progress") {
    return "badgeinfo";
  }
  return "badgesuccess";
}

function maintenancestatuslabel(status) {
  if (status === "reported") {
    return "Reported";
  }
  if (status === "assigned") {
    return "Assigned";
  }
  if (status === "in_progress") {
    return "In progress";
  }
  return "Resolved";
}

function populatemaintenanceresourceoptions() {
  const select = document.getElementById("resourceselect");
  const resources = getResources();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a resource…";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  resources.forEach(function (r) {
    const option = document.createElement("option");
    option.value = r.id;
    option.textContent = r.name;
    select.appendChild(option);
  });
}

function showmaintenancemessage(text, iswarning) {
  const box = document.getElementById("confirmmessage");
  const cssclass = iswarning ? "errormessage" : "confirmmessage";
  box.innerHTML = '<div class="' + cssclass + '">' + text + "</div>";
}

function handlemaintenancesubmit(event) {
  event.preventDefault();

  const resourceid = document.getElementById("resourceselect").value;
  const priority = document.getElementById("priorityinput").value;
  const reportedby = document.getElementById("reportedbyinput").value.trim();
  const description = document.getElementById("descriptioninput").value.trim();

  if (!resourceid || !priority || !reportedby || !description) {
    showmaintenancemessage("Please fill in every field before submitting.", true);
    return;
  }

  const task = {
    id: "m" + Date.now(),
    resourceId: resourceid,
    reportedBy: reportedby,
    description: description,
    priority: priority,
    status: "reported",
    assignedTo: null,
    createdAt: new Date().toISOString()
  };

  const tasks = getMaintenanceTasks();
  tasks.push(task);
  saveMaintenanceTasks(tasks);
  addAuditEntry(reportedby, "maintenance_reported", "Reported an issue with " + resourcename(resourceid));

  showmaintenancemessage("Thanks, your maintenance report has been submitted.", false);

  document.getElementById("maintenanceform").reset();
  populatemaintenanceresourceoptions();
  renderallmaintenanceviews();
}
