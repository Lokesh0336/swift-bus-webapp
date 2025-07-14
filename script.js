// script.js

// Set the current year in the footer dynamically
document.getElementById('current-year').textContent = new Date().getFullYear();

// --- Global Application State Variables ---
// These variables hold the current state of the application,
// mimicking a single source of truth for dynamic content.
let activeBookingType = 'bus'; // Controls which booking form/flow is active
let currentPage = 'search';    // Controls which sub-page within a booking flow is rendered
let busSearchParams = null;    // Stores the last search criteria for bus
let flightSearchParams = null; // Stores the last search criteria for flight
let hotelSearchParams = null;  // Stores the last search criteria for hotel
let trainSearchParams = null;  // Stores the last search criteria for train

let availableBuses = [];       // Stores buses matching the current search and filters
let selectedBus = null;        // Stores the bus selected by the user for booking
let selectedSeats = [];        // Stores the seats chosen by the user for the selected bus
let passengerInfo = [];        // Stores details for each passenger (for bus booking)
let bookingDetails = null;     // Stores the final confirmed booking details

let selectedBusTypes = [];     // Stores the currently active bus type filters

// --- Dummy Data for various booking types (In-memory, resets on page refresh) ---
// This simulates data fetched from backend APIs for different services.
const allBusesData = [
    {
        id: 'bus1', operator: "Swift Travels", type: "AC Sleeper", from: "Hyderabad", to: "Bangalore", date: "2025-08-20",
        departureTime: "08:00 AM", arrivalTime: "06:00 PM", price: 1200, totalSeats: 40,
        availableSeats: Array.from({ length: 40 }, (_, i) => i + 1),
        layout: [['1', '2', '3', '4'], ['5', '6', '7', '8'], ['9', '10', '11', '12'], ['13', '14', '15', '16'], ['17', '18', '19', '20'], ['21', '22', '23', '24'], ['25', '26', '27', '28'], ['29', '30', '31', '32'], ['33', '34', '35', '36'], ['37', '38', '39', '40']],
        amenities: ['AC', 'Water Bottle', 'Charging Point', 'Blanket']
    },
    {
        id: 'bus2', operator: "ConnectGo Express", type: "AC Seater", from: "Hyderabad", to: "Bangalore", date: "2025-08-20",
        departureTime: "10:00 AM", arrivalTime: "08:00 PM", price: 1500, totalSeats: 30,
        availableSeats: Array.from({ length: 30 }, (_, i) => i + 1),
        layout: [['1', '2', '3', null], ['4', '5', '6', null], ['7', '8', '9', null], ['10', '11', '12', null], ['13', '14', '15', null], ['16', '17', '18', null], ['19', '20', '21', null], ['22', '23', '24', null], ['25', '26', '27', null], ['28', '29', '30', null]],
        amenities: ['AC', 'Recliner Seats', 'WiFi', 'Entertainment']
    },
    {
        id: 'bus3', operator: "RapidRoute Travels", type: "Non-AC Seater", from: "Bangalore", to: "Chennai", date: "2025-08-21",
        departureTime: "09:00 AM", arrivalTime: "05:00 PM", price: 900, totalSeats: 35,
        availableSeats: Array.from({ length: 35 }, (_, i) => i + 1),
        layout: [['1', '2', '3', '4'], ['5', '6', '7', '8'], ['9', '10', '11', '12'], ['13', '14', '15', '16'], ['17', '18', '19', '20'], ['21', '22', '23', '24'], ['25', '26', '27', '28'], ['29', '30', '31', '32'], ['33', '34', '35', null]],
        amenities: ['Non-AC', 'Comfortable Seating']
    },
    {
        id: 'bus4', operator: "CityLink Express", type: "AC Seater", from: "Hyderabad", to: "Chennai", date: "2025-08-22",
        departureTime: "07:30 AM", arrivalTime: "07:00 PM", price: 1100, totalSeats: 45,
        availableSeats: Array.from({ length: 45 }, (_, i) => i + 1),
        layout: [['1', '2', '3', '4', '5'], ['6', '7', '8', '9', '10'], ['11', '12', '13', '14', '15'], ['16', '17', '18', '19', '20'], ['21', '22', '23', '24', '25'], ['26', '27', '28', '29', '30'], ['31', '32', '33', '34', '35'], ['36', '37', '38', '39', '40'], ['41', '42', '43', '44', '45']],
        amenities: ['AC', 'Reading Light']
    },
    {
        id: 'bus5', operator: "GreenLine Travels", type: "AC Sleeper", from: "Hyderabad", to: "Bangalore", date: "2025-08-20",
        departureTime: "11:30 PM", arrivalTime: "08:00 AM", price: 1350, totalSeats: 35,
        availableSeats: Array.from({ length: 35 }, (_, i) => i + 1),
        layout: [['1', '2', null, '3', '4'], ['5', '6', null, '7', '8'], ['9', '10', null, '11', '12'], ['13', '14', null, '15', '16'], ['17', '18', null, '19', '20'], ['21', '22', null, '23', '24'], ['25', '26', null, '27', '28'], ['29', '30', null, '31', '32'], ['33', '34', null, '35', null]],
        amenities: ['AC', 'WiFi', 'Pillow', 'Blanket']
    },
    {
        id: 'bus6', operator: "BlueBird Coaches", type: "Non-AC Seater", from: "Hyderabad", to: "Chennai", date: "2025-08-22",
        departureTime: "09:00 PM", arrivalTime: "07:00 AM", price: 850, totalSeats: 48,
        availableSeats: Array.from({ length: 48 }, (_, i) => i + 1),
        layout: [['1', '2', '3', '4', '5'], ['6', '7', '8', '9', '10'], ['11', '12', '13', '14', '15'], ['16', '17', '18', '19', '20'], ['21', '22', '23', '24', '25'], ['26', '27', '28', '29', '30'], ['31', '32', '33', '34', '35'], ['36', '37', '38', '39', '40'], ['41', '42', '43', '44', '45'], ['46', '47', '48', null, null]],
        amenities: ['Non-AC', 'Music System']
    }
];

// --- Comprehensive List of International and National Cities for Autocomplete ---
const allCities = [
    "New York", "London", "Paris", "Tokyo", "Dubai", "Sydney", "Rome", "Berlin",
    "Singapore", "Hong Kong", "Los Angeles", "Chicago", "Toronto", "Vancouver",
    "Mexico City", "Rio de Janeiro", "Buenos Aires", "Cairo", "Cape Town", "Nairobi",
    "Beijing", "Shanghai", "Seoul", "Mumbai", "Delhi", "Bangalore", "Hyderabad",
    "Chennai", "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
    "Visakhapatnam", "Indore", "Thane", "Bhopal", "Patna", "Vadodara", "Ghaziabad", "Ludhiana",
    "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad",
    "Dhanbad", "Amritsar", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior",
    "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Mysore",
    "Bhubaneswar", "Thiruvananthapuram", "Mangalore", "Kochi", "Dehradun", "Goa", "Puducherry",
    "Shirdi", "Tirupati", "Vellore", "Puri", "Shimla", "Amsterdam", "Madrid", "Barcelona", "Lisbon",
    "Dublin", "Zurich", "Geneva", "Vienna", "Prague", "Budapest", "Warsaw", "Moscow", "St. Petersburg",
    "Istanbul", "Tel Aviv", "Riyadh", "Doha", "Abu Dhabi", "Manama", "Kuwait City", "Bangkok",
    "Kuala Lumpur", "Jakarta", "Hanoi", "Ho Chi Minh City", "Manila", "Osaka", "Kyoto", "Melbourne",
    "Perth", "Auckland", "Wellington", "Montreal", "Boston", "San Francisco", "Seattle", "Dallas",
    "Houston", "Miami", "Orlando", "Washington D.C.", "Philadelphia", "Atlanta", "Denver", "Phoenix",
    "Las Vegas", "San Diego", "Portland", "Austin", "Charlotte", "Nashville", "Detroit", "Minneapolis",
    "St. Louis", "Kansas City", "New Orleans", "San Antonio", "Columbus", "Indianapolis", "Jacksonville",
    "Memphis", "Milwaukee", "Oklahoma City", "Omaha", "Raleigh", "Virginia Beach", "Tucson", "Fresno",
    "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim", "Santa Ana", "Riverside", "Stockton",
    "Chula Vista", "Fremont", "San Bernardino", "Modesto", "Fontana", "Oxnard", "Moreno Valley", "Glendale",
    "Huntington Beach", "Santa Clarita", "Garden Grove", "Oceanside", "Rancho Cucamonga", "Santa Rosa",
    "Corona", "Lancaster", "Palmdale", "Salinas", "Pomona", "Escondido", "Torrance", "Pasadena", "Orange",
    "Fullerton", "Elk Grove", "Roseville", "Concord", "Vallejo", "Fairfield", "Richmond", "Daly City",
    "Berkeley", "Santa Clara", "San Mateo", "Napa", "Santa Cruz", "Redding", "Eureka", "San Luis Obispo",
    "Santa Barbara", "Ventura", "Thousand Oaks", "Simi Valley", "Victorville", "Hesperia", "Adelanto",
    "Apple Valley", "Barstow", "Big Bear Lake", "Cathedral City", "Coachella", "Colton", "Corona",
    "Desert Hot Springs", "Eastvale", "El Centro", "Hemet", "Indian Wells", "Indio", "Jurupa Valley",
    "La Quinta", "Lake Elsinore", "Menifee", "Moreno Valley", "Murrieta", "Norco", "Palm Desert",
    "Palm Springs", "Perris", "Rancho Mirage", "Rialto", "Riverside", "San Jacinto", "Temecula",
    "Twentynine Palms", "Wildomar", "Yucaipa", "Calexico", "Brawley", "El Centro", "Holtville",
    "Imperial", "Westmorland", "Calipatria", "Seeley", "Heber", "Niland", "Ocotillo", "Winterhaven"
].sort();

