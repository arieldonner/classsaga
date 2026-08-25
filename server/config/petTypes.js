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
            accessories: {
                "Bow": { top: "90px", width: "50px", left: "50%" },
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
            accessories: {
                "Bow": { top: "87px", width: "50px", left: "48%" },
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
            accessories: {
                "Bow": { top: "35px", width: "50px", left: "35%" },
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
            accessories: {
                "Bow": { top: "90px", width: "50px", left: "50%" },
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
            accessories: {
                "Bow": { top: "90px", width: "50px", left: "50%" },
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
            accessories: {
                "Bow": { top: "90px", width: "50px", left: "50%" },
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
            accessories: {
                "Bow": { top: "90px", width: "50px", left: "50%" },
            },
            shadow: { bottom: "12.4%", width: "22.8%", left: "43.1%" },
        },
    },
};

module.exports = PET_TYPES;