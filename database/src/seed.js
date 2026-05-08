export const drivers = [
  {
    _id: 'driver-1',
    name: 'Driver A',
    vehicle: 'Van 12',
    status: 'active',
    baseLocation: [28.6139, 77.209],
    location: [28.6139, 77.209],
    routeTemplate: [
      [28.6139, 77.209],
      [28.6182, 77.2184],
      [28.6241, 77.2265]
    ],
    route: [
      [28.6139, 77.209],
      [28.6182, 77.2184],
      [28.6241, 77.2265]
    ]
  },
  {
    _id: 'driver-2',
    name: 'Driver B',
    vehicle: 'Bike 07',
    status: 'active',
    baseLocation: [28.627, 77.215],
    location: [28.627, 77.215],
    routeTemplate: [
      [28.627, 77.215],
      [28.631, 77.223],
      [28.636, 77.231]
    ],
    route: [
      [28.627, 77.215],
      [28.631, 77.223],
      [28.636, 77.231]
    ]
  },
  {
    _id: 'driver-3',
    name: 'Driver C',
    vehicle: 'Truck 03',
    status: 'active',
    baseLocation: [28.604, 77.198],
    location: [28.604, 77.198],
    routeTemplate: [
      [28.604, 77.198],
      [28.6103, 77.2064],
      [28.6178, 77.2141]
    ],
    route: [
      [28.604, 77.198],
      [28.6103, 77.2064],
      [28.6178, 77.2141]
    ]
  },
  {
    _id: 'driver-4',
    name: 'Driver D',
    vehicle: 'Scooter 21',
    status: 'active',
    baseLocation: [28.6194, 77.2018],
    location: [28.6194, 77.2018],
    routeTemplate: [
      [28.6194, 77.2018],
      [28.6239, 77.2079],
      [28.6297, 77.2134]
    ],
    route: [
      [28.6194, 77.2018],
      [28.6239, 77.2079],
      [28.6297, 77.2134]
    ]
  },
  {
    _id: 'driver-5',
    name: 'Driver E',
    vehicle: 'Mini Van 18',
    status: 'active',
    baseLocation: [28.6098, 77.2236],
    location: [28.6098, 77.2236],
    routeTemplate: [
      [28.6098, 77.2236],
      [28.6145, 77.2285],
      [28.6208, 77.2341]
    ],
    route: [
      [28.6098, 77.2236],
      [28.6145, 77.2285],
      [28.6208, 77.2341]
    ]
  }
];

export const orders = [
  {
    _id: 'order-42',
    code: 'Order #42',
    customer: 'Green Valley Mart',
    status: 'Waiting for driver',
    pickupPoint: [28.6150, 77.2080],
    deliveryPoint: [28.6225, 77.2192],
    assignedDriverId: null,
    statusLog: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'order-31',
    code: 'Order #31',
    customer: 'Urban Foods',
    status: 'Waiting for driver',
    pickupPoint: [28.6280, 77.2150],
    deliveryPoint: [28.6342, 77.2281],
    assignedDriverId: null,
    statusLog: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'order-18',
    code: 'Order #18',
    customer: 'Blue Peak Supplies',
    status: 'Waiting for driver',
    pickupPoint: [28.6050, 77.2010],
    deliveryPoint: [28.6074, 77.2035],
    assignedDriverId: null,
    statusLog: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'order-57',
    code: 'Order #57',
    customer: 'Metro Fresh',
    status: 'Waiting for driver',
    pickupPoint: [28.6100, 77.2050],
    deliveryPoint: [28.6171, 77.2122],
    assignedDriverId: null,
    statusLog: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'order-73',
    code: 'Order #73',
    customer: 'Corner Shop Express',
    status: 'Waiting for driver',
    pickupPoint: [28.6250, 77.2200],
    deliveryPoint: [28.6292, 77.2247],
    assignedDriverId: null,
    statusLog: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'order-84',
    code: 'Order #84',
    customer: 'Premium Logistics',
    status: 'Waiting for driver',
    pickupPoint: [28.6020, 77.2090],
    deliveryPoint: [28.6050, 77.2100],
    assignedDriverId: null,
    statusLog: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'order-95',
    code: 'Order #95',
    customer: 'Express Delivery Co',
    status: 'Waiting for driver',
    pickupPoint: [28.6280, 77.2300],
    deliveryPoint: [28.6300, 77.2350],
    assignedDriverId: null,
    statusLog: [],
    createdAt: new Date().toISOString()
  }
];

export const deliveryHistory = [];

export const zones = [
  {
    _id: 'zone-1',
    name: 'Central Hub',
    center: [28.614, 77.209],
    radius: 1600,
    color: '#00d2c9'
  },
  {
    _id: 'zone-2',
    name: 'North Loop',
    center: [28.631, 77.223],
    radius: 1200,
    color: '#ff8c42'
  }
];