// --- Comprehensive List of Indian Train Stations with Codes for Autocomplete ---
const indianTrainStations = [
    { name: "Mumbai CSMT", code: "CSMT" }, { name: "New Delhi", code: "NDLS" },
    { name: "Howrah Jn", code: "HWH" }, { name: "Chennai Central", code: "MAS" },
    { name: "Bengaluru City Jn", code: "SBC" }, { name: "Hyderabad Deccan", code: "HYB" },
    { name: "Secunderabad Jn", code: "SC" }, { name: "Kolkata (Sealdah)", code: "SDAH" },
    { name: "Pune Jn", code: "PUNE" }, { name: "Ahmedabad Jn", code: "ADI" },
    { name: "Jaipur Jn", code: "JP" }, { name: "Lucknow Charbagh", code: "LKO" },
    { name: "Varanasi Jn", code: "BSB" }, { name: "Bhopal Jn", code: "BPL" },
    { name: "Patna Jn", code: "PNBE" }, { name: "Nagpur Jn", code: "NGP" },
    { name: "Visakhapatnam Jn", code: "VSKP" }, { name: "Indore Jn", code: "INDB" },
    { name: "Agra Cantt", code: "AGC" }, { name: "Nashik Road", code: "NK" },
    { name: "Amritsar Jn", code: "ASR" }, { name: "Ranchi Jn", code: "RNC" },
    { name: "Coimbatore Jn", code: "CBE" }, { name: "Jabalpur Jn", code: "JBP" },
    { name: "Gwalior Jn", code: "GWL" }, { name: "Vijayawada Jn", code: "BZA" },
    { name: "Jodhpur Jn", code: "JU" }, { name: "Madurai Jn", code: "MDU" },
    { name: "Raipur Jn", code: "R" }, { name: "Kota Jn", code: "KOTA" },
    { name: "Guwahati", code: "GHY" }, { name: "Chandigarh", code: "CDG" },
    { name: "Mysore Jn", code: "MYS" }, { name: "Bhubaneswar", code: "BBS" },
    { name: "Thiruvananthapuram Ctrl", code: "TVC" }, { name: "Mangalore Central", code: "MAQ" },
    { name: "Kochi Ernakulam Jn", code: "ERS" }, { name: "Dehradun", code: "DDN" },
    { name: "Puri", code: "PURI" }, { name: "Shimla", code: "SML" },
    { name: "Haridwar Jn", code: "HW" }, { name: "Rishikesh", code: "RKSH" },
    { name: "Bareilly", code: "BE" }, { name: "Moradabad", code: "MB" },
    { name: "Ghaziabad", code: "GZB" }, { name: "Aligarh Jn", code: "ALJN" },
    { name: "Mathura Jn", code: "MTJ" }, { name: "Jhansi Jn", code: "JHS" },
    { name: "Kanpur Central", code: "CNB" }, { name: "Allahabad Jn", code: "ALD" },
    { name: "Gorakhpur Jn", code: "GKP" }, { name: "Muzaffarpur Jn", code: "MFP" },
    { name: "Darbhanga Jn", code: "DBG" }, { name: "Samastipur Jn", code: "SPJ" },
    { name: "Katihar Jn", code: "KIR" }, { name: "New Jalpaiguri", code: "NJP" },
    { name: "Asansol Jn", code: "ASN" }, { name: "Barddhaman Jn", code: "BWN" },
    { name: "Durgapur", code: "DGR" }, { name: "Malda Town", code: "MLDT" },
    { name: "Puducherry", code: "PDY" }, { name: "Tiruchchirappalli Jn", code: "TPJ" },
    { name: "Erode Jn", code: "ED" }, { name: "Salem Jn", code: "SA" },
    { name: "Katpadi Jn", code: "KPD" }, { name: "Villupuram Jn", code: "VM" },
    { name: "Tambaram", code: "TBM" }, { name: "Chengalpattu Jn", code: "CGL" },
    { name: "Kakinada Port", code: "COA" }, { name: "Rajahmundry", code: "RJY" },
    { name: "Eluru", code: "EE" }, { name: "Guntur Jn", code: "GNT" },
    { name: "Nellore", code: "NLR" }, { name: "Tirupati", code: "TPTY" },
    { name: "Anantapur", code: "ATP" }, { name: "Kurnool City", code: "KNL" },
    { name: "Guntakal Jn", code: "GTL" }, { name: "Hubballi Jn", code: "UBL" },
    { name: "Belagavi", code: "BGM" }, { name: "Dharwad", code: "DWR" },
    { name: "Ballari Jn", code: "BAY" }, { name: "Davangere", code: "DVG" },
    { name: "Shivamogga Town", code: "SMET" }, { name: "Chitradurga", code: "CTA" },
    { name: "Hassan Jn", code: "HAS" }, { name: "Mangalore Jn", code: "MAJN" },
    { name: "Kannur", code: "CAN" }, { name: "Kozhikode", code: "CLT" },
    { name: "Thrissur", code: "TCR" }, { name: "Alappuzha", code: "ALLP" },
    { name: "Kollam Jn", code: "QLN" }, { name: "Nagercoil Jn", code: "NCJ" },
    { name: "Kanyakumari", code: "CAPE" }, { name: "Thanjavur Jn", code: "TJ" },
    { name: "Karaikkudi Jn", code: "KKDI" }, { name: "Rameswaram", code: "RMM" },
    { name: "Tuticorin", code: "TN" }, { name: "Tirunelveli Jn", code: "TEN" },
    { name: "Nanded", code: "NED" }, { name: "Aurangabad (Maharashtra)", code: "AWB" },
    { name: "Jalgaon Jn", code: "JL" }, { name: "Bhusawal Jn", code: "BSL" },
    { name: "Akola Jn", code: "AK" }, { name: "Amravati", code: "AMI" },
    { name: "Wardha Jn", code: "WR" }, { name: "Gondia Jn", code: "G" },
    { name: "Durg", code: "DURG" }, { name: "Bilaspur Jn", code: "BSP" },
    { name: "Raigarh", code: "RIG" }, { name: "Sambalpur City", code: "SBPY" },
    { name: "Cuttack", code: "CTC" }, { name: "Khurda Road Jn", code: "KUR" },
    { name: "Vizianagaram Jn", code: "VZM" }, { name: "Srikakulam Road", code: "CHE" },
    { name: "Palasa", code: "PSA" }, { name: "Berhampur", code: "BAM" },
    { name: "Balasore", code: "BLS" }, { name: "Kharagpur Jn", code: "KGP" },
    { name: "Tatanagar Jn", code: "TATA" }, { name: "Rourkela", code: "ROU" },
    { name: "Bokaro Steel City", code: "BKSC" }, { name: "Dhanbad Jn", code: "DHN" },
    { name: "Gaya Jn", code: "GAYA" }, { name: "Mughalsarai Jn (DD Upadhyaya Jn)", code: "DDU" },
    { name: "Faizabad Jn", code: "FD" }, { name: "Ayodhya Cantt", code: "AYC" },
    { name: "Varanasi City", code: "BCY" }, { name: "Mau Jn", code: "MAU" },
    { name: "Azamgarh", code: "AMH" }, { name: "Ballia", code: "BUI" },
    { name: "Chhapra Jn", code: "CPR" }, { name: "Siwan Jn", code: "SV" },
    { name: "Gorakhpur Cantt", code: "GKY" }, { name: "Basti", code: "BST" },
    { name: "Gonda Jn", code: "GD" }, { name: "Sitapur Jn", code: "STP" },
    { name: "Shahjahanpur", code: "SPN" }, { name: "Hardoi", code: "HRI" },
    { name: "Unnao Jn", code: "ON" }, { name: "Rae Bareli Jn", code: "RBL" },
    { name: "Pratapgarh Jn", code: "PBH" }, { name: "Sultanpur Jn", code: "SLN" },
    { name: "Jaunpur Jn", code: "JNU" }, { name: "Barauni Jn", code: "BJU" },
    { name: "Begusarai", code: "BGS" }, { name: "Khagaria Jn", code: "KGG" },
    { name: "Saharsa Jn", code: "SHC" }, { name: "Purnea Jn", code: "PRNA" },
    { name: "Kishanganj", code: "KNE" }, { name: "Siliguri Jn", code: "SGUJ" },
    { name: "Alipurduar Jn", code: "APDJ" }, { name: "Cooch Behar", code: "COB" },
    { name: "New Cooch Behar", code: "NCB" }, { name: "Bongaigaon", code: "BNGN" },
    { name: "Goalpara Town", code: "GLPT" }, { name: "Kamakhya", code: "KYQ" },
    { name: "Dibrugarh", code: "DBRG" }, { name: "Tinsukia Jn", code: "TSK" },
    { name: "Jorhat Town", code: "JTTN" }, { name: "Dimapur", code: "DMV" },
    { name: "Lumding Jn", code: "LMG" }, { name: "Agartala", code: "AGTL" },
    { name: "Silchar", code: "SCL" }, { name: "Bikaner Jn", code: "BKN" },
    { name: "Jaisalmer", code: "JSM" }, { name: "Ajmer Jn", code: "AII" },
    { name: "Udaipur City", code: "UDZ" }, { name: "Mount Abu Road", code: "ABR" },
    { name: "Palanpur Jn", code: "PNU" }, { name: "Bhuj", code: "BHUJ" },
    { name: "Gandhidham Jn", code: "GIMB" }, { name: "Dwarka", code: "DWK" },
    { name: "Okha", code: "OKHA" }, { name: "Porbandar", code: "PBR" },
    { name: "Veraval", code: "VRL" }, { name: "Junagadh Jn", code: "JND" },
    { name: "Rajkot Jn", code: "RJT" }, { name: "Jamnagar", code: "JAM" },
    { name: "Surendranagar", code: "SUNR" }, { name: "Bhavnagar Terminus", code: "BVC" },
    { name: "Vadodara Jn", code: "BRC" }, { name: "Surat", code: "ST" },
    { name: "Valsad", code: "BL" }, { name: "Vapi", code: "VAPI" },
    { name: "Nashik Road", code: "NK" }, { name: "Manmad Jn", code: "MMR" },
    { name: "Ahmednagar", code: "ANG" }, { name: "Solapur Jn", code: "SUR" },
    { name: "Kolhapur SCSMT", code: "KOP" }, { name: "Miraj Jn", code: "MRJ" },
    { name: "Satara", code: "STR" }, { name: "Sangli", code: "SLI" },
    { name: "Ratnagiri", code: "RN" }, { name: "Madgaon Jn", code: "MAO" },
    { name: "Karwar", code: "KAWR" }, { name: "Udupi", code: "UD" },
    { name: "Kasaragod", code: "KGQ" }, { name: "Payyanur", code: "PAY" },
    { name: "Thalassery", code: "TLY" }, { name: "Vadakara", code: "BDJ" },
    { name: "Koyilandy", code: "QLD" }, { name: "Shoranur Jn", code: "SRR" },
    { name: "Palakkad Jn", code: "PGT" }, { name: "Pollachi Jn", code: "POY" },
    { name: "Dindigul Jn", code: "DG" }, { name: "Karaikudi Jn", code: "KKDI" },
    { name: "Sivaganga", code: "SVGA" }, { name: "Manamadurai Jn", code: "MNM" },
    { name: "Virudunagar Jn", code: "VPT" }, { name: "Sankarankovil", code: "SNKL" },
    { name: "Rajapalayam", code: "RJPM" }, { name: "Srivilliputtur", code: "SVPR" },
    { name: "Tenkasi Jn", code: "TSI" }, { name: "Sengottai", code: "SCT" },
    { name: "Punalur", code: "PUU" }, { name: "Kottayam", code: "KTYM" },
    { name: "Ernakulam Town", code: "ERN" }, { name: "Thrissur", code: "TCR" },
    { name: "Palakkad Town", code: "PGTN" }, { name: "Coimbatore North", code: "CBF" },
    { name: "Mettupalayam", code: "MTP" }, { name: "Ooty (Udhagamandalam)", code: "UAM" },
    { name: "Kodaikanal Road", code: "KQN" }, { name: "Karaikal", code: "KIK" },
    { name: "Nagapattinam", code: "NGT" }, { name: "Velankanni", code: "VLKN" },
    { name: "Mayiladuturai Jn", code: "MV" }, { name: "Chidambaram", code: "CDM" },
    { name: "Cuddalore Port Jn", code: "CUPJ" }, { name: "Puducherry", code: "PDY" },
    { name: "Tiruvannamalai", code: "TNM" }, { name: "Arni Road", code: "ARV" },
    { name: "Jolarpettai Jn", code: "JTJ" }, { name: "Krishnarajapuram", code: "KJM" },
    { name: "Whitefield", code: "WFD" }, { name: "Yelahanka Jn", code: "YNK" },
    { name: "Dharmavaram Jn", code: "DMM" }, { name: "Pakala Jn", code: "PAK" },
    { name: "Renigunta Jn", code: "RU" }, { name: "Gudur Jn", code: "GDR" },
    { name: "Ongole", code: "OGL" }, { name: "Chirala", code: "CLX" },
    { name: "Tenali Jn", code: "TEL" }, { name: "Nalgonda", code: "NLDA" },
    { name: "Mahbubnagar", code: "MBNR" }, { name: "Kacheguda", code: "KCG" },
    { name: "Lingampalli", code: "LPI" }, { name: "Warangal", code: "WL" },
    { name: "Kazipet Jn", code: "KZJ" }, { name: "Adilabad", code: "ADB" },
    { name: "Nizamabad Jn", code: "NZB" }, { name: "Karimnagar", code: "KRMR" },
    { name: "Ramagundam", code: "RDM" }, { name: "Sirpur Kaghaznagar", code: "SKZR" },
    { name: "Balharshah", code: "BPQ" }, { name: "Chandrapur", code: "CD" },
    { name: "Sevagram", code: "SEGM" }, { name: "Itarsi Jn", code: "ET" },
    { name: "Hoshangabad", code: "HBD" }, { name: "Habibganj (Rani Kamlapati)", code: "RKMP" },
    { name: "Vidisha", code: "BHS" }, { name: "Sanchi", code: "SCI" },
    { name: "Ujjain Jn", code: "UJN" }, { name: "Dewas", code: "DWX" },
    { name: "Ratlam Jn", code: "RTM" }, { name: "Dahod", code: "DHD" },
    { name: "Godhra Jn", code: "GDA" }, { name: "Anand Jn", code: "ANND" },
    { name: "Nadiad Jn", code: "ND" }, { name: "Mahesana Jn", code: "MSH" },
    { name: "Patan", code: "PTN" }, { name: "Bhildi Jn", code: "BLDI" },
    { name: "Abu Road", code: "ABR" }, { name: "Pindwara", code: "PDWA" },
    { name: "Falna", code: "FA" }, { name: "Marwar Jn", code: "MJ" },
    { name: "Pali Marwar", code: "PMY" }, { name: "Luni Jn", code: "LUNI" },
    { name: "Barmer", code: "BME" }, { name: "Jaisalmer", code: "JSM" },
    { name: "Pokaran", code: "POK" }, { name: "Phalodi Jn", code: "PLC" },
    { name: "Nagaur", code: "NGO" }, { name: "Degana Jn", code: "DNA" },
    { name: "Merta Road Jn", code: "MTD" }, { name: "Kuchaman City", code: "KWC" },
    { name: "Makrana Jn", code: "MKN" }, { name: "Didwana", code: "DIA" },
    { name: "Sujangarh", code: "SUJH" }, { name: "Churu", code: "CUR" },
    { name: "Sikar Jn", code: "SIKR" }, { name: "Ringas Jn", code: "RGS" },
    { name: "Bandikui Jn", code: "BKI" }, { name: "Alwar Jn", code: "AWR" },
    { name: "Rewari Jn", code: "RE" }, { name: "Rohtak Jn", code: "ROK" },
    { name: "Panipat Jn", code: "PNP" }, { name: "Karnal", code: "KUN" },
    { name: "Ambala Cantt Jn", code: "UMB" }, { name: "Kurukshetra Jn", code: "KKDE" },
    { name: "Yamunanagar Jagadhri", code: "YJUD" }, { name: "Saharanpur Jn", code: "SRE" },
    { name: "Deoband", code: "DBD" }, { name: "Muzaffarnagar", code: "MOZ" },
    { name: "Ghaziabad Jn", code: "GZB" }, { name: "Hapur Jn", code: "HPU" },
    { name: "Bulandshahr", code: "BSC" }, { name: "Khurja Jn", code: "KRJ" },
    { name: "Tundla Jn", code: "TDL" }, { name: "Firozabad", code: "FZD" },
    { name: "Etawah", code: "ETW" }, { name: "Mainpuri", code: "MNQ" },
    { name: "Farrukhabad", code: "FBD" }, { name: "Hardoi", code: "HRI" },
    { name: "Sitapur Cantt", code: "SCC" }, { name: "Lakhimpur", code: "LMP" },
    { name: "Gola Gokarannath", code: "GK" }, { name: "Pilibhit Jn", code: "PBE" },
    { name: "Izzatnagar", code: "IZN" }, { name: "Kathgodam", code: "KGM" },
    { name: "Lal Kuan Jn", code: "LKU" }, { name: "Rudrapur City", code: "RUPC" },
    { name: "Kashipur Jn", code: "KPV" }, { name: "Ramnagar", code: "RMR" },
    { name: "Nainital", code: "NMT" }, { name: "Pantnagar", code: "PBH" },
    { name: "Haldwani", code: "HDW" }, { name: "Kotdwar", code: "KTW" },
    { name: "Laksar Jn", code: "LRJ" }, { name: "Najibabad Jn", code: "NBD" },
    { name: "Bijnor", code: "BJO" }, { name: "Muzzaffarnagar", code: "MOZ" },
    { name: "Shamli", code: "SMQL" }, { name: "Bagpat Road", code: "BPM" },
    { name: "Delhi Shahdara Jn", code: "DSA" }, { name: "Old Delhi Jn", code: "DLI" },
    { name: "Delhi Cantt", code: "DEC" }, { name: "Delhi Sarai Rohilla", code: "DEE" },
    { name: "Hazrat Nizamuddin", code: "NZM" }, { name: "Anand Vihar Terminal", code: "ANVT" },
    { name: "Ghaziabad Jn", code: "GZB" }, { name: "Palwal", code: "PWL" },
    { name: "Ballabgarh", code: "BVH" }, { name: "Faridabad", code: "FDB" },
    { name: "Mathura Jn", code: "MTJ" }, { name: "Bharatpur Jn", code: "BTE" },
    { name: "Sawai Madhopur Jn", code: "SWM" }, { name: "Kota Jn", code: "KOTA" },
    { name: "Bundi", code: "BNDI" }, { name: "Chittaurgarh Jn", code: "COR" },
    { name: "Ratlam Jn", code: "RTM" }, { name: "Godhra Jn", code: "GDA" },
    { name: "Vadodara Jn", code: "BRC" }, { name: "Bharuch Jn", code: "BH" },
    { name: "Surat", code: "ST" }, { name: "Navsari", code: "NVS" },
    { name: "Valsad", code: "BL" }, { name: "Vapi", code: "VAPI" },
    { name: "Palghar", code: "PLG" }, { name: "Virar", code: "VR" },
    { name: "Borivali", code: "BVI" }, { name: "Dadar", code: "DR" },
    { name: "Mumbai Central", code: "MMCT" }, { name: "Lokmanya Tilak Terminus", code: "LTT" },
    { name: "Chhatrapati Shivaji Maharaj Terminus", code: "CSMT" }
].sort((a, b) => a.name.localeCompare(b.name)); // Sort by name for display

