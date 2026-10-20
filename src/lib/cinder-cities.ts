export const CITY_KEY = "cinder-city";

export type CityId =
  | "default"
  | "delhi"
  | "lucknow"
  | "mumbai"
  | "hyderabad"
  | "bengaluru"
  | "chennai";

export type SpotShape =
  | "arch"
  | "minar"
  | "lotus"
  | "fort"
  | "dome"
  | "charminar"
  | "buddha"
  | "sealink"
  | "cst"
  | "soudha"
  | "metro"
  | "beach"
  | "temple"
  | "stall"
  | "flyover"
  | "chai"
  | "tower";

export type Spot = {
  name: string;
  famous: boolean;
  shape: SpotShape;
};

export type Road = {
  name: string;
  note: string;
};

export type CityDef = {
  id: CityId;
  label: string;
  blurb: string;
  pace: [string, string, string];
  roads: Road[];
  spots: Spot[];
  sky: [string, string, string];
  road: string;
  lane: string;
  dash: string;
  accent: string;
  car: string;
  roof: string;
  bus: string;
  plate: string;
  pot: number;
  traffic: number;
};

export const CITIES: CityDef[] = [
  {
    id: "default",
    label: "Default",
    blurb: "The foundry line. Slag, gantries, and no city hall.",
    pace: ["Warm", "Hot", "White"],
    roads: [],
    spots: [],
    sky: ["#100c0a", "#231610", "#6a3418"],
    road: "#14110e",
    lane: "#e7a15a",
    dash: "rgba(255, 150, 70, 0.18)",
    accent: "#ff8a3d",
    car: "#f4f1ea",
    roof: "#1c1a17",
    bus: "#3a3028",
    plate: "",
    pot: 0,
    traffic: 0,
  },
  {
    id: "delhi",
    label: "Delhi",
    blurb: "Kartavya Path to Chandni Chowk. A convoy in your lane is a love language.",
    pace: ["Galli", "Ring", "Peak"],
    roads: [
      { name: "Kartavya Path", note: "India Gate is judging your landing." },
      { name: "Ring Road", note: "ITO stays amber. So do you." },
      { name: "Chandni Chowk", note: "Rickshaw clearance is a rumour." },
      { name: "Mathura Road", note: "Humayun on the left, crater on the right." },
      { name: "Barakhamba Road", note: "Colonnades, momos, no mercy." },
      { name: "Africa Avenue", note: "Green belt. Rude white Innova." },
    ],
    spots: [
      { name: "India Gate", famous: true, shape: "arch" },
      { name: "Qutub Minar", famous: true, shape: "minar" },
      { name: "Lotus Temple", famous: true, shape: "lotus" },
      { name: "Red Fort", famous: true, shape: "fort" },
      { name: "Humayun's Tomb", famous: true, shape: "dome" },
      { name: "Jama Masjid", famous: true, shape: "dome" },
      { name: "Sarojini stalls", famous: false, shape: "stall" },
      { name: "INA market", famous: false, shape: "stall" },
      { name: "Blue Line pier", famous: false, shape: "metro" },
      { name: "Nizamuddin flowers", famous: false, shape: "chai" },
      { name: "ITO flyover", famous: false, shape: "flyover" },
    ],
    sky: ["#12161c", "#243044", "#cbb89a"],
    road: "#2c3136",
    lane: "#f3e6c4",
    dash: "rgba(255,255,255,0.5)",
    accent: "#ffb15a",
    car: "#f4f1ea",
    roof: "#1c1a17",
    bus: "#2f6b3a",
    plate: "DL",
    pot: 0.08,
    traffic: 0.16,
  },
  {
    id: "lucknow",
    label: "Lucknow",
    blurb: "Hazratganj manners. Pehle aap — the pothole goes first.",
    pace: ["Chowk", "Ganj", "Gomti"],
    roads: [
      { name: "Hazratganj", note: "Polite traffic. Impolite asphalt." },
      { name: "Lohia Path", note: "Imambara domes, tempo horns." },
      { name: "Faizabad Road", note: "Long straight, short patience." },
      { name: "Cantonment Road", note: "Residency shade, sudden dip." },
      { name: "Gomti Nagar", note: "Riverfront lights, fresh crater." },
      { name: "Vidhan Sabha Marg", note: "Memorials gleam. The lane does not." },
    ],
    spots: [
      { name: "Bara Imambara", famous: true, shape: "dome" },
      { name: "Rumi Darwaza", famous: true, shape: "arch" },
      { name: "Chota Imambara", famous: true, shape: "dome" },
      { name: "The Residency", famous: true, shape: "fort" },
      { name: "Ambedkar Memorial", famous: true, shape: "soudha" },
      { name: "Gomti riverfront", famous: true, shape: "beach" },
      { name: "Tunday lane", famous: false, shape: "stall" },
      { name: "Prakash kulfi", famous: false, shape: "chai" },
      { name: "Aminabad crush", famous: false, shape: "stall" },
      { name: "Charbagh porch", famous: false, shape: "cst" },
      { name: "Chowk paan", famous: false, shape: "chai" },
    ],
    sky: ["#161410", "#3a2c22", "#e0c49a"],
    road: "#343028",
    lane: "#f0d7a4",
    dash: "rgba(255,244,220,0.5)",
    accent: "#e7a15a",
    car: "#efe6d4",
    roof: "#3a2a18",
    bus: "#c45a2a",
    plate: "UP",
    pot: 0.12,
    traffic: 0.1,
  },
  {
    id: "mumbai",
    label: "Mumbai",
    blurb: "Marine Drive. The necklace is pretty. The pothole is the pendant.",
    pace: ["Local", "Signal", "Sea link"],
    roads: [
      { name: "Marine Drive", note: "Queen's necklace. King's crater." },
      { name: "Pedder Road", note: "Crawl is the speed limit." },
      { name: "SV Road", note: "Shops, taxis, one honest puddle." },
      { name: "LBS Marg", note: "Eastern patience test." },
      { name: "Eastern Freeway", note: "Brief freedom, then a join." },
      { name: "Worli Sea Face", note: "Link cables. Oncoming BEST." },
    ],
    spots: [
      { name: "Gateway of India", famous: true, shape: "arch" },
      { name: "CST", famous: true, shape: "cst" },
      { name: "Bandra-Worli Sea Link", famous: true, shape: "sealink" },
      { name: "Haji Ali", famous: true, shape: "dome" },
      { name: "Marine Drive", famous: true, shape: "beach" },
      { name: "Siddhivinayak", famous: true, shape: "temple" },
      { name: "Vada pav stall", famous: false, shape: "stall" },
      { name: "Dadar flowers", famous: false, shape: "chai" },
      { name: "Local viaduct", famous: false, shape: "metro" },
      { name: "Bandstand wall", famous: false, shape: "beach" },
      { name: "BEST depot", famous: false, shape: "stall" },
    ],
    sky: ["#101820", "#1c3a48", "#d7c4a4"],
    road: "#2a3338",
    lane: "#f2e2b8",
    dash: "rgba(255,255,255,0.55)",
    accent: "#ffcf70",
    car: "#f2c200",
    roof: "#161616",
    bus: "#c4372f",
    plate: "MH",
    pot: 0.16,
    traffic: 0.14,
  },
  {
    id: "hyderabad",
    label: "HYD",
    blurb: "Tank Bund. Buddha stays calm. The Swift in your lane does not.",
    pace: ["Abids", "Bund", "ORR"],
    roads: [
      { name: "Tank Bund", note: "Buddha on the water, horns on the tar." },
      { name: "Necklace Road", note: "Lights on the lake, dip in the lane." },
      { name: "PVNR Expressway", note: "Flyover confidence. Ground-level doubt." },
      { name: "Road No. 36", note: "Jubilee Hills. The crater dressed up." },
      { name: "ORR", note: "Outer ring, inner panic." },
      { name: "Abids Road", note: "Irani chai steam, RTC bus nose." },
    ],
    spots: [
      { name: "Charminar", famous: true, shape: "charminar" },
      { name: "Golconda", famous: true, shape: "fort" },
      { name: "Hussain Sagar", famous: true, shape: "buddha" },
      { name: "Birla Mandir", famous: true, shape: "temple" },
      { name: "Chowmahalla", famous: true, shape: "dome" },
      { name: "Taramati Baradari", famous: true, shape: "arch" },
      { name: "Irani chai hotel", famous: false, shape: "chai" },
      { name: "Moazzam Jahi", famous: false, shape: "stall" },
      { name: "HITEC glass", famous: false, shape: "tower" },
      { name: "Punjagutta flyover", famous: false, shape: "flyover" },
      { name: "RTC stand", famous: false, shape: "stall" },
    ],
    sky: ["#141018", "#3a2438", "#e2c2a4"],
    road: "#322c30",
    lane: "#f0d8b4",
    dash: "rgba(255,255,255,0.5)",
    accent: "#ff9a62",
    car: "#f7f4ee",
    roof: "#203040",
    bus: "#1f4f86",
    plate: "TS",
    pot: 0.12,
    traffic: 0.12,
  },
  {
    id: "bengaluru",
    label: "Bengaluru",
    blurb: "Silk Board. The standup started without you. So did this crater.",
    pace: ["Namma", "Signal", "ORR"],
    roads: [
      { name: "MG Road", note: "Metro above. Mystery below." },
      { name: "Brigade Road", note: "Shopfronts, one heroic pothole." },
      { name: "Silk Board", note: "You will not make the standup." },
      { name: "Outer Ring Road", note: "Tech parks glitter. Tar does not." },
      { name: "Hosur Road", note: "A queue of cabs with opinions." },
      { name: "Church Street", note: "Pretty pavers. Rude join." },
    ],
    spots: [
      { name: "Vidhana Soudha", famous: true, shape: "soudha" },
      { name: "Cubbon Park", famous: true, shape: "beach" },
      { name: "Lalbagh glasshouse", famous: true, shape: "dome" },
      { name: "Bangalore Palace", famous: true, shape: "fort" },
      { name: "Tipu's Palace", famous: true, shape: "dome" },
      { name: "UB City", famous: true, shape: "tower" },
      { name: "Namma Metro", famous: false, shape: "metro" },
      { name: "Dosa stall", famous: false, shape: "stall" },
      { name: "Filter coffee", famous: false, shape: "chai" },
      { name: "BMTC stop", famous: false, shape: "stall" },
      { name: "Silk Board stack", famous: false, shape: "flyover" },
    ],
    sky: ["#12160f", "#243024", "#d9c7a4"],
    road: "#2e332c",
    lane: "#efe0b8",
    dash: "rgba(255,255,255,0.5)",
    accent: "#d6ec7a",
    car: "#f4f4f2",
    roof: "#202018",
    bus: "#b23a32",
    plate: "KA",
    pot: 0.22,
    traffic: 0.12,
  },
  {
    id: "chennai",
    label: "Chennai",
    blurb: "Marina. Filter coffee is patient. The monsoon crater is not.",
    pace: ["Beach", "Anna", "OMR"],
    roads: [
      { name: "Anna Salai", note: "Mount Road. Old name, new dip." },
      { name: "Marina Beach Road", note: "Bay on the left, bus on the nose." },
      { name: "ECR", note: "East coast, west-bound impatience." },
      { name: "OMR", note: "IT corridor. Crater corridor." },
      { name: "Cathedral Road", note: "Shade trees, surprise joint." },
      { name: "Pantheon Road", note: "Egmore porch, then a thud." },
    ],
    spots: [
      { name: "Marina Beach", famous: true, shape: "beach" },
      { name: "Kapaleeshwarar", famous: true, shape: "temple" },
      { name: "Central Station", famous: true, shape: "cst" },
      { name: "Fort St. George", famous: true, shape: "fort" },
      { name: "LIC Building", famous: true, shape: "tower" },
      { name: "San Thome", famous: true, shape: "dome" },
      { name: "Ranganathan Street", famous: false, shape: "stall" },
      { name: "Besant Nagar", famous: false, shape: "beach" },
      { name: "Filter coffee", famous: false, shape: "chai" },
      { name: "MTC depot", famous: false, shape: "stall" },
      { name: "Elliot's lamp", famous: false, shape: "beach" },
    ],
    sky: ["#141610", "#24342c", "#f0d2a4"],
    road: "#30342e",
    lane: "#f6e2bc",
    dash: "rgba(255,255,255,0.5)",
    accent: "#ffb15a",
    car: "#f7f3ea",
    roof: "#143028",
    bus: "#d7b23a",
    plate: "TN",
    pot: 0.16,
    traffic: 0.1,
  },
];

