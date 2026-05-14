const PET_TYPES = {
    wolfy: {
        name: "Wolfy",
        species: "wolfy",
        isStarter: true,
        animationOffsets: {
            feed:  { bottom: "90px", left: "32%" },
            brush: { bottom: "270px", right: "45%" },
            ball:  { bottom: "100px", left: "25%" },
            accessories: {
                "Bow": { top: "90px", width: "50px", left: "50%" },
            },
        },
    },
    pengu: {
        name: "Pengu",
        species: "pengu",
        isStarter: true,
        animationOffsets: {
            feed:  { bottom: "90px", left: "32%" },
            brush: { bottom: "270px", right: "41%" },
            ball:  { bottom: "145px", left: "25%" },
            accessories: {
                "Bow": { top: "87px", width: "50px", left: "48%" },
            },
        },
    },
    snazake: {
        name: "Snazake",
        species: "snazake",
        isStarter: true,
        animationOffsets: {
            feed:  { bottom: "80px", left: "22%" },
            brush: { bottom: "310px", right: "42%" },
            ball:  { bottom: "90px", left: "25%" },
            accessories: {
                "Bow": { top: "35px", width: "50px", left: "35%" },
            },
        },
    },
};

module.exports = PET_TYPES;