// Helper to format train station display
function formatTrainStationDisplay(station) {
    return `${station.name} (${station.code})`;
}

// --- DOM Element References (for efficiency in manipulation) ---
const bookingFormContainer = document.getElementById('booking-form-container');
const infoDisplayContainer = document.getElementById('info-display-container');
const infoDisplayImage = document.getElementById('info-display-image');
const infoDisplayTitle = document.getElementById('info-display-title');
const infoDisplayDescription = document.getElementById('info-display-description');

const messageBoxEl = document.getElementById('message-box');
const messageBoxTitleEl = document.getElementById('message-box-title');
const messageBoxTextEl = document.getElementById('message-box-text');
const messageBoxContentEl = document.getElementById('message-box-content');
const messageBoxCloseBtn = document.getElementById('message-box-close-btn');
const messageBoxActionBtn = document.getElementById('message-box-action-btn');
const loadingSpinnerEl = document.getElementById('loading-spinner');

// --- Helper Functions for UI Interactions (Message Box, Loading Spinner, Date) ---

/**
 * Displays a custom message box to the user.
 * @param {string} msg - The message to display.
 * @param {string} type - The type of message ('error', 'success', 'info').
 */
function showMessage(msg, type) {
    messageBoxEl.classList.remove('hidden');
    messageBoxEl.classList.add('flex');
    messageBoxTextEl.textContent = msg;

    // Reset all type-specific classes before applying new ones
    messageBoxContentEl.classList.remove(
        'bg-red-100', 'border-red-400', 'text-red-700',
        'bg-green-100', 'border-green-400', 'text-green-700',
        'bg-blue-100', 'border-blue-400', 'text-blue-700'
    );
    messageBoxActionBtn.classList.remove(
        'bg-red-600', 'hover:bg-red-700', 'focus:ring-red-500',
        'bg-emerald-600', 'hover:bg-emerald-700', 'focus:ring-emerald-500',
        'bg-indigo-600', 'hover:bg-indigo-700', 'focus:ring-indigo-500'
    );

    // Apply classes based on message type
    if (type === 'error') {
        messageBoxTitleEl.textContent = 'Error!';
        messageBoxContentEl.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
        messageBoxActionBtn.classList.add('bg-red-600', 'hover:bg-red-700', 'focus:ring-red-500');
    } else if (type === 'success') {
        messageBoxTitleEl.textContent = 'Success!';
        messageBoxContentEl.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
        messageBoxActionBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700', 'focus:ring-emerald-500');
    } else { // 'info' or default
        messageBoxTitleEl.textContent = 'Information';
        messageBoxContentEl.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700');
        messageBoxActionBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700', 'focus:ring-indigo-500');
    }
}