const CITY_MAP = new Map(CITIES.map((city) => [city.id, city]));

export function cityById(id: string | null | undefined): CityDef {
  return CITY_MAP.get(id as CityId) ?? CITIES[0];
}

export function loadCity(storage: Pick<Storage, "getItem"> | null): CityId {
  if (!storage) return "default";
  try {
    return cityById(storage.getItem(CITY_KEY)).id;
  } catch {
    return "default";
  }
}

export function drawLandmark(
  ctx: CanvasRenderingContext2D,
  shape: SpotShape,
  x: number,
  ground: number,
  stone: string,
  accent: string,
): void {
  ctx.save();
  ctx.translate(x, ground);
  ctx.fillStyle = stone;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  switch (shape) {
    case "arch": {
      ctx.fillRect(-34, -78, 12, 78);
      ctx.fillRect(22, -78, 12, 78);
      ctx.beginPath();
      ctx.arc(0, -78, 28, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#1a1612";
      ctx.beginPath();
      ctx.arc(0, -70, 16, Math.PI, 0);
      ctx.fill();
      break;
    }
    case "minar": {
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-8, -120);
      ctx.lineTo(8, -120);
      ctx.lineTo(16, 0);
      ctx.fill();
      ctx.fillStyle = accent;
      for (let y = -30; y > -110; y -= 22) ctx.fillRect(-10, y, 20, 3);
      break;
    }
    case "lotus": {
      ctx.beginPath();
      for (let i = -2; i <= 2; i++) {
        ctx.moveTo(0, -8);
        ctx.quadraticCurveTo(i * 18, -70, i * 10, -18);
      }
      ctx.fill();
      break;
    }
    case "fort": {
      ctx.fillRect(-48, -48, 96, 48);
      for (let i = -40; i <= 40; i += 16) ctx.fillRect(i, -64, 10, 18);
      ctx.fillStyle = accent;
      ctx.fillRect(-8, -28, 16, 28);
      break;
    }
    case "dome": {
      ctx.fillRect(-40, -36, 80, 36);
      ctx.beginPath();
      ctx.arc(0, -36, 26, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-3, -78, 6, 18);
      break;
    }
    case "charminar": {
      ctx.fillRect(-28, -52, 56, 52);
      for (const px of [-32, 20]) {
        ctx.fillRect(px, -96, 12, 96);
        ctx.beginPath();
        ctx.arc(px + 6, -96, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#1a1612";
      ctx.fillRect(-10, -28, 20, 28);
      ctx.fillStyle = accent;
      ctx.fillRect(-28, -58, 56, 6);
      break;
    }
    case "buddha": {
      ctx.fillStyle = "rgba(120, 170, 190, 0.35)";
      ctx.fillRect(-70, -8, 140, 8);
      ctx.fillStyle = stone;
      ctx.beginPath();
      ctx.ellipse(0, -16, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-7, -48, 14, 34);
      ctx.beginPath();
      ctx.arc(0, -56, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "sealink": {
      ctx.fillRect(-70, -8, 140, 6);
      for (const px of [-36, 36]) {
        ctx.beginPath();
        ctx.moveTo(px, -8);
        ctx.lineTo(px, -78);
        ctx.lineTo(px + 6, -78);
        ctx.lineTo(px + 6, -8);
        ctx.fill();
      }
      ctx.strokeStyle = accent;
      ctx.beginPath();
      ctx.moveTo(-70, -8);
      ctx.lineTo(-36, -78);
      ctx.lineTo(0, -8);
      ctx.moveTo(0, -8);
      ctx.lineTo(36, -78);
      ctx.lineTo(70, -8);
      ctx.stroke();
      break;
    }
    case "cst": {
      ctx.fillRect(-26, -70, 52, 70);
      ctx.beginPath();
      ctx.moveTo(-32, -70);
      ctx.lineTo(0, -118);
      ctx.lineTo(32, -70);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.fillRect(-6, -40, 12, 18);
      break;
    }
    case "soudha": {
      ctx.fillRect(-60, -28, 120, 28);
      ctx.fillRect(-40, -48, 80, 22);
      ctx.beginPath();
      ctx.arc(0, -48, 16, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-2, -78, 4, 16);
      break;
    }
    case "metro": {
      ctx.fillRect(-4, -70, 8, 70);
      ctx.fillRect(36, -70, 8, 70);
      ctx.fillRect(-16, -78, 70, 10);
      break;
    }
    case "beach": {
      ctx.fillStyle = "rgba(180, 200, 210, 0.25)";
      ctx.beginPath();
      ctx.ellipse(0, -6, 54, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = stone;
      ctx.fillRect(-40, -48, 4, 48);
      ctx.beginPath();
      ctx.arc(-38, -52, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(24, -36, 4, 36);
      break;
    }
    case "temple": {
      for (let i = 0; i < 4; i++) {
        const w = 48 - i * 10;
        ctx.fillRect(-w / 2, -20 - i * 16, w, 16);
      }
      ctx.fillStyle = accent;
      ctx.fillRect(-4, -84, 8, 12);
      break;
    }
    case "stall": {
      ctx.fillStyle = accent;
      ctx.fillRect(-28, -36, 56, 8);
      ctx.fillStyle = stone;
      ctx.fillRect(-24, -28, 48, 28);
      ctx.fillStyle = "#1a1612";
      ctx.fillRect(-8, -16, 14, 16);
      break;
    }
    case "flyover": {
      ctx.fillRect(-50, -36, 100, 8);
      ctx.fillRect(-36, -28, 8, 28);
      ctx.fillRect(28, -28, 8, 28);
      break;
    }
    case "chai": {
      ctx.fillStyle = stone;
      ctx.fillRect(-16, -20, 24, 16);
      ctx.beginPath();
      ctx.arc(8, -12, 6, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.beginPath();
      ctx.moveTo(-4, -20);
      ctx.quadraticCurveTo(0, -36, 8, -22);
      ctx.stroke();
      break;
    }
    case "tower": {
      ctx.fillRect(-16, -100, 32, 100);
      ctx.fillStyle = accent;
      for (let y = -90; y < -10; y += 14) ctx.fillRect(-10, y, 20, 4);
      break;
    }
    default:
      break;
  }
  ctx.restore();
}
