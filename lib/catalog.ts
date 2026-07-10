import type { FamilyKey } from './generator';

// Brand -> Model -> Type -> Dial variant. Every variant resolves to a finish
// family + palette in the generator, so picking a watch IS picking a wallpaper.
// Names identify which watch a wallpaper pairs with (nominative use only —
// see the in-app disclaimer); keep them out of store metadata.

export type CatalogVariant = {
  id: string;
  label: string;
  family: FamilyKey;
  colors: string[];
};

export type CatalogType = {
  id: string;
  /** 'Standard' when movement/type doesn't change the dial — the UI skips the step */
  label: string;
  variants: CatalogVariant[];
};

export type CatalogModel = {
  id: string;
  label: string;
  types: CatalogType[];
};

export type CatalogBrand = {
  id: string;
  label: string;
  models: CatalogModel[];
};

// Researched catalog (July 2026) — assembled from per-brand research, palettes
// reviewed against a rendered contact sheet. Regenerate the sheet with
// `npx tsx scripts/contact-sheet.ts` after edits.
export const CATALOG: CatalogBrand[] = [
  {
    "id": "audemars-piguet",
    "label": "Audemars Piguet",
    "models": [
      {
        "id": "royal-oak",
        "label": "Royal Oak",
        "types": [
          {
            "id": "15500-grande-tapisserie",
            "label": "15500 41mm (Grande Tapisserie)",
            "variants": [
              {
                "id": "blue",
                "label": "Blue",
                "family": "tapisserie",
                "colors": [
                  "#1c2f4f",
                  "#2f5486",
                  "#101a2c"
                ]
              },
              {
                "id": "black",
                "label": "Black",
                "family": "tapisserie",
                "colors": [
                  "#16171a",
                  "#2b2d31"
                ]
              },
              {
                "id": "grey",
                "label": "Grey (slate)",
                "family": "tapisserie",
                "colors": [
                  "#45484c",
                  "#5f6368",
                  "#26282b"
                ]
              },
              {
                "id": "silver",
                "label": "Silver",
                "family": "tapisserie",
                "colors": [
                  "#d6d8d4",
                  "#b5b7b3"
                ]
              }
            ]
          },
          {
            "id": "16202-petite-tapisserie",
            "label": "16202 Jumbo 39mm (Petite Tapisserie)",
            "variants": [
              {
                "id": "bleu-nuit",
                "label": "Bleu Nuit Nuage 50",
                "family": "tapisserie",
                "colors": [
                  "#141f38",
                  "#23406e",
                  "#0c1220"
                ]
              },
              {
                "id": "smoked-green",
                "label": "Smoked green (platinum)",
                "family": "tapisserie",
                "colors": [
                  "#163122",
                  "#2c5a3e",
                  "#0b1a11"
                ]
              },
              {
                "id": "smoked-grey",
                "label": "Smoked grey (pink gold)",
                "family": "tapisserie",
                "colors": [
                  "#56534e",
                  "#787570",
                  "#262421"
                ]
              },
              {
                "id": "smoked-gold",
                "label": "Smoked gold (yellow gold)",
                "family": "tapisserie",
                "colors": [
                  "#ac8c48",
                  "#c9a960",
                  "#5f4a20"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cartier",
    "label": "Cartier",
    "models": [
      {
        "id": "tank-must",
        "label": "Tank Must",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "silver",
                "label": "Silver",
                "family": "sunray",
                "colors": [
                  "#d9dad6",
                  "#b9bab6"
                ]
              },
              {
                "id": "red-lacquer",
                "label": "Red lacquer",
                "family": "lacquer",
                "colors": [
                  "#9c2028",
                  "#701318"
                ]
              },
              {
                "id": "blue-lacquer",
                "label": "Blue lacquer",
                "family": "lacquer",
                "colors": [
                  "#1e3a72",
                  "#122450"
                ]
              },
              {
                "id": "green-lacquer",
                "label": "Green lacquer",
                "family": "lacquer",
                "colors": [
                  "#1b4a37",
                  "#0f2f22"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "santos",
        "label": "Santos de Cartier",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "silvered-opaline",
                "label": "Silvered opaline",
                "family": "snow",
                "colors": [
                  "#e9e9e5",
                  "#cfcfc9"
                ]
              },
              {
                "id": "blue-gradient",
                "label": "Blue gradient sunray",
                "family": "sunray",
                "colors": [
                  "#1e3c63",
                  "#0d1c30",
                  "#31578a"
                ]
              },
              {
                "id": "green-gradient",
                "label": "Green gradient sunray",
                "family": "sunray",
                "colors": [
                  "#1c4634",
                  "#0c231a",
                  "#2d6249"
                ]
              },
              {
                "id": "black",
                "label": "Black",
                "family": "lacquer",
                "colors": [
                  "#151516",
                  "#2a2a2c"
                ]
              },
              {
                "id": "grey-adlc",
                "label": "Grey gradient (ADLC)",
                "family": "sunray",
                "colors": [
                  "#55575a",
                  "#2b2d30",
                  "#75777a"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "casio",
    "label": "Casio",
    "models": [
      {
        "id": "g-shock-square",
        "label": "G-Shock Square (DW-5600 / GW-M5610)",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "classic-black",
                "label": "Classic black (positive display)",
                "family": "grain",
                "colors": [
                  "#1a1b1d",
                  "#a9ae9f"
                ]
              },
              {
                "id": "stealth-black",
                "label": "All-black (negative display)",
                "family": "grain",
                "colors": [
                  "#101112",
                  "#3a3d40"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "edifice",
        "label": "Edifice (EFV-100)",
        "types": [
          {
            "id": "standard",
            "label": "Standard (quartz)",
            "variants": [
              {
                "id": "black-sunray",
                "label": "Black sunray",
                "family": "sunray",
                "colors": [
                  "#131519"
                ]
              },
              {
                "id": "blue-sunray",
                "label": "Blue sunray",
                "family": "sunray",
                "colors": [
                  "#14294a"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "a168",
        "label": "A168 (Vintage Digital)",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "silver",
                "label": "Silver",
                "family": "grain",
                "colors": [
                  "#b4b6b2",
                  "#969d8c"
                ]
              },
              {
                "id": "gold",
                "label": "Gold",
                "family": "grain",
                "colors": [
                  "#c3a04e",
                  "#969d8c"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "citizen",
    "label": "Citizen",
    "models": [
      {
        "id": "tsuyosa",
        "label": "Tsuyosa",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "blue",
                "label": "Blue sunray (NJ0150-56L)",
                "family": "sunray",
                "colors": [
                  "#1f4276",
                  "#122a52"
                ]
              },
              {
                "id": "black",
                "label": "Black sunray (NJ0150-56E)",
                "family": "sunray",
                "colors": [
                  "#17181b",
                  "#2c2e33"
                ]
              },
              {
                "id": "green",
                "label": "Green sunray (NJ0150-56X)",
                "family": "sunray",
                "colors": [
                  "#17402c",
                  "#0d2a1b"
                ]
              },
              {
                "id": "turquoise",
                "label": "Turquoise (NJ0151)",
                "family": "sunray",
                "colors": [
                  "#2e9a94",
                  "#1d6b67"
                ]
              },
              {
                "id": "yellow",
                "label": "Yellow",
                "family": "sunray",
                "colors": [
                  "#d4a91e",
                  "#a37f12"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "promaster-dive",
        "label": "Promaster Dive",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "black-tool",
                "label": "Black (BN0150 / NY0040)",
                "family": "grain",
                "colors": [
                  "#141517",
                  "#282a2d"
                ]
              },
              {
                "id": "fujitsubo-blue",
                "label": "Fujitsubo deep blue (NB6021-68L)",
                "family": "lacquer",
                "colors": [
                  "#16293f",
                  "#0e1b2b"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "grand-seiko",
    "label": "Grand Seiko",
    "models": [
      {
        "id": "snowflake",
        "label": "Snowflake (SBGA211)",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "white-snowflake",
                "label": "White Snowflake",
                "family": "snow",
                "colors": [
                  "#e9eae8",
                  "#d3d5d1"
                ]
              },
              {
                "id": "ice-blue-skyflake",
                "label": "Ice blue 'Skyflake' (SBGA407)",
                "family": "snow",
                "colors": [
                  "#cfdde6",
                  "#b4c6d2"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "white-birch",
        "label": "White Birch (SLGH005)",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "white-birch",
                "label": "White Birch",
                "family": "stripes",
                "colors": [
                  "#e4e5e2",
                  "#b9bcb8"
                ]
              },
              {
                "id": "night-birch",
                "label": "Night Birch (SLGH017)",
                "family": "stripes",
                "colors": [
                  "#232526",
                  "#3c3f40"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "omiwatari",
        "label": "Omiwatari (SBGY007)",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "ice-blue",
                "label": "Ice blue",
                "family": "snow",
                "colors": [
                  "#d3dee5",
                  "#b3c2cd"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "hamilton",
    "label": "Hamilton",
    "models": [
      {
        "id": "khaki-field",
        "label": "Khaki Field",
        "types": [
          {
            "id": "mechanical",
            "label": "Mechanical (hand-wound)",
            "variants": [
              {
                "id": "matte-black",
                "label": "Matte black",
                "family": "grain",
                "colors": [
                  "#191a1c",
                  "#e8e6df"
                ]
              },
              {
                "id": "white",
                "label": "White",
                "family": "grain",
                "colors": [
                  "#e9e7e0",
                  "#1a1a1a"
                ]
              },
              {
                "id": "khaki-tan",
                "label": "Khaki tan",
                "family": "grain",
                "colors": [
                  "#b0a183",
                  "#2a2620"
                ]
              },
              {
                "id": "olive-green",
                "label": "Olive green",
                "family": "grain",
                "colors": [
                  "#4a4f3c"
                ]
              }
            ]
          },
          {
            "id": "automatic",
            "label": "Automatic",
            "variants": [
              {
                "id": "black-day-date",
                "label": "Black day-date",
                "family": "grain",
                "colors": [
                  "#17181a"
                ]
              },
              {
                "id": "dark-blue",
                "label": "Dark blue",
                "family": "sunray",
                "colors": [
                  "#16233d"
                ]
              },
              {
                "id": "khaki-green",
                "label": "Khaki green",
                "family": "sunray",
                "colors": [
                  "#3c4734",
                  "#252b1f"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "jazzmaster",
        "label": "Jazzmaster",
        "types": [
          {
            "id": "standard",
            "label": "Standard (automatic)",
            "variants": [
              {
                "id": "silver-sunray",
                "label": "Silver sunray",
                "family": "sunray",
                "colors": [
                  "#d6d6d4"
                ]
              },
              {
                "id": "blue-sunray",
                "label": "Blue sunray",
                "family": "sunray",
                "colors": [
                  "#1c3050"
                ]
              },
              {
                "id": "green-sunray",
                "label": "Green sunray",
                "family": "sunray",
                "colors": [
                  "#1f4237"
                ]
              },
              {
                "id": "black-sunray",
                "label": "Black sunray",
                "family": "sunray",
                "colors": [
                  "#141517"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "longines",
    "label": "Longines",
    "models": [
      {
        "id": "spirit",
        "label": "Spirit",
        "types": [
          {
            "id": "standard",
            "label": "Standard (automatic COSC)",
            "variants": [
              {
                "id": "matte-black",
                "label": "Matte black grained",
                "family": "grain",
                "colors": [
                  "#15171a",
                  "#e6e2d8"
                ]
              },
              {
                "id": "silver-grained",
                "label": "Silver grained",
                "family": "grain",
                "colors": [
                  "#d2d2cf"
                ]
              },
              {
                "id": "sunray-blue",
                "label": "Sunray blue",
                "family": "sunray",
                "colors": [
                  "#1b3050"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "hydroconquest",
        "label": "HydroConquest",
        "types": [
          {
            "id": "standard",
            "label": "Standard (automatic)",
            "variants": [
              {
                "id": "sunray-blue",
                "label": "Sunray blue",
                "family": "sunray",
                "colors": [
                  "#153050"
                ]
              },
              {
                "id": "sunray-black",
                "label": "Sunray black",
                "family": "sunray",
                "colors": [
                  "#101215"
                ]
              },
              {
                "id": "sunray-grey",
                "label": "Sunray grey",
                "family": "sunray",
                "colors": [
                  "#54585c"
                ]
              },
              {
                "id": "matte-green",
                "label": "Matte green",
                "family": "grain",
                "colors": [
                  "#1e3b2e"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "omega",
    "label": "Omega",
    "models": [
      {
        "id": "speedmaster-professional",
        "label": "Speedmaster Professional (Moonwatch)",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "matte-black",
                "label": "Matte black",
                "family": "grain",
                "colors": [
                  "#16181b",
                  "#e6e5e0"
                ]
              },
              {
                "id": "white-lacquer",
                "label": "White lacquer",
                "family": "lacquer",
                "colors": [
                  "#f0efea",
                  "#1a1a1a"
                ]
              },
              {
                "id": "black-white-lacquer",
                "label": "Black & white lacquer",
                "family": "lacquer",
                "colors": [
                  "#141519",
                  "#ecebe6"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "seamaster-diver-300m",
        "label": "Seamaster Diver 300M",
        "types": [
          {
            "id": "standard",
            "label": "Standard (42mm Master Chronometer)",
            "variants": [
              {
                "id": "black-wave",
                "label": "Black wave",
                "family": "guilloche",
                "colors": [
                  "#121418",
                  "#2a2d33"
                ]
              },
              {
                "id": "blue-wave",
                "label": "Blue wave",
                "family": "guilloche",
                "colors": [
                  "#1c3a5c",
                  "#0f2038"
                ]
              },
              {
                "id": "white-wave",
                "label": "White wave",
                "family": "guilloche",
                "colors": [
                  "#e9ebe9",
                  "#b9bdbd"
                ]
              },
              {
                "id": "green-wave",
                "label": "Green wave",
                "family": "guilloche",
                "colors": [
                  "#14382d",
                  "#0b2019"
                ]
              },
              {
                "id": "grey-brushed",
                "label": "Grey brushed (no-date)",
                "family": "sunray",
                "colors": [
                  "#6f7376",
                  "#4c5053"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "aqua-terra",
        "label": "Seamaster Aqua Terra 150M",
        "types": [
          {
            "id": "teak",
            "label": "Teak dial",
            "variants": [
              {
                "id": "blue-teak",
                "label": "Blue teak",
                "family": "stripes",
                "colors": [
                  "#1e4066",
                  "#12294a"
                ]
              },
              {
                "id": "black-teak",
                "label": "Black teak",
                "family": "stripes",
                "colors": [
                  "#14161a",
                  "#2b2e33"
                ]
              },
              {
                "id": "green-teak",
                "label": "Green teak",
                "family": "stripes",
                "colors": [
                  "#173a2e",
                  "#0d241c"
                ]
              },
              {
                "id": "silver-teak",
                "label": "Silver teak",
                "family": "stripes",
                "colors": [
                  "#d8d9d5",
                  "#b3b5b1"
                ]
              },
              {
                "id": "grey-teak",
                "label": "Grey teak",
                "family": "stripes",
                "colors": [
                  "#585c60",
                  "#3c4044"
                ]
              }
            ]
          },
          {
            "id": "shades",
            "label": "Shades (sun-brushed)",
            "variants": [
              {
                "id": "terracotta",
                "label": "Terracotta",
                "family": "sunray",
                "colors": [
                  "#9c5744",
                  "#6e3a2c"
                ]
              },
              {
                "id": "atlantic-blue",
                "label": "Atlantic Blue",
                "family": "sunray",
                "colors": [
                  "#3d5871",
                  "#26394c"
                ]
              },
              {
                "id": "bay-green",
                "label": "Bay Green",
                "family": "sunray",
                "colors": [
                  "#7e9084",
                  "#5a6a5f"
                ]
              },
              {
                "id": "sandstone",
                "label": "Sandstone",
                "family": "sunray",
                "colors": [
                  "#c8bca8",
                  "#a3967f"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "orient",
    "label": "Orient",
    "models": [
      {
        "id": "bambino",
        "label": "Bambino",
        "types": [
          {
            "id": "standard",
            "label": "Standard (automatic)",
            "variants": [
              {
                "id": "cream-white",
                "label": "Cream white classic",
                "family": "lacquer",
                "colors": [
                  "#ece5d8",
                  "#2b2b2b"
                ]
              },
              {
                "id": "champagne-sunray",
                "label": "Champagne sunray",
                "family": "sunray",
                "colors": [
                  "#d5bf92"
                ]
              },
              {
                "id": "blue-sunray",
                "label": "Blue sunray",
                "family": "sunray",
                "colors": [
                  "#1c3357"
                ]
              },
              {
                "id": "green-sunray",
                "label": "Green sunray",
                "family": "sunray",
                "colors": [
                  "#2d4f3f"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "kamasu",
        "label": "Kamasu",
        "types": [
          {
            "id": "standard",
            "label": "Standard (automatic)",
            "variants": [
              {
                "id": "black-sunray",
                "label": "Black sunray",
                "family": "sunray",
                "colors": [
                  "#121417"
                ]
              },
              {
                "id": "blue-sunray",
                "label": "Blue sunray",
                "family": "sunray",
                "colors": [
                  "#15355c"
                ]
              },
              {
                "id": "green-sunray",
                "label": "Green sunray",
                "family": "sunray",
                "colors": [
                  "#14392c"
                ]
              },
              {
                "id": "red-sunray",
                "label": "Burgundy red sunray",
                "family": "sunray",
                "colors": [
                  "#55161e"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "patek-philippe",
    "label": "Patek Philippe",
    "models": [
      {
        "id": "nautilus",
        "label": "Nautilus",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "blue-5811",
                "label": "Blue (5811/1G)",
                "family": "stripes",
                "colors": [
                  "#1b2d4a",
                  "#0f1626",
                  "#2e4a72"
                ]
              },
              {
                "id": "blue-black-5711",
                "label": "Blue-black gradient (5711/1A-010)",
                "family": "stripes",
                "colors": [
                  "#1d3049",
                  "#10151d"
                ]
              },
              {
                "id": "olive-green-5711",
                "label": "Olive green (5711/1A-014)",
                "family": "stripes",
                "colors": [
                  "#3a422c",
                  "#242b1a",
                  "#4d5638"
                ]
              },
              {
                "id": "white-5711",
                "label": "White opaline (5711/1A-011)",
                "family": "stripes",
                "colors": [
                  "#e4e5e1",
                  "#c6c7c2"
                ]
              },
              {
                "id": "tiffany-blue-5711",
                "label": "Tiffany blue (5711/1A-018)",
                "family": "stripes",
                "colors": [
                  "#7cc5be",
                  "#5ca39c"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "aquanaut",
        "label": "Aquanaut",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "black-5167a",
                "label": "Black embossed (5167A)",
                "family": "tapisserie",
                "colors": [
                  "#26282a",
                  "#101214"
                ]
              },
              {
                "id": "brown-5167r",
                "label": "Brown embossed (5167R)",
                "family": "tapisserie",
                "colors": [
                  "#3c2a20",
                  "#1f130c",
                  "#54392a"
                ]
              },
              {
                "id": "blue-5168g",
                "label": "Midnight blue (5168G)",
                "family": "tapisserie",
                "colors": [
                  "#16233a",
                  "#0d1421",
                  "#254060"
                ]
              },
              {
                "id": "khaki-green-5168g",
                "label": "Khaki green (5168G-010)",
                "family": "tapisserie",
                "colors": [
                  "#464c38",
                  "#2b301f"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "rolex",
    "label": "Rolex",
    "models": [
      {
        "id": "submariner",
        "label": "Submariner",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "black",
                "label": "Black (126610LN)",
                "family": "sunray",
                "colors": [
                  "#121418",
                  "#e4e4e0"
                ]
              },
              {
                "id": "green-bezel-black",
                "label": "Black / green bezel ('Starbucks', 126610LV)",
                "family": "sunray",
                "colors": [
                  "#121418",
                  "#1f6b47"
                ]
              },
              {
                "id": "bluesy",
                "label": "Blue sunburst ('Bluesy', 126613LB)",
                "family": "sunray",
                "colors": [
                  "#1b3a66",
                  "#2f5c99",
                  "#cbb578"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "datejust",
        "label": "Datejust",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "blue-sunray",
                "label": "Blue sunray",
                "family": "sunray",
                "colors": [
                  "#1d3c68",
                  "#35619e"
                ]
              },
              {
                "id": "wimbledon",
                "label": "Slate 'Wimbledon'",
                "family": "sunray",
                "colors": [
                  "#75756f",
                  "#2e5c3e",
                  "#1a1a1a"
                ]
              },
              {
                "id": "silver",
                "label": "Silver sunray",
                "family": "sunray",
                "colors": [
                  "#c6c6c1"
                ]
              },
              {
                "id": "champagne",
                "label": "Champagne sunray",
                "family": "sunray",
                "colors": [
                  "#c9b06e",
                  "#a88f52"
                ]
              },
              {
                "id": "mint-green",
                "label": "Mint green sunray",
                "family": "sunray",
                "colors": [
                  "#9dbaa3"
                ]
              },
              {
                "id": "black-sunray",
                "label": "Black sunray",
                "family": "sunray",
                "colors": [
                  "#141414",
                  "#3a3a3a"
                ]
              },
              {
                "id": "white-lacquer",
                "label": "White lacquer",
                "family": "lacquer",
                "colors": [
                  "#e8e8e4",
                  "#1a1a1a"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "oyster-perpetual",
        "label": "Oyster Perpetual",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "black",
                "label": "Black lacquer",
                "family": "lacquer",
                "colors": [
                  "#121212"
                ]
              },
              {
                "id": "blue",
                "label": "Blue lacquer",
                "family": "lacquer",
                "colors": [
                  "#1f4269"
                ]
              },
              {
                "id": "silver",
                "label": "Silver sunray",
                "family": "sunray",
                "colors": [
                  "#c6c6c2"
                ]
              },
              {
                "id": "turquoise",
                "label": "Turquoise ('Tiffany')",
                "family": "lacquer",
                "colors": [
                  "#36a5a0"
                ]
              },
              {
                "id": "candy-pink",
                "label": "Candy pink",
                "family": "lacquer",
                "colors": [
                  "#e2a1ab"
                ]
              },
              {
                "id": "green",
                "label": "Bright green",
                "family": "lacquer",
                "colors": [
                  "#1e7a41"
                ]
              },
              {
                "id": "pistachio",
                "label": "Pistachio (matte lacquer)",
                "family": "lacquer",
                "colors": [
                  "#b7c49f"
                ]
              },
              {
                "id": "lavender",
                "label": "Lavender (matte lacquer)",
                "family": "lacquer",
                "colors": [
                  "#b2a3c4"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "gmt-master-ii",
        "label": "GMT-Master II",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "pepsi",
                "label": "'Pepsi' (blue/red bezel)",
                "family": "sunray",
                "colors": [
                  "#101216",
                  "#1c3f7a",
                  "#9e2431"
                ]
              },
              {
                "id": "batman",
                "label": "'Batman' (blue/black bezel)",
                "family": "sunray",
                "colors": [
                  "#101216",
                  "#1d3f6e"
                ]
              },
              {
                "id": "sprite",
                "label": "'Sprite' (green/black, left-hand)",
                "family": "sunray",
                "colors": [
                  "#101216",
                  "#2a6b45"
                ]
              },
              {
                "id": "bruce-wayne",
                "label": "'Bruce Wayne' (grey/black bezel)",
                "family": "sunray",
                "colors": [
                  "#101216",
                  "#7d7f82"
                ]
              },
              {
                "id": "root-beer",
                "label": "'Root Beer' (brown/black, Everose)",
                "family": "sunray",
                "colors": [
                  "#101216",
                  "#5c3a28",
                  "#b78d5e"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "explorer",
        "label": "Explorer",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "black",
                "label": "Black (Explorer 36/40)",
                "family": "lacquer",
                "colors": [
                  "#131313",
                  "#e5e5e1"
                ]
              },
              {
                "id": "polar-explorer-ii",
                "label": "Polar white (Explorer II)",
                "family": "lacquer",
                "colors": [
                  "#e3e3de",
                  "#1a1a1a",
                  "#d9622c"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "daytona",
        "label": "Daytona",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "white-panda",
                "label": "White 'Panda' (126500LN)",
                "family": "lacquer",
                "colors": [
                  "#e6e6e2",
                  "#17181a"
                ]
              },
              {
                "id": "black",
                "label": "Black (126500LN)",
                "family": "lacquer",
                "colors": [
                  "#141414",
                  "#c9c9c5"
                ]
              },
              {
                "id": "green-gold",
                "label": "Green ('John Mayer', yellow gold)",
                "family": "sunray",
                "colors": [
                  "#1e5c3a",
                  "#caa860"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "seiko",
    "label": "Seiko",
    "models": [
      {
        "id": "5-sports-srpd",
        "label": "5 Sports (SRPD)",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "black-srpd55",
                "label": "Black (SRPD55)",
                "family": "grain",
                "colors": [
                  "#16171a",
                  "#2a2c30"
                ]
              },
              {
                "id": "blue-srpd51",
                "label": "Blue (SRPD51)",
                "family": "sunray",
                "colors": [
                  "#1b3866",
                  "#0f2242"
                ]
              },
              {
                "id": "green-srpd63",
                "label": "Green (SRPD63)",
                "family": "sunray",
                "colors": [
                  "#17382b",
                  "#0d2419"
                ]
              },
              {
                "id": "orange",
                "label": "Orange",
                "family": "lacquer",
                "colors": [
                  "#c05a1d",
                  "#8f3f12"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "presage-cocktail-time",
        "label": "Presage Cocktail Time",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "cool-silver",
                "label": "Cool silver (SRPB43)",
                "family": "sunray",
                "colors": [
                  "#d9dbd9",
                  "#a9adad"
                ]
              },
              {
                "id": "blue-moon",
                "label": "Blue Moon (SRPB41)",
                "family": "sunray",
                "colors": [
                  "#3d5a8f",
                  "#16294d"
                ]
              },
              {
                "id": "old-fashioned",
                "label": "Old Fashioned amber (SRPB44)",
                "family": "sunray",
                "colors": [
                  "#96682a",
                  "#402a10"
                ]
              },
              {
                "id": "skydiving",
                "label": "Skydiving pale blue",
                "family": "guilloche",
                "colors": [
                  "#a8c4d8",
                  "#7fa2bc"
                ]
              },
              {
                "id": "mockingbird",
                "label": "Mockingbird green",
                "family": "guilloche",
                "colors": [
                  "#2c5940",
                  "#10281c"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "prospex-spb-62mas",
        "label": "Prospex 62MAS Diver (SPB)",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "gray-spb143",
                "label": "Gray (SPB143)",
                "family": "sunray",
                "colors": [
                  "#6e7276",
                  "#44474b"
                ]
              },
              {
                "id": "blue-spb149",
                "label": "Blue (SPB149)",
                "family": "sunray",
                "colors": [
                  "#26456e"
                ]
              },
              {
                "id": "brown-gilt-spb147",
                "label": "Brown gilt (SPB147)",
                "family": "sunray",
                "colors": [
                  "#43301e",
                  "#b08d4a"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "prospex-turtle",
        "label": "Prospex Turtle",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "black-srp777",
                "label": "Black (SRP777)",
                "family": "grain",
                "colors": [
                  "#151618",
                  "#2b2d30"
                ]
              },
              {
                "id": "blue-srp773",
                "label": "Blue (SRP773)",
                "family": "grain",
                "colors": [
                  "#1a2c4d",
                  "#0f1c33"
                ]
              },
              {
                "id": "black-gilt-srp775",
                "label": "Black gilt (SRP775)",
                "family": "grain",
                "colors": [
                  "#131416",
                  "#b08d4a"
                ]
              },
              {
                "id": "padi-blue",
                "label": "PADI blue (SRPA21)",
                "family": "sunray",
                "colors": [
                  "#1f4373",
                  "#122a4c"
                ]
              }
            ]
          },
          {
            "id": "king-turtle",
            "label": "King Turtle (waffle dial)",
            "variants": [
              {
                "id": "black-waffle",
                "label": "Black waffle (SRPE03)",
                "family": "tapisserie",
                "colors": [
                  "#141519",
                  "#26282d"
                ]
              },
              {
                "id": "gray-save-the-ocean",
                "label": "Gray 'Save the Ocean'",
                "family": "tapisserie",
                "colors": [
                  "#5d6871",
                  "#333a40"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "prospex-samurai",
        "label": "Prospex Samurai",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "black-srpb51",
                "label": "Black (SRPB51)",
                "family": "grain",
                "colors": [
                  "#16171a",
                  "#2a2c2f"
                ]
              },
              {
                "id": "blue-srpb49",
                "label": "Blue (SRPB49)",
                "family": "sunray",
                "colors": [
                  "#1d3c68",
                  "#102344"
                ]
              },
              {
                "id": "padi-blue-srpb99",
                "label": "PADI blue (SRPB99)",
                "family": "sunray",
                "colors": [
                  "#1f4173",
                  "#12294e"
                ]
              }
            ]
          },
          {
            "id": "king-samurai",
            "label": "King Samurai (waffle dial)",
            "variants": [
              {
                "id": "black-waffle",
                "label": "Black waffle (SRPE33)",
                "family": "tapisserie",
                "colors": [
                  "#141519",
                  "#26282d"
                ]
              },
              {
                "id": "gray-save-the-ocean",
                "label": "Gray 'Save the Ocean'",
                "family": "tapisserie",
                "colors": [
                  "#5d6871",
                  "#333a40"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "swatch",
    "label": "Swatch",
    "models": [
      {
        "id": "moonswatch",
        "label": "MoonSwatch (Omega x Swatch)",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "mission-to-the-moon",
                "label": "Mission to the Moon (black/grey)",
                "family": "grain",
                "colors": [
                  "#1c1d1f",
                  "#8b8d90"
                ]
              },
              {
                "id": "mission-to-mercury",
                "label": "Mission to Mercury (dark grey)",
                "family": "grain",
                "colors": [
                  "#43464a",
                  "#1e1f21"
                ]
              },
              {
                "id": "mission-to-neptune",
                "label": "Mission to Neptune (deep blue)",
                "family": "grain",
                "colors": [
                  "#1f2a5c"
                ]
              },
              {
                "id": "mission-to-uranus",
                "label": "Mission to Uranus (ice blue)",
                "family": "grain",
                "colors": [
                  "#a7c8dd"
                ]
              },
              {
                "id": "mission-to-mars",
                "label": "Mission to Mars (white/red)",
                "family": "grain",
                "colors": [
                  "#e6e4df",
                  "#b03a30"
                ]
              },
              {
                "id": "mission-to-jupiter",
                "label": "Mission to Jupiter (sandy beige)",
                "family": "grain",
                "colors": [
                  "#c4ad8c",
                  "#c2622e"
                ]
              },
              {
                "id": "mission-to-the-sun",
                "label": "Mission to the Sun (golden yellow)",
                "family": "grain",
                "colors": [
                  "#cfa036"
                ]
              },
              {
                "id": "mission-to-venus",
                "label": "Mission to Venus (pink)",
                "family": "grain",
                "colors": [
                  "#dcb6c0"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "tissot",
    "label": "Tissot",
    "models": [
      {
        "id": "prx",
        "label": "PRX",
        "types": [
          {
            "id": "quartz",
            "label": "Quartz",
            "variants": [
              {
                "id": "blue-sunray",
                "label": "Blue sunray",
                "family": "sunray",
                "colors": [
                  "#142845",
                  "#0b1830"
                ]
              },
              {
                "id": "black-sunray",
                "label": "Black sunray",
                "family": "sunray",
                "colors": [
                  "#131417",
                  "#2a2c30"
                ]
              },
              {
                "id": "green-sunray",
                "label": "Green sunray",
                "family": "sunray",
                "colors": [
                  "#123527",
                  "#0a2118"
                ]
              },
              {
                "id": "light-blue-sunray",
                "label": "Light blue sunray",
                "family": "sunray",
                "colors": [
                  "#a9c5d4",
                  "#7fa2b4"
                ]
              },
              {
                "id": "gold-sunray",
                "label": "Gold / champagne sunray",
                "family": "sunray",
                "colors": [
                  "#c9a86b",
                  "#a1824c"
                ]
              },
              {
                "id": "red-sunburst",
                "label": "Red sunburst",
                "family": "sunray",
                "colors": [
                  "#921f24",
                  "#5e1114"
                ]
              }
            ]
          },
          {
            "id": "powermatic-80",
            "label": "Powermatic 80 (automatic)",
            "variants": [
              {
                "id": "blue-waffle",
                "label": "Blue waffle",
                "family": "tapisserie",
                "colors": [
                  "#14284a",
                  "#0b1832"
                ]
              },
              {
                "id": "black-waffle",
                "label": "Black waffle",
                "family": "tapisserie",
                "colors": [
                  "#131418",
                  "#2b2d31"
                ]
              },
              {
                "id": "green-waffle",
                "label": "Green waffle",
                "family": "tapisserie",
                "colors": [
                  "#123227",
                  "#0a2018"
                ]
              },
              {
                "id": "ice-blue-waffle",
                "label": "Ice blue waffle",
                "family": "tapisserie",
                "colors": [
                  "#b4c9d2",
                  "#8aa6b2"
                ]
              },
              {
                "id": "champagne-waffle",
                "label": "Champagne waffle (gold PVD)",
                "family": "tapisserie",
                "colors": [
                  "#c9a86b",
                  "#a1824c"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "seastar-1000",
        "label": "Seastar 1000",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "graded-grey-black",
                "label": "Graded grey-black",
                "family": "sunray",
                "colors": [
                  "#1a1c1f",
                  "#0a0b0d"
                ]
              },
              {
                "id": "blue-gradient",
                "label": "Blue gradient",
                "family": "sunray",
                "colors": [
                  "#16345c",
                  "#0b1a30"
                ]
              },
              {
                "id": "green-gradient",
                "label": "Green gradient",
                "family": "sunray",
                "colors": [
                  "#144c3a",
                  "#08281e"
                ]
              },
              {
                "id": "turquoise-gradient",
                "label": "Turquoise gradient",
                "family": "sunray",
                "colors": [
                  "#17727a",
                  "#0c3a3f"
                ]
              },
              {
                "id": "black",
                "label": "Black",
                "family": "sunray",
                "colors": [
                  "#131417",
                  "#26282c"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "tudor",
    "label": "Tudor",
    "models": [
      {
        "id": "black-bay-58",
        "label": "Black Bay 58",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "black-gilt",
                "label": "Black with gilt",
                "family": "grain",
                "colors": [
                  "#16171a",
                  "#b9935a"
                ]
              },
              {
                "id": "navy-blue",
                "label": "Navy blue",
                "family": "grain",
                "colors": [
                  "#1e2c4a",
                  "#c9c9c9"
                ]
              },
              {
                "id": "burgundy",
                "label": "Burgundy sunburst (2025)",
                "family": "sunray",
                "colors": [
                  "#4c2230",
                  "#6e2f3c"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "black-bay",
        "label": "Black Bay (41)",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "burgundy-bezel-black",
                "label": "Black / burgundy bezel",
                "family": "grain",
                "colors": [
                  "#17181b",
                  "#5a2430",
                  "#b9935a"
                ]
              },
              {
                "id": "monochrome-black",
                "label": "Monochrome black",
                "family": "grain",
                "colors": [
                  "#17181b",
                  "#c9c9c5"
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "pelagos",
        "label": "Pelagos",
        "types": [
          {
            "id": "standard",
            "label": "Standard",
            "variants": [
              {
                "id": "pelagos-42-blue",
                "label": "Pelagos 42 Blue (matte)",
                "family": "grain",
                "colors": [
                  "#1f3d63",
                  "#2f5c92"
                ]
              },
              {
                "id": "pelagos-42-black",
                "label": "Pelagos 42 Black (matte)",
                "family": "grain",
                "colors": [
                  "#16181b",
                  "#d9d9d5"
                ]
              },
              {
                "id": "pelagos-39-black",
                "label": "Pelagos 39 Black (sunray satin)",
                "family": "sunray",
                "colors": [
                  "#131519",
                  "#3c4046"
                ]
              },
              {
                "id": "fxd-navy",
                "label": "Pelagos FXD Navy (matte)",
                "family": "grain",
                "colors": [
                  "#1c2a47",
                  "#cfd2d6"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export function findVariant(
  brandId: string,
  modelId: string,
  typeId: string,
  variantId: string,
): { brand: CatalogBrand; model: CatalogModel; type: CatalogType; variant: CatalogVariant } | null {
  const brand = CATALOG.find((b) => b.id === brandId);
  const model = brand?.models.find((m) => m.id === modelId);
  const type = model?.types.find((t) => t.id === typeId);
  const variant = type?.variants.find((v) => v.id === variantId);
  return brand && model && type && variant ? { brand, model, type, variant } : null;
}