/**
 * Hides the custom message box.
 */
function hideMessage() {
    messageBoxEl.classList.add('hidden');
    messageBoxEl.classList.remove('flex');
}

// Attach event listeners for message box close buttons
messageBoxCloseBtn.addEventListener('click', hideMessage);
messageBoxActionBtn.addEventListener('click', hideMessage);

/**
 * Displays the global loading spinner.
 */
function showLoading() {
    loadingSpinnerEl.classList.remove('hidden');
    loadingSpinnerEl.classList.add('flex');
}

/**
 * Hides the global loading spinner.
 */
function hideLoading() {
    loadingSpinnerEl.classList.add('hidden');
    loadingSpinnerEl.classList.remove('flex');
}

// --- Dynamic Content Data for Right Panel (Images & Descriptions) ---
const infoContent = {
    bus: {
        image: "https://static2.tripoto.com/media/filter/tst/img/7372/TripDocument/1526023989_bus_1.jpeg",
        title: "Book Your Bus Journey",
        description: "Find the best bus tickets for your route across India. Enjoy comfortable travel with various bus types and amenities. Fast, reliable, and affordable bus bookings are just a click away."
    },
    flight: {
        image: "https://www.savethestudent.org/uploads/flights.jpg",
        title: "Fly High with SwiftBookings",
        description: "Search and book flights to your dream destinations. We offer competitive prices and a wide range of airlines for both domestic and international travel. Your next adventure awaits!"
    },
    hotel: {
        image: "https://www.theleela.com/prod/content/assets/aio-banner/dekstop/leela-hyderabad-hotel.webp?VersionId=pv2n4jR67S0ZF75HqAbWQqM9zvf_fEV0",
        title: "Find Your Perfect Stay",
        description: "Discover hotels for every budget and occasion. From luxury resorts to cozy guesthouses, book your ideal accommodation with ease. Enjoy exclusive deals and a comfortable stay."
    },
    train: {
        image: "https://swarajya.gumlet.io/swarajya/2022-09/36f25bb0-e823-43d2-8280-f7fb6ca4ec1d/2__4_.png?w=610&q=50&compress=true&format=auto",
        title: "Seamless Train Ticket Booking",
        description: "Experience the convenience of booking train tickets online. Check schedules, availability, and book your seats for a relaxed and scenic journey across the country."
    },
    default: {
        image: "https://www.superoffice.co.uk/globalassets/home-com-website/resources/articles/visuals/customer-journey/customerjourney_top.jpg",
        title: "Welcome to SwiftBookings!",
        description: "Your one-stop solution for seamless travel bookings. Select a category to begin your journey. Whether it's a bus, flight, hotel, or train, we've got you covered with the best deals and easy booking experience."
    }
};

/**
 * Updates the image and description in the right-hand info display.
 * @param {string} type - The active booking type ('bus', 'flight', 'hotel', 'train').
 */
function renderInfoDisplay(type) {
    const data = infoContent[type] || infoContent.default;
    infoDisplayImage.src = data.image;
    infoDisplayImage.alt = data.title; // Update alt text for accessibility
    infoDisplayTitle.textContent = data.title;
    infoDisplayDescription.textContent = data.description;
}

// --- Utility function to get today's date in YYYY-MM-DD format ---
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- Form Validation Helper ---
/**
 * Validates a form's required fields and provides inline feedback.
 * @param {HTMLFormElement} formElement - The form element to validate.
 * @returns {boolean} True if all required fields are valid, false otherwise.
 */
function validateForm(formElement) {
    let isValid = true;
    const requiredInputs = formElement.querySelectorAll('[required]');

    requiredInputs.forEach(input => {
        const errorId = `${input.id}-error`;
        let errorElement = document.getElementById(errorId);

        if (!input.value.trim()) {
            input.classList.add('invalid');
            if (!errorElement) {
                errorElement = document.createElement('p');
                errorElement.id = errorId;
                errorElement.classList.add('input-error'); // Custom class for styling
                input.parentNode.insertBefore(errorElement, input.nextSibling);
            }
            errorElement.textContent = `${input.previousElementSibling.textContent} is required.`;
            isValid = false;
        } else {
            input.classList.remove('invalid');
            if (errorElement) {
                errorElement.remove();
            }
        }
    });
    return isValid;
}

// --- Autocomplete Functionality ---

/**
 * Creates and manages an autocomplete dropdown for a given input element.
 * @param {HTMLInputElement} inputElement - The input field to attach autocomplete to.
 * @param {Array<string>|Array<object>} dataList - The full list of strings (for cities) or objects {name, code} (for train stations) to suggest.
 * @param {boolean} isTrainStation - Flag to indicate if it's a train station autocomplete.
 */
