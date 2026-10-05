const PET_TYPES = {
    wolfy: {
        name: "Wolfy",
        species: "wolfy",
        isStarter: true,
        artFacing: "left",
        animationOffsets: {
            feed:  { bottom: "90px", left: "32%" },
            brush: { bottom: "270px", right: "45%" },
            ball:  { bottom: "100px", left: "25%" },
            book:  { bottom: "100px", left: "25%" },
            anchors: {
                headTop:  { x: "40.6%", y: "33.6%" },
                headSide: { x: "52.8%",   y: "35.9%"   },
                eyes:     { x: "39.3%",    y: "48.2%"  },
                body:     { x: "55.1%",   y: "65%"   },
                ground:   { x: "54.3%", y: "82.8%" },
            },
            accessoryOverrides: {
                "Bow": {
                    headTop:  { x: "40.4%", y: "33.2%", width: "18%" },
                    headSide: { x: "55%", y: "36%", width: "18%" },
                },
                "Butterfly Pin": {
                    headTop:  { x: "44.3%", y: "42.1%", width: "60%" }, 
                    headSide: { x: "56.3%", y: "43.8%", width: "60%" }, 
                },
                "Lightning Scar": { 
                    eyes: { x: "39.9%", y: "45.6%", width: "50%" }, 
                },
                "Phoenix Feather": {
                    headTop: { x: "26.3%", y: "44.1%", width: "50%", flipX: true },
                    headSide: { x: "49.0%", y: "43.2%", width: "50%", flipX: true },
                },
                "Reading Glasses": {
                    eyes: { x: "31.3%", y: "42.4%", width: "100%" }
                },
                "Silver Monocle": { 
                    eyes: { x: "32.5%", y: "47.4%", width: "65%"}, 
                },
            },
            shadow: { bottom: "17.2%", width: "26.9%", left: "54.3%" },
        },
    },
    pengu: {
        name: "Pengu",
        species: "pengu",
        isStarter: true,
        artFacing: "left",
        animationOffsets: {
            feed:  { bottom: "90px", left: "32%" },
            brush: { bottom: "270px", right: "41%" },
            ball:  { bottom: "145px", left: "25%" },
            book:  { bottom: "145px", left: "25%" },
            anchors: {
                headTop:  { x: "48%",   y: "32.9%" },
                headSide: { x: "60.1%", y: "37.6%"  },
                eyes:     { x: "50%",    y: "50%"  },
                body:     { x: "50%",   y: "62%"   },
                ground:   { x: "47.6%", y: "75.5%" },
            },
            accessoryOverrides: {
                "Bow": {
                    headTop:  { x: "48%", y: "32.9%", width: "18%" },
                    headSide: { x: "60.1%", y: "37.6%", width: "12%" },
                },
                "Butterfly Pin": { 
                    headTop: { x: "50.1%", y: "39.7%", width: "49%" },
                    headSide: { x: "64.6%", y: "44.4%", width: "49%" }, 
                },
                "Lightning Scar": { 
                    eyes: { x: "46.0%", y: "43.5%", width: "60%" }, 
                },
                "Phoenix Feather": {
                    headTop: { x: "45.7%", y: "39.4%", width: "42.5%", flipX: true },
                    headSide: { x: "56.3%", y: "45.6%", width: "42.5%", flipX: true },
                },
                "Reading Glasses": {
                    eyes: { x: "37.8%", y: "34.4%", width: "100%" }
                },
                "Silver Monocle": { 
                    eyes: { x: "50.1%", y: "39.1%", width: "68.5%" }, 
                },
            },
            shadow: { bottom: "24.5%", width: "34.0%", left: "47.6%" },
        },
    },
    snazake: {
        name: "Snazake",
        species: "snazake",
        isStarter: true,
        artFacing: "left",
        animationOffsets: {
            feed:  { bottom: "80px", left: "22%" },
            brush: { bottom: "310px", right: "42%" },
            ball:  { bottom: "90px", left: "25%" },
            book:  { bottom: "90px", left: "25%" },
            anchors: {
                headTop:  { x: "35%",   y: "17.6%" },
                headSide: { x: "53%",   y: "29%"   },
                eyes:     { x: "50%",    y: "50%"  },
                body:     { x: "28.6%", y: "58.2%" },
                ground:   { x: "55.7%", y: "95.8%" },
            },
            accessoryOverrides: {
                "Bow": {
                    headTop:  { x: "35%", y: "17.6%", width: "18%" },
                    headSide: { x: "53%", y: "29%", width: "18%" },
                },
                "Butterfly Pin": { 
                    headTop: { x: "70.1%", y: "23.2%", width: "49%" },
                    headSide: { x: "56.6%", y: "33.5%", width: "49%" }, 
                },
                "Lightning Scar": { 
                    eyes: { x: "31.6%", y: "32.9%", width: "60%" }, 
                },
                "Phoenix Feather": {
                    headTop: { x: "64.6%", y: "22.1%", width: "42.5%", flipX: true },
                    headSide: { x: "52.5%", y: "39.7%", width: "42.5%", flipX: true },
                },
                "Reading Glasses": {
                    eyes: { x: "23.4%", y: "26.5%", width: "100%" }
                },
                "Silver Monocle": { 
                    eyes: { x: "36.6%", y: "30.0%", width: "68.5%" }, 
                },
            },
            shadow: { bottom: "4.2%",  width: "51.6%", left: "55.7%" },
        },
    },
    slimepet: {
        name: "Slime",
        species: "slimepet",
        isStarter: false,
        artFacing: "right",
        animationOffsets: {
            feed:  { bottom: "90px", left: "32%" },
            brush: { bottom: "270px", right: "45%" },
            ball:  { bottom: "100px", left: "25%" },
            book:  { bottom: "100px", left: "25%" },
            anchors: {
                headTop:  { x: "50%",   y: "33.8%" },
                headSide: { x: "37.6%", y: "43%" },
                eyes:     { x: "50%",   y: "50%"  },
                body:     { x: "50%",   y: "62%"   },
                ground:   { x: "49.9%", y: "77.8%" },
            },
            accessoryOverrides: {
                "Bow": {
                    headTop:  { x: "50%", y: "33.8%", width: "18%" },
                    headSide: { x: "37.6%", y: "43%", width: "18%" },
                },
                "Butterfly Pin": { 
                    headTop: { x: "53.7%", y: "43.5%", width: "70.5%" },
                    headSide: { x: "43.7%", y: "51.5%", width: "70.5%" }, 
                },
                "Lightning Scar": { 
                    eyes: { x: "53.7%", y: "45.6%", width: "70%" }, 
                },
                "Phoenix Feather": {
                    headTop: { x: "53.1%", y: "24.4%", width: "62%" },
                    headSide: { x: "43.1%", y: "43.5%", width: "62%" },
                },
                "Reading Glasses": {
                    eyes: { x: "47.8%", y: "48.5%", width: "77.5%" }
                },
                "Silver Monocle": { 
                    eyes: { x: "48.7%", y: "52.4%", width: "54%" }, 
                },
            },
            shadow: { bottom: "22.2%", width: "52.8%", left: "49.9%" },
        },

    },
    prickling: {
        name: "Prickling",
        species: "prickling",
        isStarter: false,
        artFacing: "left",
        animationOffsets: {
            feed:  { bottom: "90px", left: "32%" },
            brush: { bottom: "270px", right: "45%" },
            ball:  { bottom: "100px", left: "25%" },
            book:  { bottom: "100px", left: "25%" },
            anchors: {
                headTop:  { x: "50%",   y: "33.8%" },
                headSide: { x: "63%",   y: "54.3%" },
                eyes:     { x: "50%",    y: "50%"  },
                body:     { x: "44.6%", y: "79%"   },
                ground:   { x: "51.8%", y: "89.6%" },
            },
            accessoryOverrides: {
                "Bow": {
                    headTop:  { x: "50%", y: "33.8%", width: "18%" },
                    headSide: { x: "63%", y: "54.3%", width: "18%" },
                },
                "Butterfly Pin": { 
                    headTop: { x: "62.2%", y: "49.7%", width: "60%" },
                    headSide: { x: "68.1%", y: "64.7%", width: "60%" }, 
                },
                "Lightning Scar": { 
                    eyes: { x: "44.9%", y: "65.3%", width: "63.5%" }, 
                },
                "Phoenix Feather": {
                    headTop: { x: "59.6%", y: "37.4%", width: "54.5%", flipX: true },
                    headSide: { x: "59.6%", y: "60.6%", width: "54.5%", flipX: true },
                },
                "Reading Glasses": {
                    eyes: { x: "38.4%", y: "65.9%", width: "68.5%" }
                },
                "Silver Monocle": { 
                    eyes: { x: "53.7%", y: "65.0%", width: "89%" }, 
                },
            },
            shadow: { bottom: "10.4%", width: "39.8%", left: "51.8%" },
        },  
    },
    dustbunny: {
        name: "Dust Bunny",
        species: "dustbunny",
        isStarter: false,
        artFacing: "left",
        animationOffsets: {
            feed:  { bottom: "90px", left: "32%" },
            brush: { bottom: "270px", right: "45%" },
            ball:  { bottom: "100px", left: "25%" },
            book:  { bottom: "100px", left: "25%" },
            anchors: {
                headTop:  { x: "44.9%", y: "33.5%" },
                headSide: { x: "64%",   y: "39.5%" },
                eyes:     { x: "50%",    y: "50%"  },
                body:     { x: "42.4%", y: "75.2%" },
                ground:   { x: "48.4%", y: "87.9%" },
            },
            accessoryOverrides: {
                "Bow": {
                    headTop:  { x: "44.9%", y: "33.5%", width: "18%" },
                    headSide: { x: "64%", y: "39.5%", width: "18%" },
                },
                "Butterfly Pin": { 
                    headTop: { x: "49.3%", y: "36.2%", width: "60%" },
                    headSide: { x: "67.2%", y: "48.5%", width: "60%" }, 
                },
                "Lightning Scar": { 
                    eyes: { x: "42.8%", y: "52.6%", width: "100%" }, 
                },
                "Phoenix Feather": {
                    headTop: { x: "37.8%", y: "37.6%", width: "54.5%", flipX: true },
                    headSide: { x: "65.7%", y: "46.5%", width: "54.5%", flipX: true },
                },
                "Reading Glasses": {
                    eyes: { x: "39.0%", y: "51.5%", width: "45.5%" }
                },
                "Silver Monocle": { 
                    eyes: { x: "51.6%", y: "49.1%", width: "84.5%" }, 
                },
            },
            shadow: { bottom: "12.1%", width: "50.8%", left: "48.4%" },
        },
    },
    babydragon: {
        name: "Baby Dragon",
        species: "babydragon",
        isStarter: false,
        artFacing: "right",
        animationOffsets: {
            feed:  { bottom: "90px", left: "32%" },
            brush: { bottom: "270px", right: "45%" },
            ball:  { bottom: "100px", left: "25%" },
            book:  { bottom: "100px", left: "25%" },
            anchors: {
                headTop:  { x: "62.2%", y: "22.3%" },
                headSide: { x: "50%",   y: "33.8%" },
                eyes:     { x: "50%",    y: "50%"  },
                body:     { x: "55.3%", y: "65.2%" },
                ground:   { x: "43.1%", y: "87.6%" },
            },
            accessoryOverrides: {
                "Bow": {
                    headTop:  { x: "62.2%", y: "22.3%", width: "18%" },
                    headSide: { x: "50%", y: "33.8%", width: "18%" },
                },
                "Butterfly Pin": { 
                    headTop: { x: "71.6%", y: "37.9%", width: "60%" },
                    headSide: { x: "56.3%", y: "43.8%", width: "60%" }, 
                },
                "Lightning Scar": { 
                    eyes: { x: "66.9%", y: "41.2%", width: "76%" }, 
                },
                "Phoenix Feather": {
                    headTop: { x: "65.4%", y: "28.2%", width: "60%" },
                    headSide: { x: "55.7%", y: "43.5%", width: "60%" },
                },
                "Reading Glasses": {
                    eyes: { x: "63.4%", y: "39.1%", width: "75.5%" }
                },
                "Silver Monocle": { 
                    eyes: { x: "58.1%", y: "40.9%", width: "73%" }, 
                },
            },
            shadow: { bottom: "4.4%", width: "22.8%", left: "43.1%" },
        },
    },
};

module.exports = PET_TYPES;