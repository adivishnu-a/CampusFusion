import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        campSky: "#C3EBFA",
        campSkyLight: "#EDF9FD",
        campPurple: "#CFCEFF",
        campPurpleLight: "#F1F0FF",
        campYellow: "#FAE27C",
        campYellowLight: "#FEFCE8",
        campDarwinCobaltBlue: "#0183ff",
        campDarwinSignalBlue: "#003b73",
        campDarwinCharcoal: "#1F2431",
        campDarwinCandyPeach: "#Fc6a6b",
        campDarwinZincYellow: "#Fddb5d",
        campDarwinPastelBlue: "#Edf6ff",
        campDarwinPastelPeach: "#Fff4f4",
        campDarwinCornSilk: "#Fdfbf4",
        campDarwinPureWhite: "#FFFFFF",
        campDarwinPastelCobaltBlue: "#ebfafb",
        campDarwinPastelSignalBlue: "#8ea3bf",
        campDarwinPastelCandyPeach: "#f9f2ff",
        campDarwinPastelZincYellow: "#fff8e5",
        campDarwinPastelOrange: "#fff4e9",
        campDarwinPastelSlateGray: "#F3F5F9"
      },
    },
  },
  plugins: [],
};
export default config;