function createAutocompleteDropdown(inputElement, dataList, isTrainStation = false) {
    let dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('autocomplete-dropdown', 'hidden');

    // Ensure the input is wrapped in a relative container for dropdown positioning
    const parent = inputElement.parentNode;
    if (!parent.classList.contains('autocomplete-container')) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('autocomplete-container');
        parent.insertBefore(wrapper, inputElement);
        wrapper.appendChild(inputElement);
        // Append dropdownContainer to the newly created wrapper
        wrapper.appendChild(dropdownContainer);
    } else {
        // If already wrapped, just append dropdown to the existing wrapper
        parent.appendChild(dropdownContainer);
    }

    let activeItem = -1; // Index of the currently highlighted item in the dropdown

    const showDropdown = (suggestions) => {
        dropdownContainer.innerHTML = ''; // Clear previous suggestions
        activeItem = -1; // Reset active item

        if (suggestions.length === 0) {
            dropdownContainer.classList.add('hidden');
            return;
        }

        const ul = document.createElement('ul');
        suggestions.forEach((item, index) => {
            const displayValue = isTrainStation ? formatTrainStationDisplay(item) : item;
            const actualValue = isTrainStation ? item.name : item; // What goes into the input

            const li = document.createElement('li');
            li.textContent = displayValue;
            li.dataset.value = actualValue; // Store the full value to be put in input

            // Use mousedown to prevent input blur before click, ensuring selection works
            li.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Crucial: Prevents the input from losing focus
            });

            li.addEventListener('click', () => {
                inputElement.value = actualValue;
                hideDropdown(); // Explicitly hide after selection
                // Clear any inline validation error on selection
                inputElement.classList.remove('invalid');
                const errorElement = document.getElementById(`${inputElement.id}-error`);
                if (errorElement) errorElement.remove();
            });
            ul.appendChild(li);
        });
        dropdownContainer.appendChild(ul);
        dropdownContainer.classList.remove('hidden');
    };

    const hideDropdown = () => {
        dropdownContainer.classList.add('hidden');
        activeItem = -1;
    };

    const highlightItem = (index) => {
        const items = dropdownContainer.querySelectorAll('li');
        items.forEach((item, idx) => {
            if (idx === index) {
                item.classList.add('active-suggestion');
                item.scrollIntoView({ block: 'nearest', inline: 'nearest' }); // Scroll to highlighted item
            } else {
                item.classList.remove('active-suggestion');
            }
        });
    };

    inputElement.addEventListener('input', () => {
        const query = inputElement.value.toLowerCase();
        if (query.length >= 3) {
            const filteredSuggestions = dataList.filter(item => {
                const name = isTrainStation ? item.name.toLowerCase() : item.toLowerCase();
                const code = isTrainStation ? (item.code ? item.code.toLowerCase() : '') : ''; // Handle missing code
                return name.includes(query) || (isTrainStation && code.includes(query));
            });
            showDropdown(filteredSuggestions);
        } else {
            hideDropdown();
        }
        // Clear inline validation error as user types
        inputElement.classList.remove('invalid');
        const errorElement = document.getElementById(`${inputElement.id}-error`);
        if (errorElement) errorElement.remove();
    });

    inputElement.addEventListener('focus', () => {
        // Show dropdown on focus if there's already enough text
        const query = inputElement.value.toLowerCase();
        if (query.length >= 3) {
            const filteredSuggestions = dataList.filter(item => {
                const name = isTrainStation ? item.name.toLowerCase() : item.toLowerCase();
                const code = isTrainStation ? (item.code ? item.code.toLowerCase() : '') : '';
                return name.includes(query) || (isTrainStation && code.includes(query));
            });
            showDropdown(filteredSuggestions);
        }
    });

    inputElement.addEventListener('blur', (e) => {
        // Hide dropdown only if the related target is not part of the dropdown itself
        // Use a small timeout to allow the 'click' event on the suggestion to fire first
        if (!dropdownContainer.contains(e.relatedTarget)) {
            setTimeout(hideDropdown, 100); 
        }
    });

    inputElement.addEventListener('keydown', (e) => {
        const items = dropdownContainer.querySelectorAll('li');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault(); // Prevent cursor movement in input
            activeItem = (activeItem + 1) % items.length;
            highlightItem(activeItem);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault(); // Prevent cursor movement in input
            activeItem = (activeItem - 1 + items.length) % items.length;
            highlightItem(activeItem);
        } else if (e.key === 'Enter') {
            if (activeItem > -1) {
                e.preventDefault(); // Prevent form submission
                items[activeItem].click(); // Simulate click on the highlighted item
            } else {
                // If Enter is pressed without highlighting, allow form submission if valid
                hideDropdown();
            }
        } else if (e.key === 'Escape') {
            hideDropdown();
            inputElement.blur(); // Remove focus from input
        }
    });

    // Ensure dropdown hides if user clicks anywhere else on the document
    document.addEventListener('click', (e) => {
        // Check if the click was outside both the input's container and the dropdown itself
        if (!inputElement.parentNode.contains(e.target) && !dropdownContainer.contains(e.target)) {
            hideDropdown();
        }
    });
}


// --- Booking Form Rendering Functions (Left Panel) ---

/**
 * Renders the compact bus search form.
 */
function renderBusForm() {
    const today = getTodayDate();
    bookingFormContainer.innerHTML = `
        <div id="bus-booking-panel" class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.005]" role="tabpanel" aria-labelledby="category-bus">
            <h3 class="text-2xl font-bold text-indigo-800 mb-6 text-center">Book Bus Tickets</h3>
            <form id="bus-search-form" class="space-y-4">
                <div>
                    <label for="bus-from" class="block text-sm font-medium text-gray-700 mb-1">Leaving From</label>
                    <input type="text" id="bus-from" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base placeholder-gray-400" placeholder="e.g., Hyderabad" required value="${busSearchParams ? busSearchParams.from : ''}">
                    <p id="bus-from-error" class="input-error hidden"></p>
                </div>
                <div>
                    <label for="bus-to" class="block text-sm font-medium text-gray-700 mb-1">Going To</label>
                    <input type="text" id="bus-to" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base placeholder-gray-400" placeholder="e.g., Bangalore" required value="${busSearchParams ? busSearchParams.to : ''}">
                    <p id="bus-to-error" class="input-error hidden"></p>
                </div>
                <div>
                    <label for="bus-date" class="block text-sm font-medium text-gray-700 mb-1">Journey Date</label>
                    <input type="date" id="bus-date" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" min="${today}" required value="${busSearchParams ? busSearchParams.date : today}">
                    <p id="bus-date-error" class="input-error hidden"></p>
                </div>
                <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                    Search Buses
                </button>
            </form>
        </div>
    `;

    // Attach autocomplete to bus search fields
    createAutocompleteDropdown(document.getElementById('bus-from'), allCities);
    createAutocompleteDropdown(document.getElementById('bus-to'), allCities);

    // Attach event listener for the bus search form submission
    document.getElementById('bus-search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        if (!validateForm(form)) {
            showMessage("Please correct the errors in the form.", 'error');
            return;
        }
        const from = document.getElementById('bus-from').value.trim();
        const to = document.getElementById('bus-to').value.trim();
        const date = document.getElementById('bus-date').value;

        busSearchParams = { from, to, date }; // Update bus specific search params
        fetchBuses(busSearchParams, selectedBusTypes); // Trigger bus search
    });
    document.getElementById('bus-from').focus(); // Set focus for better UX
}

/**
 * Renders a placeholder flight booking form.
 */
function renderFlightForm() {
    const today = getTodayDate();
    bookingFormContainer.innerHTML = `
        <div id="flight-booking-panel" class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.005]" role="tabpanel" aria-labelledby="category-flight">
            <h3 class="text-2xl font-bold text-indigo-800 mb-6 text-center">Book Flights</h3>
            <form id="flight-search-form" class="space-y-4">
                <div>
                    <label for="flight-from" class="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                    <input type="text" id="flight-from" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base placeholder-gray-400" placeholder="e.g., Delhi" required value="${flightSearchParams ? flightSearchParams.from : ''}">
                    <p id="flight-from-error" class="input-error hidden"></p>
                </div>
                <div>
                    <label for="flight-to" class="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <input type="text" id="flight-to" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base placeholder-gray-400" placeholder="e.g., Mumbai" required value="${flightSearchParams ? flightSearchParams.to : ''}">
                    <p id="flight-to-error" class="input-error hidden"></p>
                </div>
                <div>
                    <label for="flight-date" class="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                    <input type="date" id="flight-date" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base" min="${today}" required value="${flightSearchParams ? flightSearchParams.date : today}">
                    <p id="flight-date-error" class="input-error hidden"></p>
                </div>
                <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                    Search Flights
                </button>
            </form>
        </div>
    `;
    // Attach autocomplete to flight search fields
    createAutocompleteDropdown(document.getElementById('flight-from'), allCities);
    createAutocompleteDropdown(document.getElementById('flight-to'), allCities);

    document.getElementById('flight-search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        if (!validateForm(form)) {
            showMessage("Please correct the errors in the form.", 'error');
            return;
        }
        // In a real app, you'd capture these values and make an API call
        // flightSearchParams = { from: document.getElementById('flight-from').value, ... };
        showMessage("Flight search functionality is coming soon!", 'info');
    });
    document.getElementById('flight-from').focus(); // Set focus for better UX
}

/**
 * Renders a placeholder hotel booking form.
 */
function renderHotelForm() {
    const today = getTodayDate();
    bookingFormContainer.innerHTML = `
        <div id="hotel-booking-panel" class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.005]" role="tabpanel" aria-labelledby="category-hotel">
            <h3 class="text-2xl font-bold text-indigo-800 mb-6 text-center">Book Hotels</h3>
            <form id="hotel-search-form" class="space-y-4">
                <div>
                    <label for="hotel-city" class="block text-sm font-medium text-gray-700 mb-1">City / Destination</label>
                    <input type="text" id="hotel-city" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 text-base placeholder-gray-400" placeholder="e.g., Goa" required value="${hotelSearchParams ? hotelSearchParams.city : ''}">
                    <p id="hotel-city-error" class="input-error hidden"></p>
                </div>
                <div>
                    <label for="hotel-checkin" class="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                    <input type="date" id="hotel-checkin" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 text-base" min="${today}" required value="${hotelSearchParams ? hotelSearchParams.checkin : today}">
                    <p id="hotel-checkin-error" class="input-error hidden"></p>
                </div>
                <div>
                    <label for="hotel-checkout" class="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                    <input type="date" id="hotel-checkout" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 text-base" min="${today}" required value="${hotelSearchParams ? hotelSearchParams.checkout : today}">
                    <p id="hotel-checkout-error" class="input-error hidden"></p>
                </div>
                <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                    Search Hotels
                </button>
            </form>
        </div>
    `;
    // Attach autocomplete to hotel search field
    createAutocompleteDropdown(document.getElementById('hotel-city'), allCities);

    document.getElementById('hotel-search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        if (!validateForm(form)) {
            showMessage("Please correct the errors in the form.", 'error');
            return;
        }
        // In a real app, you'd capture these values and make an an API call
        // hotelSearchParams = { city: document.getElementById('hotel-city').value, ... };
        showMessage("Hotel search functionality is coming soon!", 'info');
    });
    document.getElementById('hotel-city').focus(); // Set focus for better UX
}

/**
 * Renders a placeholder train booking form.
 */
