let selectedresourceid = null;

function populatelocations() {
  const select = document.getElementById("locationinput");
  const resources = getResources();
  const locations = [];
  resources.forEach(function (r) {
    if (locations.indexOf(r.location) === -1) {
      locations.push(r.location);
    }
  });
  locations.sort();
  locations.forEach(function (loc) {
    const option = document.createElement("option");
    option.value = loc;
    option.textContent = loc;
    select.appendChild(option);
  });
}

function statusbadgeclass(status) {
  if (status === "available") {
    return "badgesuccess";
  }
  if (status === "maintenance") {
    return "badgewarning";
  }
  return "badgedanger";
}

function statuslabel(status) {
  if (status === "available") {
    return "Available";
  }
  if (status === "maintenance") {
    return "Under maintenance";
  }
  return "Closed";
}

function typelabel(type) {
  if (type === "facility") {
    return "Facility";
  }
  if (type === "room") {
    return "Room";
  }
  return "Equipment";
}

function filteredresources() {
  const search = document.getElementById("searchinput").value.trim().toLowerCase();
  const type = document.getElementById("typeinput").value;
  const location = document.getElementById("locationinput").value;
  const capacity = document.getElementById("capacityinput").value;
  const mincapacity = capacity === "" ? 0 : Number(capacity);

  return getResources().filter(function (r) {
    const matchessearch = search === "" || r.name.toLowerCase().indexOf(search) !== -1;
    const matchestype = type === "" || r.type === type;
    const matcheslocation = location === "" || r.location === location;
    const matchescapacity = r.capacity >= mincapacity;
    return matchessearch && matchestype && matcheslocation && matchescapacity;
  });
}

function renderresourcelist() {
  const list = document.getElementById("resourcelist");
  const resources = filteredresources();

  if (resources.length === 0) {
    list.innerHTML = '<div class="emptystate">No resources match your search.</div>';
    return;
  }

  list.innerHTML = resources
    .map(function (r) {
      const selectedclass = r.id === selectedresourceid ? "selected" : "";
      return (
        '<button type="button" class="resourceitem ' +
        selectedclass +
        '" data-id="' +
        r.id +
        '">' +
        '<div class="resourcename">' +
        r.name +
        "</div>" +
        '<div class="resourcemeta">' +
        typelabel(r.type) +
        " &middot; " +
        r.location +
        " &middot; Capacity " +
        r.capacity +
        "</div>" +
        '<span class="badge ' +
        statusbadgeclass(r.status) +
        '">' +
        statuslabel(r.status) +
        "</span>" +
        "</button>"
      );
    })
    .join("");

  const buttons = list.querySelectorAll(".resourceitem");
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectedresourceid = button.getAttribute("data-id");
      renderresourcelist();
      renderdetailpanel();
    });
  });
}
