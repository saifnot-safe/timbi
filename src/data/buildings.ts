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

  sommerville: {
    name: "Sommerville House",
    shortName: "Sommerville",
    aliases: [
        "sommerville",
        "sommerville hall"
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
  
}

export type BuildingId = keyof typeof buildings