function renderTrainForm() {
    const today = getTodayDate();
    bookingFormContainer.innerHTML = `
        <div id="train-booking-panel" class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.005]" role="tabpanel" aria-labelledby="category-train">
            <h3 class="text-2xl font-bold text-indigo-800 mb-6 text-center">Book Train Tickets</h3>
            <form id="train-search-form" class="space-y-4">
                <div>
                    <label for="train-from" class="block text-sm font-medium text-gray-700 mb-1">From Station</label>
                    <input type="text" id="train-from" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base placeholder-gray-400" placeholder="e.g., New Delhi (NDLS)" required value="${trainSearchParams ? trainSearchParams.from : ''}">
                    <p id="train-from-error" class="input-error hidden"></p>
                </div>
                <div>
                    <label for="train-to" class="block text-sm font-medium text-gray-700 mb-1">To Station</label>
                    <input type="text" id="train-to" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base placeholder-gray-400" placeholder="e.g., Mumbai CSMT (CSMT)" required value="${trainSearchParams ? trainSearchParams.to : ''}">
                    <p id="train-to-error" class="input-error hidden"></p>
                </div>
                <div>
                    <label for="train-date" class="block text-sm font-medium text-gray-700 mb-1">Journey Date</label>
                    <input type="date" id="train-date" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base" min="${today}" required value="${trainSearchParams ? trainSearchParams.date : today}">
                    <p id="train-date-error" class="input-error hidden"></p>
                </div>
                <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                    Search Trains
                </button>
            </form>
        </div>
    `;
    // Attach autocomplete to train search fields, specifying it's for train stations
    createAutocompleteDropdown(document.getElementById('train-from'), indianTrainStations, true);
    createAutocompleteDropdown(document.getElementById('train-to'), indianTrainStations, true);

    document.getElementById('train-search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        if (!validateForm(form)) {
            showMessage("Please correct the errors in the form.", 'error');
            return;
        }
        // In a real app, you'd capture these values and make an API call
        // trainSearchParams = { from: document.getElementById('train-from').value, ... };
        showMessage("Train search functionality is coming soon!", 'info');
    });
    document.getElementById('train-from').focus(); // Set focus for better UX
}

/**
 * Renders the list of available buses, including bus type filters.
 * This is specific to the 'bus' booking type.
 */
function renderBusList() {
    // Get all unique bus types from the initial (all) bus data
    const allBusTypes = [...new Set(allBusesData.map(bus => bus.type))];

    // Generate HTML for the bus type filter buttons
    let filtersHtml = `
        <div class="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 mb-6">
            <h3 class="text-lg font-bold text-indigo-800 mb-3">Filter by Bus Type:</h3>
            <div id="bus-type-filters" class="flex flex-wrap gap-2">
                ${allBusTypes.map(type => `
                    <button data-type="${type}" class="bus-type-filter-btn px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 text-sm font-medium transition duration-150 ease-in-out ${selectedBusTypes.includes(type) ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}">
                        ${type}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    // If no buses are found after applying filters, display a message
    if (availableBuses.length === 0) {
        bookingFormContainer.innerHTML = filtersHtml + `
            <div class="text-center py-8 text-gray-700 text-xl font-medium">
                😔 No buses found for your search. Please try another date or route!
                <button id="back-to-bus-search-btn" class="mt-4 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md">
                    Back to Search
                </button>
            </div>
        `;
        addFilterEventListeners(); // Still add listeners for filters
        document.getElementById('back-to-bus-search-btn').addEventListener('click', () => {
            currentPage = 'search';
            renderPage();
        });
        return;
    }

    // Generate HTML for each bus card
    let busesHtml = availableBuses.map(bus => `
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden transform transition duration-300 hover:scale-[1.01] hover:shadow-2xl border border-gray-100 flex flex-col md:flex-row">
            <!-- Placeholder for bus image -->
            <img src="https://placehold.co/600x400/e0e0e0/555555?text=Bus+Image" alt="Bus" class="w-full md:w-1/3 h-36 md:h-auto object-cover bg-gray-200 flex-shrink-0 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none" />
            <div class="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <h3 class="text-lg font-bold text-indigo-800 mb-1.5">${bus.operator} <span class="text-xs font-medium text-gray-500 ml-1">(${bus.type})</span></h3>
                    <div class="text-gray-700 text-xs space-y-0.5">
                        <p><span class="font-semibold text-gray-800">Route:</span> ${bus.from} <span class="text-indigo-500 mx-0.5">➔</span> ${bus.to}</p>
                        <p><span class="font-semibold text-gray-800">Date:</span> ${bus.date}</p>
                        <p><span class="font-semibold text-gray-800">Departure:</span> ${bus.departureTime} <span class="ml-2 font-semibold text-gray-800">Arrival:</span> ${bus.arrivalTime}</p>
                        <p><span class="font-semibold text-gray-800">Amenities:</span> ${bus.amenities.join(', ')}</p>
                    </div>
                </div>
                <div class="mt-3 flex items-center justify-between">
                    <p class="text-xl font-bold text-emerald-600">₹${bus.price}</p>
                    <div class="text-xs text-gray-600">Seats: <span class="font-bold text-indigo-600 text-base">${bus.availableSeats.length}</span> / ${bus.totalSeats}</div>
                </div>
                <button data-bus-id="${bus.id}" class="select-bus-btn w-full mt-4 py-2.5 px-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200 ease-in-out transform hover:scale-105 shadow-md active:scale-95">
                    Select Seats
                </button>
            </div>
        </div>
    `).join('');

    // Combine filters and bus cards into the booking form container
    bookingFormContainer.innerHTML = filtersHtml + `<div class="grid grid-cols-1 gap-4 p-2">${busesHtml}</div>`;

    // Attach event listeners for bus type filter buttons
    addFilterEventListeners();

    // Attach event listeners for "Select Seats" buttons on each bus card
    document.querySelectorAll('.select-bus-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const busId = e.target.dataset.busId;
            const bus = availableBuses.find(b => b.id === busId); // Find the selected bus object
            handleSelectBus(bus); // Call the handler to proceed to seat selection
        });
    });
}

/**
 * Attaches event listeners to the bus type filter buttons.
 * This function is separated to be called after filters are rendered.
 */
function addFilterEventListeners() {
    document.querySelectorAll('.bus-type-filter-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            // Toggle the selected state of the bus type filter
            if (selectedBusTypes.includes(type)) {
                selectedBusTypes = selectedBusTypes.filter(t => t !== type);
            } else {
                selectedBusTypes.push(type);
            }
            // Re-fetch and re-render buses with the updated filters
            // We re-use busSearchParams but apply the new selectedBusTypes
            fetchBuses(busSearchParams, selectedBusTypes);
        });
    });
}

/**
 * Renders the seat selection layout for the chosen bus.
 * This is specific to the 'bus' booking type.
 */
