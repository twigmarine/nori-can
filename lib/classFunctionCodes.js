module.exports = {
  id: 'Appendix B.6 Class & Function Codes Standard for Serial-Data Networking of Marine',
  version: 2,
  date: '7/19/2012',
  authors:
   ['National Marine Electronics Association',
     'International Marine Electronics Association NMEA 2000®'],
  codes:
   [{
     code: 0,
     label: 'Reserved',
     labelDetails: 'Reserved for NMEA 2000 use',
     functions: [],
   },
   {
     code: 10,
     label: 'System Tools',
     labelDetails: 'Equipment that queries and measures NMEA 2000 bus traffic and may be used to configure, troubleshoot and/or test. System Tools shall not be permanently connected to the NMEA 2000 bus.',
     functions:
        [{
          code: 130,
          label: 'Diagnostic',
          labelDetails: 'Devices that stress the system for diagnostic purposes',
        },
        {
          code: 140,
          label: 'Bus Traffic Logger',
          labelDetails: 'Devices that may be connected to a NMEA 2000 backbone to record bus traffic; as used in this class, these devices promiscuously capture and save CAN frames without regard for source or content',
        }],
   },
   {
     code: 20,
     label: 'Safety Systems',
     labelDetails: 'Equipment that is inheritantly designed to ensure personnel and/or vessel safety by recording, detecting, and/or alerting on safety/security related occurances.',
     functions:
        [{
          code: 110,
          label: 'Alarm Enunciator',
          labelDetails: 'Alarm Enunciator { Deprecated - See Display/Alarm Enunciator - Class Code 120, Function Code 140 }',
          deprecated: true,
        },
        {
          code: 130,
          label: 'Emergency Position Indicating Radio Beacon (EPIRB)',
          labelDetails: 'Devices that transmit ownship position to aid in vessel location for distress and search and rescue',
        },
        {
          code: 135,
          label: 'Man Overboard',
          labelDetails: 'Devices that detect/report events where personnel are absent from the vessel',
        },
        {
          code: 140,
          label: 'Voyage Data Recorder',
          labelDetails: 'Devices that collect data from various vessel sensors and stores the information for later retrieval; as used in this class, these devices are typically configured to record specific parameters from specific sources, such as vessel position from a GNSS receiver.',
        },
        {
          code: 150,
          label: 'Camera',
          labelDetails: 'Devices that record ownship compartment, equipment and personnel video images for the purpose of ensuring ownship security and/or safety.',
        }],
   },
   {
     code: 25,
     label: 'Inter/Intranetwork Device',
     labelDetails: 'NMEA 2000 equipment used as nodes to interconnect communication paths, including both inter- and intra- network communication',
     functions:
        [{
          code: 130,
          label: 'PC Gateway',
          labelDetails: 'Device that brings both NMEA 2000 data onto a computer, and computer data onto an NMEA 2000 network.',
        },
        {
          code: 131,
          label: 'NMEA 2000 to Analog Gateway',
          labelDetails: 'Device that brings NMEA 2000 data to an analog system or display',
        },
        {
          code: 132,
          label: 'Analog to NMEA 2000 Gateway',
          labelDetails: 'Device that converts analog device data and sends this onto the NMEA 2000 network',
        },
        {
          code: 133,
          label: 'NMEA 2000 to Serial Gateway',
          labelDetails: 'Device that brings NMEA 2000 data to a serial port.',
        },
        {
          code: 135,
          label: 'NMEA 0183 Gateway',
          labelDetails: 'Device that joins an NMEA 2000 network to NMEA 0183 circuit(s) and provides translation between NMEA 2000 and 0183 data formats.',
        },
        {
          code: 136,
          label: 'NMEA Network Gateway',
          labelDetails: 'This is a bi-directional device that connects an NMEA OneNet Network to an NMEA 2000 Network and provides translation between NMEA 2000 and NMEA OneNet data',
        },
        {
          code: 137,
          label: 'NMEA 2000 Wireless Gateway',
          labelDetails: 'Transports NMEA 2000 data onto a wireless network and wireless data onto an NMEA 20000 network',
        },
        {
          code: 140,
          label: 'Router',
          labelDetails: 'Device that joins network segments with the same network protocol. On each side of a router address space, data rate and physical media may differ.',
        },
        {
          code: 150,
          label: 'Bridge',
          labelDetails: 'Device that joins network segments using the same network protocol and address space. Data rate and physical media may differ on each side to the bridge. A bridge may perform message filtering.',
        },
        {
          code: 160,
          label: 'Repeater',
          labelDetails: 'Device that receives a signal and retransmits it at a higher level or higher power.',
        }],
   },
   {
     code: 30,
     label: 'Electrical Distribution',
     labelDetails: 'Equipment that monitors and/or controls non-propulsion electrical power use aboard a vessel.',
     functions:
        [{
          code: 130,
          label: 'Binary Event Monitor',
          labelDetails: 'Provides status and/or notification of binary conditions on the vessel. For example, binary conditions include switch positions (On/Off) and float levels (High Bilge Detected/Not Detected).',
        },
        {
          code: 140,
          label: 'Load Controller',
          labelDetails: 'Manages (enables/disables or is otherwise in control of) loads under command from a triggering mechanism or control function.',
        },
        {
          code: 141,
          label: 'AC/DC Input',
          labelDetails: 'Reports electrical properties of AC and/or DC connections feeding power to products/loads.',
        },
        {
          code: 150,
          label: 'Function Controller',
          labelDetails: 'Logical controller that interprets trigger events to determine functional state transitions. For example, a function controller might be responsible for turning on all bilge pumps in the event of a high bilge condition signaled from a binary event monitor by sending commands to one or more load controllers.',
        }],
   },
   {
     code: 35,
     label: 'Electrical Generation',
     labelDetails: 'Equipment that outputs electrical "power", not used primarily to propel the vessel',
     functions:
        [{
          code: 140,
          label: 'Engine',
          labelDetails: 'Devices that convert chemical energy in a fuel into kinetic energy; Primarily under this class, the engine acts as a kinetic energy source for a generator. This function is normally only used for an Engine ECU separate from the Generator ECU.',
        },
        {
          code: 141,
          label: 'DC Generator/Alternator',
          labelDetails: 'Converts kinetic energy to DC power; under this function, the kinetic energy source is relatively stable and can respond to load variations. This function is used both by ECUs that report/control only the DC generation parameters, and by ECUs that report/control both DC generation parameters and the associated engine parameters.',
        },
        {
          code: 142,
          label: 'Solar Panel (Solar Array)',
          labelDetails: 'Converts solar energy to DC power',
        },
        {
          code: 143,
          label: 'Wind Generator (DC)',
          labelDetails: 'Converts kinetic wind energy to DC power, under this function the kinetic energy source is unstable, and may not sustain a given load for any length of time.',
        },
        {
          code: 144,
          label: 'Fuel Cell',
          labelDetails: 'Produces DC power by electrochemical conversion.',
        },
        {
          code: 145,
          label: 'Network Power Supply',
          labelDetails: 'Provides power to an NMEA 2000 network.',
        },
        {
          code: 151,
          label: 'AC Generator',
          labelDetails: 'Converts kinetic energy to AC power; under this function, the kinetic energy source is relatively stable and can respond to load variations. This function is used both by ECUs that report/control only the DC generation parameters, and by ECUs that report/control both AC generation parameters and the associated engine parameters.',
        },
        {
          code: 152,
          label: 'AC Bus',
          labelDetails: 'Reports and/or controls AC electrical properties of an AC electrical bus.',
        },
        {
          code: 153,
          label: 'AC Mains (Utility/Shore)',
          labelDetails: 'Reports and/or controls AC electrical properties of power originating off the vessel.',
        },
        {
          code: 154,
          label: 'AC Output',
          labelDetails: 'Reports and/or controls AC electrical properties of an AC connection feeding power to a bus or another group of products.',
        },
        {
          code: 160,
          label: 'Power Converter - Battery Charger',
          labelDetails: 'Device capable of charging a battery/batteries; This function applies to both AC and DC sourced chargers.',
        },
        {
          code: 161,
          label: 'Power Converter - Battery Charger+Inverter',
          labelDetails: 'Devices that convert AC power to DC power to charge a battery AND convert DC power to AC.',
        },
        {
          code: 162,
          label: 'Power Converter - Inverter',
          labelDetails: 'Converts DC power to AC power',
        },
        {
          code: 163,
          label: 'Power Converter - DC',
          labelDetails: 'Converts one voltage of DC power to another DC power voltage',
        },
        {
          code: 170,
          label: 'Battery',
          labelDetails: 'Reports battery status',
        },
        {
          code: 180,
          label: 'Engine Gateway',
          labelDetails: 'Device that brings information from an engine used for electrical generation onto the NMEA 2000 network.',
        }],
   },
   {
     code: 40,
     label: 'Steering and Control Surfaces',
     labelDetails: 'Equipment used to change the direction and/or attitude of the vessel {Formerly \'Steering Systems\'}',
     functions:
        [{
          code: 130,
          label: 'Follow-up Controller',
          labelDetails: 'Follow-up controller (Helm/JoyStick/etc.)',
        },
        {
          code: 140,
          label: 'Mode Controller',
          labelDetails: 'Mode controller',
        },
        {
          code: 150,
          label: 'Autopilot',
          labelDetails: 'Devices that employ a mechanical, electrical or hydraulic system to guide the ship without assistance from a human being (also known as self-steering gear) {Formerly \'Automatic Steering Controller\'}',
        },
        {
          code: 155,
          label: 'Rudder',
          labelDetails: 'Devices that monitor and/or control a control surface used to steer vessel by re-directing the flow of water past the hull (i.e. rudders)',
        },
        {
          code: 160,
          label: 'Heading Sensors',
          deprecated: true,
          labelDetails: 'Headingsensors {Deprecated-SeeNavigation/Ownship Attitude - Class Code 60, Function Code 140}',
          replacement: [60, 140],
        },
        {
          code: 170,
          label: 'Trim (Tabs)/Interceptors',
          labelDetails: 'Devices that monitor and/or control a control surface used to provide lift to compensate for changes in speed, weight distribution and water conditions',
        },
        {
          code: 180,
          label: 'Attitude (Pitch, Roll, Yaw) Control',
          labelDetails: 'Devices that employ a mechanical, electrical or hydraulic system to maintain a given vessel attitude without assistance from a human being (also known as stabilizer)',
        }],
   },
   {
     code: 50,
     label: 'Propulsion',
     labelDetails: 'Equipment used to move the vessel (ex. Trolling, Thruster, Kicker, and Propulsion devices) {Formerly Propulsion Systems}',
     functions:
        [{
          code: 130,
          label: 'Engineroom Monitoring',
          deprecated: true,
          labelDetails: 'Engineroom monitoring {Deprecated - See Internal Environment - Class Code 90, Function Code 130}',
          replacement: [90, 130],
        },
        {
          code: 140,
          label: 'Engine',
          labelDetails: 'Devices that convert chemical energy in a fuel into kinetic energy; In this class the engine acts primarily as a propulsion device (Combustion). This function is used both by component level ECUs that report control only propulsion engine parameters and also by system level ECUs that report/control parameters related to an entire propulsion train (for esample an engine and transmission). {Formerly Engine interface}',
        },
        {
          code: 141,
          label: 'DC Generator/Alternator',
          labelDetails: 'Devices that convert kinetic energy to DC power used to drive propulsion devices (generator). These devices shall be tied to the engine.',
        },
        {
          code: 150,
          label: 'Engine Controller',
          deprecated: true,
          labelDetails: 'Engine controller {Deprecated - See Propulsion/Engine - Class Code 50, Function Code 140}',
          replacement: [50, 140],
        },
        {
          code: 151,
          label: 'AC Generator',
          labelDetails: 'Devices that convert kinetic energy to AC power used to drive propulsion devices (generator). These devices shall be tied to the engine',
        },
        {
          code: 155,
          label: 'Motor',
          labelDetails: 'Devices that convert electrical energy into kinetic energy; In this class, the motor acts primarily as a propulsion device (Electrical)',
        },
        {
          code: 160,
          label: 'Engine Gateway',
          labelDetails: 'Device that brings information from an engine used for propulsion onto the NMEA 2000 network',
        },
        {
          code: 165,
          label: 'Transmission',
          labelDetails: 'Gear systems providing speed-power conversion',
        },
        {
          code: 170,
          label: 'Throttle/Shift Control',
          labelDetails: 'Local to the propulsion system, may be the actuator or fuel injection system, etc. { Previously "Control Head" }',
        },
        {
          code: 180,
          label: 'Actuator',
          deprecated: true,
          labelDetails: 'Actuator {Deprecated - unused prior to version 2.00}',
        },
        {
          code: 190,
          label: 'Gauge Interface',
          deprecated: true,
          labelDetails: 'Gauge interface {Deprecated - unused prior to version 2.00}',
        },
        {
          code: 200,
          label: 'Gauge Large',
          deprecated: true,
          labelDetails: 'Gauge, large {Deprecated - See Display/Display - Class Code 120, Function Code 130}',
          replacement: [120, 130],
        },
        {
          code: 210,
          label: 'Gauge Small',
          deprecated: true,
          labelDetails: 'Gauge, small {Deprecated - See Display/Display - Class Code 120, Function Code 130}',
          replacement: [120, 130],
        }],
   },
   {
     code: 60,
     label: 'Navigation',
     labelDetails: 'Equipment that provide information related to the passage of the vessel and potental obstructions/hazards {Formerly Navigation Systems}',
     functions:
        [{
          code: 130,
          label: 'Bottom Depth',
          labelDetails: 'Devices that report distance to bottom {Fomerly Sounder, Depth}',
        },
        {
          code: 135,
          label: 'Bottom Depth/Speed',
          labelDetails: 'Devices that report distance to bottom AND speed through water. This allows combination devices of this type to provide both functions with one address. {Formerly Unlabeld}',
        },
        {
          code: 136,
          label: 'Bottom Depth/Speed/Temperature',
          labelDetails: 'Devices that report distance to bottom, speed through water, AND Temperature. This allows combination devices of this type to provide three functions with one address.',
        },
        {
          code: 140,
          label: 'Ownship Attitude',
          labelDetails: 'Devices that report heading, pitch, roll, yaw, angular rates',
        },
        {
          code: 145,
          label: 'Ownship Position (GNSS)',
          labelDetails: 'Devices that report vessel Latitude, Longitude, ground speed, etc. using satellites (ex. GPS, GLONAS, GALILEO, etc.) {Formerly Global Navigation Satellite System (GNSS)}',
        },
        {
          code: 150,
          label: 'Ownship Position (Loran C)',
          labelDetails: 'Devices that report vessel Latitude, Longitude, speed (water/ground), etc. using terrestrial instrumentation (i.e. LORAN C)',
        },
        {
          code: 155,
          label: 'Speed',
          labelDetails: 'Devices that report water/ground speed. {Formerly Speed Sensors}',
        },
        {
          code: 160,
          label: 'Turn Rate Indicator',
          deprecated: true,
          labelDetails:
             {
               'Deprecated - See Navigation/Own ship Attitude - Class Code 60': null,
               'Function Code 140': null,
             },
          replacement: [60, 140],
        },
        {
          code: 170,
          label: 'Integrated Navigation',
          deprecated: true,
          labelDetails: '{Deprecated -\n  See Navigation/Own ship Position - Class Code 60, Function Code 145 OR\n  Navigation/Integrated Navigation System Class Code 60,Function Code 175}',
          replacement: [[60, 145], [60, 175]],
        },
        {
          code: 175,
          label: 'Integrated Navigation System',
          deprecated: true,
          labelDetails: 'Devices that receive navigation data from NMEA 2000 bus and/or internal sources. These devices report back to bus the data selected/used in vessel navigation. The data reported back to the bus should NOT be interpreted as source data for other data consumers.',
        },
        {
          code: 190,
          label: 'Navigation Management',
          labelDetails: 'Devices that report general information necessary to manage navigational equipment as opposed to measured/sensed parameters. Such information includes route/waypoints, distance to waypoint, cross track error, estimated arrival times, waypoint position, datum to use, variation, navigation events such as waypoint arrival, etc.',
        },
        {
          code: 195,
          label: 'Automatic Identification System (AIS)',
          labelDetails: 'Devices that provides dynamic and static information about other vessels in the waterway for the purpose of collision avoidance. These devices may broadcast ownship dynamic and static information to other vessels.',
        },
        {
          code: 200,
          label: 'Radar',
          labelDetails: 'Devices that report position of potential obstructions. These devices typically use electromagnetic waves to identify the range, direction and speed of both moving and fixed objects. {Formerly Radar and/or Radar Plotting}',
        },
        {
          code: 201,
          label: 'Infrared Imaging',
          labelDetails: 'Devices that report position of potential obstructions. These devices typically use infrared radiation generated by both moving and fixed objects to identify their range, direction and speed.',
        },
        {
          code: 205,
          label: 'ECDIS',
          deprecated: true,
          labelDetails: 'Electronic Chart Display and Information System (ECDIS) {Deprecated - See Display/Display - Class Code 120, Function Code 130}',
          replacement: [120, 130],
        },
        {
          code: 210,
          label: 'ECS',
          deprecated: true,
          labelDetails: 'Electronic Chart System (ECS) {Deprecated - See Display/Display - Class Code 120, Function Code 130}',
          replacement: [120, 130],
        },
        {
          code: 220,
          label: 'Direction Finder',
          deprecated: true,
          labelDetails: 'Direction finder {Deprecated - unused prior to version 2.00}',
        },
        {
          code: 230,
          label: 'Voyage Status',
          labelDetails: 'Devices that report time aggregated data, such as average speed, or total distance traveled.',
        }],
   },
   {
     code: 70,
     label: 'Communication',
     labelDetails: 'Equipment used to communicate ship to ship, ship to shore, or intra ship, such as VHF, SSB, Intercom(s) and SATCOMs, etc. {Formerly Communications Systems}',
     functions:
        [{
          code: 130,
          label: 'EPIRB',
          deprecated: true,
          labelDetails: 'Emergency Position Indicating Radio Beacon (EPIRB) {Deprecated - See Safety/EPIRB - Class Code 20, Function Code 130}',
          replacement: [20, 130],
        },
        {
          code: 140,
          label: 'AIS',
          deprecated: true,
          labelDetails: 'Automatic Identification System (AIS) {Deprecated - See Navigation/AIS - Class Code 60, Function Code 195}',
          replacement: [60, 195],
        },
        {
          code: 150,
          label: 'DSC',
          deprecated: true,
          labelDetails: 'Digital Selective Calling (DSC) {Deprecated - See Communication/Radiotelephone - Class Code 70, Function Code 190}',
          replacement: [70, 190],
        },
        {
          code: 160,
          label: 'Data Receiver/Transceiver',
          labelDetails: 'One or two way communication devices intended primarily for digital data (ex. NavTex, WeatherFax) {Formerly Data Receiver}',
        },
        {
          code: 170,
          label: 'Satellite',
          labelDetails: 'Satellite Communications',
        },
        {
          code: 180,
          label: 'Radio-telephone (MF/HF)',
          deprecated: true,
          labelDetails: 'Radio-telephone (MF/HF) {Deprecated - See Communication/Radiotelephone - Class Code 70, Function Code 190}',
          replacement: [70, 190],
        },
        {
          code: 190,
          label: 'Radiotelephone',
          labelDetails: 'One or two way communication devices intended primarily for voice. This includes equipment with DSC hailing capabilities. {Formerly Radio-telephone (VHF)}',
        }],
   },
   {
     code: 75,
     label: 'Sensor Communication Interface',
     labelDetails: 'Equipment that measures one or more of the same parameter per function code for general purpose use. Devices under this class code may require configuration, such as temperature source. For example a device that reports data from two (2) temperature sensors would require one address (Class 75, Function 130). A device that reports data from one (1) temperature sensor and one (1) pressure sensor would require two (2) addresses, one to report the temperature (Class 75, Function 130) and one to report the pressure (Class 75, Function 140)',
     functions:
        [{
          code: 130,
          label: 'Temperature',
          labelDetails: 'Devices that measure/report temperature',
        },
        {
          code: 140,
          label: 'Pressure',
          labelDetails: 'Devices that measure/report pressure',
        },
        {
          code: 150,
          label: 'Fluid Level',
          labelDetails: 'Devices that measure/report fluid level',
        },
        {
          code: 160,
          label: 'Flow',
          labelDetails: 'Devices that measure/report flow',
        },
        {
          code: 170,
          label: 'Humidity',
          labelDetails: 'Devices that measure/report humidity',
        }],
   },
   {
     code: 80,
     label: 'Instrumentation/General Systems',
     deprecated: true,
     labelDetails: 'Instrumentation/General systems {Deprecated class and assigned functions - see specific functions for recommendations for future use}',
     functions:
        [{
          code: 130,
          label: 'Time/Date Systems',
          deprecated: true,
          labelDetails: 'Time/Date systems {Deprecated - unused prior to verision 2.00}',
        },
        {
          code: 140,
          label: 'VDR',
          deprecated: true,
          labelDetails: 'Voyage Data Recorder (VDR) {Deprecated - See Communication/Radiotelephone - Class Code 70, Function Code 190}',
          replacement: [70, 190],
        },
        {
          code: 150,
          label: 'Integrated Instrumentation',
          deprecated: true,
          labelDetails: 'Integrated instrumentation {Deprecated - See Sensor Communication Interface - Class Code 75}',
          replacement: [75],
        },
        {
          code: 160,
          label: 'General Purpose Displays',
          deprecated: true,
          labelDetails: 'General purpose displays {Deprecated - See Display/Display- Class Code 120, Function Code 130}',
          replacement: [120, 130],
        },
        {
          code: 170,
          label: 'General Sensor Box',
          deprecated: true,
          labelDetails: 'General sensor box {Deprecated - See Sensor Communication Interface - Class Code 75}',
          replacement: [75],
        },
        {
          code: 180,
          label: 'Weather Instruments',
          deprecated: true,
          labelDetails: 'Weather instruments {Deprecated - See External Environment/Atmospheric - Class Code 85, Function Code 130}',
          replacement: [85, 130],
        },
        {
          code: 190,
          label: 'Transducer/General',
          deprecated: true,
          labelDetails: 'Transducer/general {Deprecated - See Sensor Communication Interface - Class Code 75}',
          replacement: [75],
        },
        {
          code: 200,
          label: 'NMEA 0183 Converter',
          deprecated: true,
          labelDetails: 'NMEA 0183 converter {Deprecated - See Inter/Intranetwork Device/ NMEA 0183 Gateway - Class Code 25, Function Code 135}',
          replacement: [25, 135],
        }],
   },
   {
     code: 85,
     label: 'External Environment',
     labelDetails: 'Equipment monitoring the meteorological conditions on the exterior of the vessel.',
     functions:
        [{
          code: 130,
          label: 'Atmospheric',
          labelDetails: 'Devices that measure/report weather conditions such as Wind, Barometric Pressure, Temperature, Humidity, Dew point, Wind Chill, Heat Index, etc.',
        },
        {
          code: 160,
          label: 'Aquatic',
          labelDetails: 'Devices that measure/report water conditions such as Temperature, Salinity, Current, Tide, Wave Frequency/Height, etc.',
        }],
   },
   {
     code: 90,
     label: 'Internal Environment',
     labelDetails: 'Equipment monitoring the conditions of interior spaces such as cabins, compartments and engine rooms. {Formerly Environmental (HVAC) Systems}',
     functions:
        [{
          code: 130,
          label: 'HVAC',
          labelDetails: 'Systems that report and/or control climate conditions such as a heating system, an airconditioning system, etc. For example a heating system that measures cabin temperatures. Where the cabin temperature sensor is not on the bus, would use this class/function code. A stand-alone device that measures and reports cabin temperature and is directly on the bus should use class 75, function 130.',
        }],
   },
   {
     code: 100,
     label: 'Deck, Cargo and Fishing Equipment',
     labelDetails: 'Deck, cargo and fishing equipment systems',
     functions:
        [{
          code: 130,
          label: 'Scale (Catch)',
          labelDetails: 'Equipment used to measure/weigh aquatic species caught in commercial or recreational fishing activities.',
        }],
   },
   {
     code: 120,
     label: 'Display',
     labelDetails: 'Equipment that provides visual or audible indication/reporting of data parameters',
     functions:
        [{
          code: 130,
          label: 'Display',
          labelDetails: 'Devices that provide active or passive user interface. A display may also include alarm enunicator functions.',
        },
        {
          code: 140,
          label: 'Alarm Enunciator',
          labelDetails: 'Stand-alone devices that provide passive visual and/or audible alert indication(s).',
        }],
   },
   {
     code: 125,
     label: 'Entertainment',
     labelDetails: 'Multimedia or other communication equipment not impacting safe vessel navigation.',
     functions:
        [{
          code: 130,
          label: 'Multimedia Player',
          labelDetails: 'Equipment that provides visual or audible playback of recorded media for entertainment purposes.',
        },
        {
          code: 140,
          label: 'Multimedia Controller',
          labelDetails: 'Equipment that transmits multimedia commands in response to man-machine input or other external events.',
        }],
   }],
}
