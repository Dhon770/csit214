function resourcename(resourceid) {
  const resource = getResources().filter(function (r) {
    return r.id === resourceid;
  })[0];
  return resource ? resource.name : "Unknown resource";
}

function countby(items, keyfn) {
  const counts = {};
  items.forEach(function (item) {
    const key = keyfn(item);
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function renderbarchart(containerid, counts) {
  const container = document.getElementById(containerid);
  const entries = Object.keys(counts).map(function (key) {
    return { label: key, value: counts[key] };
  });

  if (entries.length === 0) {
    container.innerHTML = '<div class="emptystate">No data yet.</div>';
    return;
  }

  const maxvalue = Math.max.apply(
    null,
    entries.map(function (e) {
      return e.value;
    })
  );

  container.innerHTML = entries
    .map(function (e) {
      const percent = maxvalue === 0 ? 0 : Math.round((e.value / maxvalue) * 100);
      return (
        '<div class="barrow">' +
        '<div class="barlabel">' +
        e.label +
        "</div>" +
        '<div class="bartrack"><div class="barfill" style="width: ' +
        percent +
        '%"></div></div>' +
        '<div class="barvalue">' +
        e.value +
        "</div>" +
        "</div>"
      );
    })
    .join("");
}

function renderbookingschart() {
  const bookings = getBookings().filter(function (b) {
    return b.status === "approved" || b.status === "pending";
  });
  const counts = countby(bookings, function (b) {
    return resourcename(b.resourceId);
  });
  renderbarchart("bookingschart", counts);
}

function rendermaintenancechart() {
  const tasks = getMaintenanceTasks();
  const counts = countby(tasks, function (t) {
    return resourcename(t.resourceId);
  });
  renderbarchart("maintenancechart", counts);
}