function renderSeatSelection() {
    // Generate HTML for each seat button based on bus layout and availability
    let seatLayoutHtml = selectedBus.layout.flat().map(seatNumber => {
        // Handle null values in layout for spacing/aisles
        if (seatNumber === null || seatNumber === undefined) {
            return `<div class="w-14 h-14 md:w-16 md:h-16"></div>`; // Adjusted size for smaller form
        }

        const isAvailable = selectedBus.availableSeats.includes(seatNumber);
        const isSelected = selectedSeats.includes(seatNumber);
        const isBooked = !isAvailable;

        // Determine CSS classes for seat button based on its state
        let seatClass = "w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-lg font-bold text-lg md:text-xl cursor-pointer transition-all duration-200 ease-in-out shadow-sm";
        if (isBooked) {
            seatClass += " bg-gray-500 text-white opacity-70 cursor-not-allowed";
        } else if (isSelected) {
            seatClass += " bg-indigo-600 text-white border-3 border-indigo-800 transform scale-105";
        } else {
            seatClass += " bg-gray-300 text-gray-800 hover:bg-gray-400 hover:shadow-md";
        }

        return `
            <div class="flex justify-center">
                <button data-seat-number="${seatNumber}" class="seat-toggle-btn ${seatClass}" ${isBooked ? 'disabled' : ''}>
                    ${seatNumber}
                </button>
            </div>
        `;
    }).join('');

    // Set the inner HTML of the booking form container for seat selection page
    bookingFormContainer.innerHTML = `
        <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h2 class="text-2xl md:text-3xl font-bold text-indigo-800 mb-5 text-center">Choose Your Seats for ${selectedBus.operator}</h2>
            <p class="text-center text-gray-700 text-base mb-6">
                Route: <span class="font-semibold">${selectedBus.from} <span class="text-indigo-500 mx-1">➔</span> ${selectedBus.to}</span> | Date: <span class="font-semibold">${selectedBus.date}</span>
            </p>

            <!-- Seat Legend -->
            <div class="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mb-8 text-sm">
                <div class="flex items-center">
                    <div class="w-5 h-5 bg-gray-300 rounded-md mr-1.5 border border-gray-400 shadow-sm"></div>
                    <span class="text-gray-700">Available</span>
                </div>
                <div class="flex items-center">
                    <div class="w-5 h-5 bg-indigo-600 rounded-md mr-1.5 shadow-sm"></div>
                    <span class="text-gray-700">Selected</span>
                </div>
                <div class="flex items-center">
                    <div class="w-5 h-5 bg-gray-500 rounded-md mr-1.5 shadow-sm"></div>
                    <span class="text-gray-700">Booked</span>
                </div>
            </div>

            <!-- Seat Grid -->
            <div class="grid grid-cols-5 gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 shadow-inner">
                ${seatLayoutHtml}
            </div>

            <!-- Selected Seats & Total Price Summary -->
            <div class="mt-8 flex flex-col sm:flex-row justify-between items-center bg-blue-50 p-5 rounded-xl shadow-inner border border-blue-200">
                <p class="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">
                    Selected: <span id="selected-seats-count" class="text-indigo-700 font-bold">${selectedSeats.length}</span> (Seats: <span id="selected-seats-list" class="font-bold">${selectedSeats.join(', ') || 'None'}</span>)
                </p>
                <p class="text-xl font-bold text-gray-900">
                    Total Price: <span id="total-price" class="text-emerald-600">₹${selectedSeats.length * selectedBus.price}</span>
                </p>
            </div>

            <!-- Navigation Buttons -->
            <div class="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                <button id="back-to-bus-list-btn" class="px-6 py-2.5 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition duration-150 ease-in-out shadow-md active:scale-95">
                    Back to Bus List
                </button>
                <button id="proceed-to-passengers-btn" class="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out shadow-md active:scale-95">
                    Proceed to Passenger Details
                </button>
            </div>
        </div>
    `;

    // Attach event listeners for seat buttons
    document.querySelectorAll('.seat-toggle-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const seatNumber = parseInt(e.target.dataset.seatNumber);
            toggleSeat(seatNumber); // Update global selectedSeats array
            updateSeatSelectionUI(); // Re-render only the dynamic parts of the UI
        });
    });

    // Attach event listeners for navigation buttons
    document.getElementById('back-to-bus-list-btn').addEventListener('click', handleBackToBusList);
    document.getElementById('proceed-to-passengers-btn').addEventListener('click', handleProceedToPassengers);

    /**
     * Updates the UI elements on the seat selection page without full re-render.
     * This is crucial for performance in vanilla JS.
     */
    function updateSeatSelectionUI() {
        // Iterate through all seat buttons and update their classes based on selectedSeats
        selectedBus.layout.flat().forEach(seatNumber => {
            if (seatNumber === null || seatNumber === undefined) return;
            const button = document.querySelector(`.seat-toggle-btn[data-seat-number="${seatNumber}"]`);
            if (!button) return; // Should not happen if HTML is correct

            const isAvailable = selectedBus.availableSeats.includes(seatNumber);
            const isSelected = selectedSeats.includes(seatNumber);
            const isBooked = !isAvailable;

            // Remove all previous state classes
            button.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-800', 'transform', 'scale-105',
                                  'bg-gray-500', 'opacity-70', 'cursor-not-allowed',
                                  'bg-gray-300', 'text-gray-800', 'hover:bg-gray-400', 'hover:shadow-md');

            // Apply new state classes
            if (isBooked) {
                button.classList.add('bg-gray-500', 'text-white', 'opacity-70', 'cursor-not-allowed');
                button.disabled = true;
            } else if (isSelected) {
                button.classList.add('bg-indigo-600', 'text-white', 'border-3', 'border-indigo-800', 'transform', 'scale-105');
                button.disabled = false;
            } else {
                button.classList.add('bg-gray-300', 'text-gray-800', 'hover:bg-gray-400', 'hover:shadow-md');
                button.disabled = false;
            }
        });

        // Update the selected seats count and list
        document.getElementById('selected-seats-count').textContent = selectedSeats.length;
        document.getElementById('selected-seats-list').textContent = selectedSeats.join(', ') || 'None';
        // Update the total price
        document.getElementById('total-price').textContent = `₹${selectedSeats.length * selectedBus.price}`;
    }
}

/**
 * Renders the form for passenger details.
 * This is specific to the 'bus' booking type.
 */
function renderPassengerDetailsForm() {
    // Generate HTML for each passenger input section
    let passengersHtml = selectedSeats.map((seat, index) => `
        <div class="border border-gray-200 p-5 rounded-xl shadow-sm bg-gray-50">
            <h3 class="text-lg font-semibold text-indigo-800 mb-3">Passenger ${index + 1} (Seat: ${seat})</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="name-${index}" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" id="name-${index}" data-index="${index}" data-field="name" value="${passengerInfo[index]?.name || ''}" class="passenger-input w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" required>
                    <p id="name-${index}-error" class="input-error hidden"></p>
                </div>
                <div>
                    <label for="age-${index}" class="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input type="number" id="age-${index}" data-index="${index}" data-field="age" value="${passengerInfo[index]?.age || ''}" class="passenger-input w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" min="1" required>
                    <p id="age-${index}-error" class="input-error hidden"></p>
                </div>
                <div class="md:col-span-2">
                    <label for="gender-${index}" class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select id="gender-${index}" data-index="${index}" data-field="gender" class="passenger-input w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" required>
                        <option value="">Select Gender</option>
                        <option value="Male" ${passengerInfo[index]?.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${passengerInfo[index]?.gender === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Other" ${passengerInfo[index]?.gender === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                    <p id="gender-${index}-error" class="input-error hidden"></p>
                </div>
            </div>
        </div>
    `).join('');

    // Set the inner HTML of the booking form container for passenger details page
    bookingFormContainer.innerHTML = `
        <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h2 class="text-2xl md:text-3xl font-bold text-indigo-800 mb-6 text-center">Passenger Information</h2>
            <form id="passenger-details-form" class="space-y-4">
                ${passengersHtml}
                <div class="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                    <button type="button" id="back-to-seat-selection-btn" class="px-6 py-2.5 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition duration-150 ease-in-out shadow-md active:scale-95">
                        Back to Seat Selection
                    </button>
                    <button type="submit" class="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition duration-150 ease-in-out shadow-md active:scale-95">
                        Confirm Booking
                    </button>
                </div>
            </form>
        </div>
    `;

    // Attach event listeners for passenger input fields
    document.querySelectorAll('.passenger-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            const value = e.target.value;
            handleChangePassenger(index, field, value); // Update global passengerInfo
        });
        // Add real-time validation feedback on input change
        input.addEventListener('input', (e) => {
            const inputElement = e.target;
            const errorElement = document.getElementById(`${inputElement.id}-error`);
            if (inputElement.value.trim()) {
                inputElement.classList.remove('invalid');
                if (errorElement) errorElement.remove();
            }
        });
    });

    // Attach event listeners for form submission and back button
    document.getElementById('passenger-details-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        if (!validateForm(form)) {
            showMessage("Please fill in all passenger details for all selected seats.", 'error');
            return;
        }
        handleSubmitPassengerDetails(); // Validate and confirm booking
    });
    document.getElementById('back-to-seat-selection-btn').addEventListener('click', handleBackToSeatSelection);
    document.getElementById(`name-0`).focus(); // Set focus to first passenger name input
}

/**
 * Renders the booking confirmation page.
 * This is specific to the 'bus' booking type.
 */
function renderBookingConfirmation() {
    // Handle case where booking details might be missing (e.g., direct access)
    if (!bookingDetails) {
        bookingFormContainer.innerHTML = `
            <div class="text-center py-10 text-gray-700 text-2xl font-medium">
                No booking details to display.
                <button id="start-new-booking-btn-empty" class="mt-6 px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out shadow-md active:scale-95">
                    Start New Booking
                </button>
            </div>
        `;
        document.getElementById('start-new-booking-btn-empty').addEventListener('click', handleNewBooking);
        return;
    }

    // Generate HTML for the booking confirmation details
    bookingFormContainer.innerHTML = `
        <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h2 class="text-3xl font-bold text-emerald-700 mb-5 animate-bounce-scale">Booking Confirmed! 🎉</h2>
            <p class="text-gray-800 text-lg mb-6">Your journey is all set!</p>

            <div class="border border-gray-200 rounded-xl p-5 mb-6 text-left bg-gray-50 shadow-inner">
                <h3 class="text-xl font-semibold text-indigo-800 mb-4">Your Booking Details</h3>
                <div class="text-gray-700 text-sm space-y-1.5">
                    <p><span class="font-semibold text-gray-800">Booking ID:</span> <span class="font-mono text-indigo-600 text-base">${bookingDetails.bookingId}</span></p>
                    <p><span class="font-semibold text-gray-800">Bus Operator:</span> ${bookingDetails.busOperator}</p>
                    <p><span class="font-semibold text-gray-800">Route:</span> ${bookingDetails.route}</p>
                    <p><span class="font-semibold text-gray-800">Date:</span> ${bookingDetails.date}</p>
                    <p><span class="font-semibold text-gray-800">Departure Time:</span> ${bookingDetails.departureTime}</p>
                    <p><span class="font-semibold text-gray-800">Selected Seats:</span> <span class="font-bold text-indigo-600 text-base">${bookingDetails.selectedSeats.join(', ')}</span></p>
                    <p class="text-xl font-bold text-gray-900 pt-2">Total Price: <span class="text-emerald-600">₹${bookingDetails.totalPrice}</span></p>
                    <p class="text-xs text-gray-500 mt-1">Booked On: ${new Date(bookingDetails.bookingDate).toLocaleString()}</p>
                </div>

                <h4 class="text-lg font-semibold text-indigo-800 mt-5 mb-3">Passengers:</h4>
                <ul class="list-disc list-inside text-gray-700 text-sm space-y-1">
                    ${bookingDetails.passengerInfo.map((p, index) => `
                        <li>
                            <span class="font-semibold">${p.name}</span> (${p.gender}, ${p.age} years) - Seat: <span class="font-semibold text-indigo-600">${p.seat}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <button id="book-another-ticket-btn" class="px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                Book Another Ticket
            </button>
        </div>
    `;
    // Attach event listener for "Book Another Ticket" button
    document.getElementById('book-another-ticket-btn').addEventListener('click', handleNewBooking);
    document.getElementById('book-another-ticket-btn').focus(); // Set focus for better UX
}

// --- Core Application Logic (Simulated API Calls and State Updates) ---

/**
 * Simulates fetching buses based on search parameters and selected filters.
 * @param {object} params - Object containing from, to, and date.
 * @param {Array<string>} typesFilter - Array of selected bus types to filter by.
 */
function fetchBuses(params, typesFilter = []) {
    showLoading(); // Show loading spinner
    hideMessage(); // Hide any previous messages

    setTimeout(() => {
        // Filter buses by origin, destination, and date
        let filtered = allBusesData.filter(bus =>
            bus.from.toLowerCase() === params.from.toLowerCase() &&
            bus.to.toLowerCase() === params.to.toLowerCase() &&
            bus.date === params.date
        );

        // Apply bus type filters if any are selected
        if (typesFilter.length > 0) {
            filtered = filtered.filter(bus => typesFilter.includes(bus.type));
        }

        availableBuses = filtered; // Update the global availableBuses state
        currentPage = 'busList';   // Navigate to the bus list page
        busSearchParams = params;     // Store the search parameters for bus
        selectedBusTypes = typesFilter; // Store the active filters

        hideLoading(); // Hide loading spinner
        renderPage();  // Re-render the page to show bus list

        // Display a message if no buses were found after filtering
        if (availableBuses.length === 0) {
            showMessage("No buses found for your search criteria.", 'info');
        }
    }, 1000); // Simulate network delay for fetching data
}

/**
 * Simulates confirming the booking and updating seat availability.
 */
function confirmBooking() {
    // Basic validation before proceeding
    if (!selectedBus || selectedSeats.length === 0 || passengerInfo.length === 0) {
        showMessage("Booking data incomplete. Please restart the process.", 'error');
        currentPage = 'search'; // Go back to search if data is inconsistent
        renderPage();
        return;
    }
    showLoading(); // Show loading spinner
    hideMessage(); // Hide any previous messages

    setTimeout(() => {
        // Find the original bus object in allBusesData and update its available seats
        const busToUpdate = allBusesData.find(bus => bus.id === selectedBus.id);
        if (busToUpdate) {
            busToUpdate.availableSeats = busToUpdate.availableSeats.filter(
                seat => !selectedSeats.includes(seat) // Remove booked seats from available
            );
        }

        // Generate a unique booking ID
        const newBookingId = `SB-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Construct the booking details object
        bookingDetails = {
            bookingId: newBookingId,
            busId: selectedBus.id,
            busOperator: selectedBus.operator,
            route: `${selectedBus.from} to ${selectedBus.to}`,
            date: selectedBus.date,
            departureTime: selectedBus.departureTime,
            selectedSeats: [...selectedSeats], // Create a copy to prevent future mutations
            passengerInfo: [...passengerInfo], // Create a copy
            totalPrice: selectedSeats.length * selectedBus.price,
            bookingDate: new Date().toISOString(), // Record booking timestamp
        };

        hideLoading(); // Hide loading spinner
        showMessage("Booking successful!", 'success'); // Show success message
        currentPage = 'confirmation'; // Navigate to confirmation page
        renderPage(); // Re-render the page
    }, 2000); // Simulate booking processing delay
}

