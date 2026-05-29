// data.jsx — Walsh family fake data for the UI kit
const FAMILY = {
  people: {
    'sw': { id:'sw', given:'Sarah', family:'Walsh', dates:'b. 1991', loc:'Boston, MA', status:'living', rel:'You', initials:'SW', bio:'Started this tree on a quiet Sunday in November. Wanted to know where the bread recipe came from.' },
    'mw': { id:'mw', given:'Margaret', middle:'Eileen', family:'Walsh', dates:'1932 – 2011', loc:'Cork, Ireland', status:'deceased', rel:'Grandmother', initials:'MW', bio:'Kept a garden on Maple Street and made the best brown bread in the county. On Sunday afternoons the kitchen smelled of yeast and warm butter, and the radio was always tuned to the same station.' },
    'jw': { id:'jw', given:'James', family:'Walsh', dates:'1928 – 2003', loc:'Cork, Ireland', status:'deceased', rel:'Grandfather', initials:'JW', bio:'Carpenter by trade. Built the kitchen table that still sits in the dining room.' },
    'pw': { id:'pw', given:'Patrick', family:'Walsh', dates:'b. 1962', loc:'Boston, MA', status:'living', rel:'Father', initials:'PW', bio:'Moved to Boston at twenty. Still calls home every Sunday.' },
    'aw': { id:'aw', given:'Anne', family:'Reilly', dates:'b. 1964', loc:'Boston, MA', status:'living', rel:'Mother', initials:'AR', bio:'Met Patrick at a wedding in Galway. Married eleven months later.' },
    'tw': { id:'tw', given:'Thomas', family:'Walsh', dates:'b. 1989', loc:'Brooklyn, NY', status:'living', rel:'Brother', initials:'TW', bio:'' },
    'er': { id:'er', given:'Eileen', family:'Reilly', dates:'1935 – 2018', loc:'Galway, Ireland', status:'deceased', rel:'Grandmother', initials:'ER', bio:'' },
    'cr': { id:'cr', given:'Cormac', family:'Reilly', dates:'1930 – 1998', loc:'Galway, Ireland', status:'deceased', rel:'Grandfather', initials:'CR', bio:'' },
  },
  // edges: [from, to, type]
  edges: [
    ['mw','pw','parent'], ['jw','pw','parent'],
    ['er','aw','parent'], ['cr','aw','parent'],
    ['pw','sw','parent'], ['aw','sw','parent'],
    ['pw','tw','parent'], ['aw','tw','parent'],
    ['mw','jw','spouse'], ['er','cr','spouse'],
    ['pw','aw','spouse'],
  ],
  memories: [
    { id:'m1', personId:'mw', title:'Sunday afternoons', excerpt:'The kitchen smelled of yeast and warm butter, and the radio was always tuned to the same station.', date:'Summer 1967', tags:['Childhood','Cork'], year:1967 },
    { id:'m2', personId:'mw', title:'Brown bread recipe', excerpt:'She wrote it on the back of a grocery list. The handwriting bends a little where the pen ran out of ink halfway through the buttermilk.', date:'1985', tags:['Recipes','Heirlooms'], year:1985 },
    { id:'m3', personId:'mw', title:'The garden on Maple Street', excerpt:'Cabbages on the left, sweet peas climbing the fence, and one stubborn rose her father had planted in 1958.', date:'Spring 1972', tags:['Cork','Garden'], year:1972 },
    { id:'m4', personId:'jw', title:'The kitchen table', excerpt:'Built it the winter before they were married. Said the legs took longer than the marriage proposal.', date:'1955', tags:['Heirlooms'], year:1955 },
  ],
  activity: [
    { who:'Thomas', action:'added a memory', target:'Margaret Walsh', when:'2 days ago' },
    { who:'You',     action:'uploaded 3 photos to', target:'Cork, Ireland', when:'5 days ago' },
    { who:'Patrick', action:'updated dates for', target:'James Walsh', when:'1 week ago' },
  ],
};
window.FAMILY = FAMILY;
