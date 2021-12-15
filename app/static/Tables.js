export const spellSchoolTable = {
    A : "Abjuration",
    C : "Conjuration",
    D : "Divination",
    E : "Enchantment",
    I : "Illusion",
    N : "Necromancy",
    T : "Transmutation",
    V : "Evocation",
}


export const convertSpellSchool = (key, val) => {
    if (key === null) {
        for (const k of Object.keys(spellSchoolTable)) {
            if (spellSchoolTable[k] === val) {
                return k;
            }
        }
        return null;
    } else {
        return spellSchoolTable[key];
    }


}