// --- Event Handlers (Update Global State and Trigger Renders) ---

/**
 * Handles the submission of the bus search form.
 * @param {object} params - The search criteria (from, to, date).
 */
function handleSearchSubmit(params) {
    // When a new search is performed, reset bus type filters
    selectedBusTypes = []; 
    fetchBuses(params, selectedBusTypes);
}

/**
 * Handles the selection of a specific bus from the list.
 * @param {object} bus - The selected bus object.
 */
function handleSelectBus(bus) {
    selectedBus = bus;          // Set the globally selected bus
    selectedSeats = [];         // Reset selected seats for the new bus
    currentPage = 'seatSelection'; // Navigate to seat selection
    hideMessage();              // Clear any messages
    renderPage();               // Re-render the page
}

/**
 * Toggles the selection state of a seat.
 * @param {number} seatNumber - The number of the seat to toggle.
 */
function toggleSeat(seatNumber) {
    // Check if the seat is actually available before allowing selection
    if (!selectedBus.availableSeats.includes(seatNumber)) {
        showMessage(`Seat ${seatNumber} is already booked or unavailable.`, 'error');
        return;
    }

    // Add or remove seat from selectedSeats array
    if (selectedSeats.includes(seatNumber)) {
        selectedSeats = selectedSeats.filter((s) => s !== seatNumber);
    } else {
        selectedSeats = [...selectedSeats, seatNumber].sort((a, b) => a - b); // Keep seats sorted
    }
    // Re-render the seat selection page to update visuals and totals
    renderSeatSelection();
}

/**
 * Handles proceeding from seat selection to passenger details.
 */
function handleProceedToPassengers() {
    if (selectedSeats.length === 0) {
        showMessage("Please select at least one seat to proceed.", 'error');
        return;
    }
    // Initialize passengerInfo array based on the number of selected seats
    // Preserve existing passenger data if re-entering this step
    if (passengerInfo.length !== selectedSeats.length) {
        passengerInfo = selectedSeats.map(seat => {
            const existing = passengerInfo.find(p => p.seat === seat);
            return existing || { seat: seat, name: '', age: '', gender: '' };
        });
    }
    currentPage = 'passengerDetails'; // Navigate to passenger details
    hideMessage();                    // Clear any messages
    renderPage();                     // Re-render the page
}

/**
 * Handles changes in passenger input fields.
 * @param {number} index - The index of the passenger in the array.
 * @param {string} field - The field being changed ('name', 'age', 'gender').
 * @param {string} value - The new value for the field.
 */
function handleChangePassenger(index, field, value) {
    // Update the specific passenger's data in the global passengerInfo array
    passengerInfo[index][field] = value;
}

/**
 * Handles the submission of the passenger details form.
 */
function handleSubmitPassengerDetails() {
    // Validate that all required passenger fields are filled
    const isValid = passengerInfo.every(p => p.name.trim() && p.age && p.gender);
    if (!isValid) {
        showMessage("Please fill in all passenger details for all selected seats.", 'error');
        return;
    }
    confirmBooking(); // Proceed to confirm the booking
}

/**
 * Resets the application state to start a new booking.
 */
function handleNewBooking() {
    currentPage = 'search';       // Go back to search page
    busSearchParams = null;       // Clear bus search parameters
    flightSearchParams = null;    // Clear flight search parameters
    hotelSearchParams = null;     // Clear hotel search parameters
    trainSearchParams = null;     // Clear train search parameters

    availableBuses = [];          // Clear available buses
    selectedBus = null;           // Clear selected bus
    selectedSeats = [];           // Clear selected seats
    passengerInfo = [];           // Clear passenger info
    bookingDetails = null;        // Clear booking details
    selectedBusTypes = [];        // Reset bus type filters
    hideMessage();                // Clear any messages
    renderPage();                 // Re-render the page
}

/**
 * Navigates back from seat selection to the bus list.
 */
function handleBackToBusList() {
    currentPage = 'busList';    // Go back to bus list
    selectedBus = null;         // Clear selected bus
    selectedSeats = [];         // Clear selected seats
    hideMessage();              // Clear any messages
    renderPage();               // Re-render the page
}

/**
 * Navigates back from passenger details to seat selection.
 */
function handleBackToSeatSelection() {
    currentPage = 'seatSelection'; // Go back to seat selection
    // passengerInfo is kept as is, so user doesn't lose data if they go back
    hideMessage();                 // Clear any messages
    renderPage();                  // Re-render the page
}

// --- Main Application Flow Control ---

/**
 * Renders the appropriate booking form based on `activeBookingType`.
 * This function is called when a category button is clicked.
 */
function renderBookingFormForCategory(type) {
    activeBookingType = type; // Update the global active booking type
    currentPage = 'search';   // Always reset to search view when changing category

    // Update active state of category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.dataset.category === type) {
            btn.classList.add('active-category');
            btn.setAttribute('aria-selected', 'true');
            // Update aria-labelledby for the booking form container to reflect active tab
            bookingFormContainer.setAttribute('aria-labelledby', `category-${type}`);
        } else {
            btn.classList.remove('active-category');
            btn.setAttribute('aria-selected', 'false');
        }
    });

    // Render the specific form based on the selected category
    switch (type) {
        case 'bus':
            renderBusForm();
            break;
        case 'flight':
            renderFlightForm();
            break;
        case 'hotel':
            renderHotelForm();
            break;
        case 'train':
            renderTrainForm();
            break;
        default:
            renderBusForm(); // Default to bus form
    }
}

/**
 * Determines which specific view (search, list, seat selection, etc.)
 * to render within the active booking type's flow.
 */
function renderPage() {
    // First, render the correct info display for the active booking type
    renderInfoDisplay(activeBookingType);

    // Then, render the specific form/view based on currentPage and activeBookingType
    switch (activeBookingType) {
        case 'bus':
            switch (currentPage) {
                case 'search':
                    renderBusForm();
                    break;
                case 'busList':
                    renderBusList();
                    break;
                case 'seatSelection':
                    if (selectedBus) renderSeatSelection();
                    else renderBusForm(); // Fallback if state is inconsistent
                    break;
                case 'passengerDetails':
                    if (selectedBus && selectedSeats.length > 0) renderPassengerDetailsForm();
                    else renderBusForm(); // Fallback if state is inconsistent
                    break;
                case 'confirmation':
                    renderBookingConfirmation();
                    break;
                default:
                    renderBusForm();
            }
            break;
        case 'flight':
            renderFlightForm();
            break;
        case 'hotel':
            renderHotelForm();
            break;
        case 'train':
            renderTrainForm();
            break;
        default:
            renderBusForm(); // Default to bus form
    }
}

// --- Initial Application Load & Category Button Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners to the category buttons
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category; // Use currentTarget for button itself
            handleNewBooking(); // Reset state
            renderBookingFormForCategory(category); // Render new category's form
        });
    });

    // Initial render of the default (bus) search page and info display
    // Also activate the default bus button visually
    renderBookingFormForCategory(activeBookingType);
});