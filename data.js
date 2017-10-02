const assetType = [ 'ant', 'gateway', 'service', 'client'];

export const ants = [
    {
      _id: 'a001',
      name: 'pizeroW1',
      description: 'lake road backyard',
      countryCode: 'us',
      coordinate: { 
        latitude: 42.324094,
        longitude: -71.384572, 
      },
      latitude: 42.324094,
      longitude: -71.384572, 
      assetType: 'ant',
      isActive: true,
      status: 'Active',
      radius: 50, //ft radius coverage
      dateFirstOnline: '9/10/2017',
      dateLastServiced: '9/10/2017',
      hasWarning: true,
    },
    {
        _id: 'a002',
        name: 'pizeroW2',
        description: 'lake road frontyard',
        countryCode: 'us',
        coordinate: { 
          latitude: 42.324109,
          longitude: -71.384672, 
        },
        latitude: 42.324109,
        longitude: -71.384672, 
        assetType: 'ant',
        isActive: true,
        status: 'Active',
        radius: 50, //ft radius coverage
        dateFirstOnline: '9/10/2017',
        dateLastServiced: '9/10/2017',
        hasWarning: false,
      },
      {
        _id: 'a003',
        name: 'Natick Mall pizero1',
        description: 'Natick Mall',
        countryCode: 'us',
        coordinate: { 
          latitude: 42.3009,
          longitude: -71.3842, 
        },
        latitude: 42.3009,
        longitude: -71.3842, 
        assetType: 'ant',
        isActive: false,
        status: 'Recommended',
        radius: 0, //ft radius coverage- only for active ants
        dateFirstOnline: '9/10/2017',
        dateLastServiced: '9/10/2017',
        hasWarning: false,
      },
  ];