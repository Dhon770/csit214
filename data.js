const STORAGEKEYS = {
  resources: "councilresources",
  bookings: "councilbookings",
  maintenanceTasks: "councilmaintenancetasks",
  closures: "councilclosures",
  auditLog: "councilauditlog",
  role: "councilrole"
};

function readjson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writejson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function defaultResources() {
  return [
    {
      id: "r1",
      name: "Riverside Community Hall",
      type: "facility",
      location: "12 River St",
      capacity: 150,
      description: "Large hall suitable for community events, weddings, and functions.",
      status: "available"
    },
    {
      id: "r2",
      name: "Oak Park Pavilion",
      type: "facility",
      location: "Oak Park",
      capacity: 80,
      description: "Open-sided pavilion with BBQ facilities, popular for family gatherings.",
      status: "available"
    },
    {
      id: "r3",
      name: "Meeting Room A",
      type: "room",
      location: "Council Administration Building",
      capacity: 12,
      description: "Small meeting room with whiteboard and video conferencing.",
      status: "available"
    },
    {
      id: "r4",
      name: "Meeting Room B",
      type: "room",
      location: "Council Administration Building",
      capacity: 20,
      description: "Medium meeting room, suitable for workshops.",
      status: "maintenance"
    },
    {
      id: "r5",
      name: "Portable PA System",
      type: "equipment",
      location: "Equipment Store",
      capacity: 1,
      description: "Portable speaker and microphone set for outdoor events.",
      status: "available"
    },
    {
      id: "r6",
      name: "Tennis Court 2",
      type: "facility",
      location: "Riverside Sports Complex",
      capacity: 4,
      description: "Outdoor hard-court tennis court, lights available after dark.",
      status: "available"
    }
  ];
}

function getResources() {
  return readjson(STORAGEKEYS.resources, []);
}

function saveResources(list) {
  writejson(STORAGEKEYS.resources, list);
}
