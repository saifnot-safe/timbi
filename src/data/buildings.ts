export const buildings = {
  aceb: {
    name: "Amit Chakma Engineering Building",
    shortName: "ACEB",
    aliases: [
      "aceb",
      "engineering building",
      "engineering",
      "eng building",
      "amit chakma engineering building",
    ],
    lat: 43.0042, 
    lng: -81.2760,
  },

  spencer: {
    shortName: "SEB",
    name: "Spencer Engineering Building",
    aliases: [
        "seb",
        "spencer engineering building"
    ],
    lat: 43.0056,
    lng: -81.2760,
  },

  ues: {
    name: "UES Lounge",
    shortName: "UES",
    aliases: [
        "ues",
        "undergraduate engineering society"
    ],
    lat: 43.0053,
    lng: -81.2760,
  },

  weldon: {
    name: "Weldon Library",
    shortName: "Weldon",
    aliases: [
        "weldon",
        "weldon library"
    ],
    lat: 43.0080,
    lng: -81.2755,
  },

  ucc: {
    name: "University Community Centre",
    shortName: "UCC",
    aliases: [
      "ucc",
      "university community centre",
    ],
    lat: 43.0087,
    lng: -81.2762,
  },

   natSci: {
    name: "Natural Sciences Centre",
    shortName: "Nat Sci",  
    aliases: [
      "nsc",
      "nat sci",
    ],
    lat: 43.0106, 
    lng: -81.2731,
  },
  taylor: {
    name: "Taylor Library",
    shortName: "Taylor",
    aliases: [
      "taylor"
    ],
    lat: 43.0111, 
    lng: -81.2734,
  },

  socialSci: {
    name: "Social Science Centre",
    shortName: "Social Sci",
    aliases: [
        "ssc",
        "social sci"
    ],
    lat: 43.0095, 
    lng: -81.2752
  },

  somerville: {
    name: "Somerville House",
    shortName: "Somerville",
    aliases: [
        "somerville",
        "somerville hall"
    ],
    lat: 43.0074,
    lng: -81.2740,
  },

  rec: {
    name: "Recreation Centre",
    shortName: "Rec Centre",
    aliases: [
        "rec centre",
        "rec"
    ],
    lat: 43.0031,
    lng: -81.2749
  },

  thames: {
  name: "Thames Hall",
  shortName: "TH",
  aliases: ["thames", "thames hall", "thames hall atrium"],
  lat: 43.0092,
  lng: -81.2718,
},

ncb: {
  name: "North Campus Building",
  shortName: "NCB",
  aliases: ["ncb", "north campus building", "north campus"],
  lat: 43.0113,
  lng: -81.2754,
},

talbot: {
  name: "Talbot College",
  shortName: "TC",
  aliases: ["tc", "talbot", "talbot college"],
  lat: 43.0072,
  lng: -81.2778,
},

uc: {
  name: "University College",
  shortName: "UC",
  aliases: ["uc", "university college"],
  lat: 43.0083,
  lng: -81.2747,
},

ivey: {
  name: "Richard Ivey Building",
  shortName: "Ivey",
  aliases: ["ivey", "richard ivey building", "ivey building"],
  lat: 43.0047,
  lng: -81.2787,
},

hsb: {
  name: "Health Sciences Building",
  shortName: "HSB",
  aliases: ["hsb", "health sciences building", "labatt health sciences"],
  lat: 43.0099,
  lng: -81.2706,
},

msb: {
  name: "Medical Sciences Building",
  shortName: "MSB",
  aliases: ["msb", "medical sciences", "medical sciences building"],
  lat: 43.0114,
  lng: -81.2721,
},

pab: {
  name: "Physics and Astronomy Building",
  shortName: "PAB",
  aliases: ["pab", "physics", "physics and astronomy", "physics and astronomy building"],
  lat: 43.0103,
  lng: -81.2725,
},

mb: {
  name: "Music Building",
  shortName: "MB",
  aliases: ["mb", "music building", "music"],
  lat: 43.0081,
  lng: -81.2786,
},

vac: {
  name: "Visual Arts Centre",
  shortName: "VAC",
  aliases: ["vac", "visual arts", "visual arts centre", "visual arts center"],
  lat: 43.0071,
  lng: -81.2795,
},
  
}

export type BuildingId = keyof typeof buildings