/* ===========================================================================
   AGA TEACHING BANK — Screen Hop 3D
   This is NOT a quiz bank. Each grade gets ONE full module from AGA-CUR-001,
   broken into its registry lessons. One board = one lesson.
   The 4 checkpoints on a board follow gradual release of responsibility:
       I  = teach + near-identical item   (S.P.A.R.K. shows a worked example)
       WE = guided, hint shown up front
       YOU= independent, no hint until wrong
       APPLY = transfer / word problem

   Wrong answer -> reteach card (a DIFFERENT explanation) + parallel item.
   Answer is only revealed after a second miss.

   Every lesson carries its registry lesson id and skill id so mastery data
   maps straight back to the curriculum.
=========================================================================== */
(function(){

const T = {};

/* ======================= GRADE 3 — M3.1 ======================= */
T[3] = {
  module:'M3.1', title:'Operations, Multiplication, Division & Patterns',
  lessons:[
    { id:'M3.1.1', sk:'SK-M3-101', name:'Build Equal Groups',
      teach:{ head:'Multiplication is equal groups',
        body:'3 baskets with 4 apples each is 3 groups of 4.\n\n🧺🍎🍎🍎🍎  🧺🍎🍎🍎🍎  🧺🍎🍎🍎🍎\n\nCount them: 4 + 4 + 4 = 12.\nThe short way to write it is 3 × 4 = 12.',
        key:'"Groups × how many in each group = total"' },
      reteach:{ head:'Try it as repeated adding',
        body:'Multiplication is just fast adding of the SAME number.\n\n5 × 2 means five 2s:\n2 + 2 + 2 + 2 + 2 = 10\n\nSo 5 × 2 = 10. Count the groups, then add that number that many times.' },
      I:[  {q:'2 baskets have 4 apples each. How many apples?',choices:['8','6','4','10'],correct:0,hint:'4 + 4'},
           {q:'3 boxes have 2 chips each. How many chips?',choices:['6','5','3','8'],correct:0,hint:'2 + 2 + 2'} ],
      WE:[ {q:'4 groups of 5 = ?',choices:['20','9','15','25'],correct:0,hint:'5 + 5 + 5 + 5'},
           {q:'3 groups of 6 = ?',choices:['18','9','12','21'],correct:0,hint:'6 + 6 + 6'} ],
      YOU:[{q:'6 × 4 = ?',choices:['24','10','20','28'],correct:0,hint:'Six 4s: 4,8,12,16,20,24.'},
           {q:'7 × 3 = ?',choices:['21','10','18','24'],correct:0,hint:'Seven 3s: 3,6,9,12,15,18,21.'} ],
      APPLY:[{q:'Maya packs 5 bags. She puts 6 data chips in each bag. How many chips total?',choices:['30','11','25','36'],correct:0,hint:'5 groups of 6.'},
             {q:'A shelf holds 4 rows of 8 circuit boards. How many boards?',choices:['32','12','24','40'],correct:0,hint:'4 groups of 8.'} ] },

    { id:'M3.1.2', sk:'SK-M3-102', name:'Read and Draw Arrays',
      teach:{ head:'An array is a neat grid',
        body:'An array lines objects up in rows and columns.\n\n● ● ● ●\n● ● ● ●\n● ● ● ●\n\nThat is 3 rows of 4 = 3 × 4 = 12 dots.\nYou never have to count one by one.',
        key:'"Rows × columns = total"' },
      reteach:{ head:'Count one row, then the rows',
        body:'Look at just the TOP row and count it. That is your second number.\nThen count how many rows there are. That is your first number.\n\n5 rows, 2 in each row → 5 × 2 = 10.' },
      I:[  {q:'An array has 2 rows of 3. How many dots?',choices:['6','5','9','8'],correct:0,hint:'2 rows × 3 columns'},
           {q:'An array has 3 rows of 3. How many dots?',choices:['9','6','12','3'],correct:0,hint:'3 rows × 3 columns'} ],
      WE:[ {q:'An array has 5 rows of 4. How many dots?',choices:['20','9','16','24'],correct:0,hint:'Rows times columns: 5 × 4'},
           {q:'An array has 4 rows of 6. How many dots?',choices:['24','10','18','30'],correct:0,hint:'Rows times columns: 4 × 6'} ],
      YOU:[{q:'An array has 5 rows of 6 dots. How many dots?',choices:['30','11','25','35'],correct:0,hint:'5 × 6'},
           {q:'An array has 7 rows of 4 dots. How many dots?',choices:['28','11','24','32'],correct:0,hint:'7 × 4'} ],
      APPLY:[{q:'A memory chip has 8 rows of 5 cells. How many cells?',choices:['40','13','35','45'],correct:0,hint:'8 rows × 5 columns.'},
             {q:'Natalia arranges 24 tiles into 4 equal rows. How many in each row?',choices:['6','4','8','12'],correct:0,hint:'4 × ? = 24'} ] },

    { id:'M3.1.3', sk:'SK-M3-103', name:'Connect Multiplication and Division',
      teach:{ head:'Division is multiplication backwards',
        body:'12 ÷ 3 asks: "3 times WHAT equals 12?"\n\n3 × ? = 12\n3 × 4 = 12 ✔\n\nSo 12 ÷ 3 = 4.\nEvery division fact hides a multiplication fact.',
        key:'"Division finds the missing factor"' },
      reteach:{ head:'Share it out into groups',
        body:'15 ÷ 5 means: share 15 things into 5 equal groups.\n\nDeal them out one at a time:\nGroup1 ●●●  Group2 ●●●  Group3 ●●●  Group4 ●●●  Group5 ●●●\n\nEach group got 3. So 15 ÷ 5 = 3.' },
      I:[  {q:'8 ÷ 2 = ? Think: 2 × ? = 8',choices:['4','2','6','3'],correct:0,hint:'2 × 4 = 8'},
           {q:'9 ÷ 3 = ? Think: 3 × ? = 9',choices:['3','2','6','9'],correct:0,hint:'3 × 3 = 9'} ],
      WE:[ {q:'18 ÷ 3 = ?',choices:['6','5','9','3'],correct:0,hint:'What times 3 makes 18?'},
           {q:'20 ÷ 4 = ?',choices:['5','4','6','8'],correct:0,hint:'What times 4 makes 20?'} ],
      YOU:[{q:'42 ÷ 6 = ?',choices:['7','6','8','9'],correct:0,hint:'6 × 7 = 42'},
           {q:'56 ÷ 8 = ?',choices:['7','6','8','9'],correct:0,hint:'8 × 7 = 56'} ],
      APPLY:[{q:'S.P.A.R.K. splits 24 data bits evenly into 4 files. How many bits per file?',choices:['6','4','8','12'],correct:0,hint:'24 ÷ 4'},
             {q:'35 cyberbugs form 5 equal swarms. How many bugs in each swarm?',choices:['7','5','6','8'],correct:0,hint:'35 ÷ 5'} ] },

    { id:'M3.1.4', sk:'SK-M3-104', name:'Solve Multiplication and Division Stories',
      teach:{ head:'Turn the story into a number sentence',
        body:'Read the story and ask two questions:\n1. How many GROUPS?\n2. How many in EACH group?\n\n"6 crates hold 5 chips each."\nGroups = 6, each = 5 → 6 × 5 = 30.\n\nIf the story gives you the TOTAL and asks for group size, you divide instead.',
        key:'"Groups and each → multiply. Total and groups → divide."' },
      reteach:{ head:'Look for the word clues',
        body:'"each," "every," "per," "in a row" usually means MULTIPLY.\n"shared equally," "split into," "divided among" usually means DIVIDE.\n\nUnderline the numbers, then decide which one is the total.' },
      I:[  {q:'3 shelves hold 5 books each. How many books?',choices:['15','8','10','20'],correct:0,hint:'3 groups of 5.'},
           {q:'4 bins hold 3 tools each. How many tools?',choices:['12','7','9','16'],correct:0,hint:'4 groups of 3.'} ],
      WE:[ {q:'18 chips are shared equally by 6 robots. How many each?',choices:['3','2','4','6'],correct:0,hint:'Total ÷ groups: 18 ÷ 6'},
           {q:'28 tiles are shared equally by 7 kids. How many each?',choices:['4','3','5','7'],correct:0,hint:'Total ÷ groups: 28 ÷ 7'} ],
      YOU:[{q:'Alana has 9 packs with 4 stickers each. How many stickers?',choices:['36','13','32','40'],correct:0,hint:'9 × 4'},
           {q:'A team of 8 splits 48 points equally. How many points each?',choices:['6','5','7','8'],correct:0,hint:'48 ÷ 8'} ],
      APPLY:[{q:'Maya collects 4 bits on each of 7 boards, then loses 3. How many does she have?',choices:['25','28','31','21'],correct:0,hint:'First 4 × 7, then subtract 3.'},
             {q:'6 crates hold 5 chips each. If 10 chips break, how many are left?',choices:['20','30','25','15'],correct:0,hint:'6 × 5 = 30, then take away 10.'} ] },

    { id:'M3.1.5', sk:'SK-M3-105', name:'Use Patterns and Properties',
      teach:{ head:'Order does not change the answer',
        body:'This is the commutative property:\n\n3 × 8 = 24\n8 × 3 = 24\n\nSame answer! So if you know one, you know the other — that cuts your work in half.\n\nAlso: any number × 0 = 0, and any number × 1 stays itself.',
        key:'"a × b = b × a"' },
      reteach:{ head:'Picture the array turning',
        body:'Draw 3 rows of 8 dots. Now turn the paper sideways — it becomes 8 rows of 3 dots.\n\nThe dots never moved. The total is the same.\nThat is why 3 × 8 and 8 × 3 both equal 24.' },
      I:[  {q:'Which has the same answer as 6 × 4?',choices:['4 × 6','6 + 4','6 ÷ 4','4 − 6'],correct:0,hint:'Order does not change a product.'},
           {q:'Which has the same answer as 7 × 2?',choices:['2 × 7','7 + 2','7 − 2','2 ÷ 7'],correct:0,hint:'Swap the two numbers.'} ],
      WE:[ {q:'If 9 × 5 = 45, what is 5 × 9?',choices:['45','14','50','40'],correct:0,hint:'Same numbers, same product.'},
           {q:'If 6 × 7 = 42, what is 7 × 6?',choices:['42','13','36','48'],correct:0,hint:'Same numbers, same product.'} ],
      YOU:[{q:'What is 8 × 0?',choices:['0','8','1','80'],correct:0,hint:'Zero groups of anything is nothing.'},
           {q:'What is 12 × 1?',choices:['12','1','13','120'],correct:0,hint:'One group of 12.'} ],
      APPLY:[{q:'In 3, 6, 9, 12, … what is the rule?',choices:['add 3 each time','add 2 each time','double each time','subtract 3'],correct:0,hint:'Find the gap between numbers.'},
             {q:'In 5, 10, 20, 40, … what comes next?',choices:['80','45','60','50'],correct:0,hint:'Each number doubles.'} ] }
  ]
};

/* ======================= GRADE 4 — M4.3 ======================= */
T[4] = {
  module:'M4.3', title:'Number & Operations — Fractions',
  lessons:[
    { id:'M4.3.1', sk:'SK-M4-301', name:'Equivalent Fractions',
      teach:{ head:'Same amount, different name',
        body:'Cut a bar in half and shade one half. Now cut BOTH halves in two.\n\n[■■][□□]  →  1/2\n[■][■][□][□]  →  2/4\n\nThe shaded amount never changed. So 1/2 = 2/4.\n\nMultiply the top AND bottom by the same number to make an equivalent fraction.',
        key:'"Multiply top and bottom by the same number"' },
      reteach:{ head:'Whatever you do to the top, do to the bottom',
        body:'To go from 1/3 to sixths, ask: what turns 3 into 6? Multiply by 2.\nSo you must ALSO multiply the top by 2.\n\n1/3 = (1×2)/(3×2) = 2/6\n\nIf you only change one number, you change the amount.' },
      I:[  {q:'Which fraction equals 1/2?',choices:['2/4','1/3','2/3','3/8'],correct:0,hint:'Multiply top and bottom by 2.'},
           {q:'Which fraction equals 1/3?',choices:['2/6','2/3','1/6','3/6'],correct:0,hint:'Multiply top and bottom by 2.'} ],
      WE:[ {q:'Which fraction equals 2/3?',choices:['4/6','2/6','3/4','1/3'],correct:0,hint:'Multiply top and bottom by 2.'},
           {q:'Which fraction equals 3/4?',choices:['6/8','3/8','4/6','2/4'],correct:0,hint:'Multiply top and bottom by 2.'} ],
      YOU:[{q:'Which fraction equals 1/4?',choices:['3/12','2/12','1/12','4/12'],correct:0,hint:'4 × 3 = 12, so do the same on top.'},
           {q:'Simplify 6/8 to its simplest form.',choices:['3/4','2/4','6/4','4/6'],correct:0,hint:'Divide top and bottom by 2.'} ],
      APPLY:[{q:'Maya ate 2/4 of a bar. Alana ate 1/2 of an identical bar. Who ate more?',choices:['They ate the same','Maya','Alana','Cannot tell'],correct:0,hint:'2/4 simplifies to 1/2.'},
             {q:'A file is 4/8 downloaded. What simpler fraction is that?',choices:['1/2','1/4','2/3','3/4'],correct:0,hint:'Divide top and bottom by 4.'} ] },

    { id:'M4.3.2', sk:'SK-M4-302', name:'Compare Fractions',
      teach:{ head:'Same bottom? Compare the tops',
        body:'When denominators MATCH, the bigger numerator wins:\n3/5 > 2/5\n\nWhen numerators match, the SMALLER denominator wins, because the pieces are bigger:\n1/3 > 1/8\n\nThink of pizza: 1 slice of a 3-slice pizza beats 1 slice of an 8-slice pizza.',
        key:'"Fewer pieces = bigger pieces"' },
      reteach:{ head:'Make the bottoms match first',
        body:'To compare 2/3 and 3/4, rewrite both with the same denominator.\n\n2/3 = 8/12\n3/4 = 9/12\n\nNow it is easy: 9/12 is bigger, so 3/4 > 2/3.' },
      I:[  {q:'Which is bigger: 3/4 or 2/4?',choices:['3/4','2/4','Equal','Cannot tell'],correct:0,hint:'Same bottom — compare tops.'},
           {q:'Which is bigger: 4/5 or 2/5?',choices:['4/5','2/5','Equal','Cannot tell'],correct:0,hint:'Same bottom — compare tops.'} ],
      WE:[ {q:'Which is bigger: 1/2 or 1/6?',choices:['1/2','1/6','Equal','Cannot tell'],correct:0,hint:'Fewer pieces means each piece is bigger.'},
           {q:'Which is bigger: 1/4 or 1/10?',choices:['1/4','1/10','Equal','Cannot tell'],correct:0,hint:'Fewer pieces means each piece is bigger.'} ],
      YOU:[{q:'Which is bigger: 2/3 or 3/4?',choices:['3/4','2/3','Equal','Cannot tell'],correct:0,hint:'Rewrite both with denominator 12.'},
           {q:'Which is smaller: 5/8 or 1/2?',choices:['1/2','5/8','Equal','Cannot tell'],correct:0,hint:'1/2 = 4/8.'} ],
      APPLY:[{q:'Natalia repaired 3/4 of a board. Maya repaired 2/3. Who did more?',choices:['Natalia','Maya','Same','Cannot tell'],correct:0,hint:'9/12 versus 8/12.'},
             {q:'Which download is closest to finished: 5/6 or 7/8?',choices:['7/8','5/6','Equal','Cannot tell'],correct:0,hint:'Compare with denominator 24.'} ] },

    { id:'M4.3.3', sk:'SK-M4-303', name:'Add Fractions With Like Denominators',
      teach:{ head:'Add the tops, keep the bottom',
        body:'The denominator tells you the SIZE of the piece. It does not change when you add.\n\n1/5 + 2/5\n= (1 + 2)/5\n= 3/5\n\nOne fifth plus two fifths is three fifths — just like 1 apple + 2 apples = 3 apples.',
        key:'"Add numerators only"' },
      reteach:{ head:'The bottom number is a NAME, not a number to add',
        body:'"Fifths" is the name of the piece. Adding 1 fifth and 2 fifths gives 3 fifths — the name stays "fifths."\n\n1/5 + 2/5 = 3/5   ✔\n1/5 + 2/5 = 3/10  ✘  (that would change the piece size!)' },
      I:[  {q:'1/4 + 2/4 = ?',choices:['3/4','3/8','2/8','1/2'],correct:0,hint:'Add the tops, keep the bottom.'},
           {q:'2/6 + 3/6 = ?',choices:['5/6','5/12','6/6','1/6'],correct:0,hint:'Add the tops, keep the bottom.'} ],
      WE:[ {q:'3/8 + 2/8 = ?',choices:['5/8','5/16','6/8','1/8'],correct:0,hint:'3 + 2 on top, 8 stays.'},
           {q:'4/9 + 3/9 = ?',choices:['7/9','7/18','12/9','1/9'],correct:0,hint:'4 + 3 on top, 9 stays.'} ],
      YOU:[{q:'5/12 + 4/12 = ?',choices:['9/12','9/24','20/12','1/12'],correct:0,hint:'Add tops only.'},
           {q:'2/5 + 2/5 = ?',choices:['4/5','4/10','2/10','1/5'],correct:0,hint:'Add tops only.'} ],
      APPLY:[{q:'Alana fixed 2/7 of a board, then 3/7 more. How much is fixed?',choices:['5/7','5/14','6/7','1/7'],correct:0,hint:'Add the fractions.'},
             {q:'A file loads 3/10, then 4/10 more. How much has loaded?',choices:['7/10','7/20','12/10','1/10'],correct:0,hint:'Add the numerators.'} ] },

    { id:'M4.3.4', sk:'SK-M4-304', name:'Subtract Fractions With Like Denominators',
      teach:{ head:'Subtract the tops, keep the bottom',
        body:'Same rule as adding, going the other way.\n\n5/8 − 2/8\n= (5 − 2)/8\n= 3/8\n\nThe piece size (eighths) never changes — you are just taking away some of the pieces.',
        key:'"Subtract numerators only"' },
      reteach:{ head:'Count backwards in pieces',
        body:'Start with 5 eighths. Take away 2 eighths.\n\n■■■■■ □□□  →  ■■■ □□□□□\n\nYou have 3 eighths left: 3/8.' },
      I:[  {q:'3/4 − 1/4 = ?',choices:['2/4','2/8','4/4','1/2'],correct:0,hint:'Subtract the tops.'},
           {q:'4/5 − 2/5 = ?',choices:['2/5','2/10','6/5','1/5'],correct:0,hint:'Subtract the tops.'} ],
      WE:[ {q:'7/9 − 3/9 = ?',choices:['4/9','4/18','10/9','1/9'],correct:0,hint:'7 − 3 on top, 9 stays.'},
           {q:'5/6 − 1/6 = ?',choices:['4/6','4/12','6/6','1/6'],correct:0,hint:'5 − 1 on top, 6 stays.'} ],
      YOU:[{q:'9/12 − 5/12 = ?',choices:['4/12','4/24','14/12','1/12'],correct:0,hint:'Subtract tops only.'},
           {q:'6/7 − 6/7 = ?',choices:['0','1','6/7','12/7'],correct:0,hint:'Taking everything away leaves nothing.'} ],
      APPLY:[{q:'A shield was 7/8 charged, then lost 3/8. What is left?',choices:['4/8','4/16','10/8','1/8'],correct:0,hint:'Subtract the fractions.'},
             {q:'Maya had 5/6 of her zappers, then used 2/6. How many remain?',choices:['3/6','3/12','7/6','1/6'],correct:0,hint:'Subtract the numerators.'} ] },

    { id:'M4.3.5', sk:'SK-M4-305', name:'Multiply a Fraction by a Whole Number',
      teach:{ head:'Multiplying is repeated adding',
        body:'3 × 2/5 means 2/5 added three times:\n\n2/5 + 2/5 + 2/5 = 6/5\n\nShortcut: multiply the whole number by the TOP only.\n3 × 2/5 = (3×2)/5 = 6/5\n\nThe denominator does not change.',
        key:'"Multiply the numerator, keep the denominator"' },
      reteach:{ head:'Stack the copies',
        body:'4 × 1/3 means four one-thirds.\n\n1/3 + 1/3 + 1/3 + 1/3 = 4/3\n\nSee how only the top counted up? The pieces are still thirds.' },
      I:[  {q:'2 × 1/4 = ?',choices:['2/4','1/8','2/8','1/4'],correct:0,hint:'1/4 + 1/4'},
           {q:'3 × 1/5 = ?',choices:['3/5','1/15','3/15','1/5'],correct:0,hint:'1/5 + 1/5 + 1/5'} ],
      WE:[ {q:'3 × 2/5 = ?',choices:['6/5','5/6','2/15','6/15'],correct:0,hint:'Multiply the top by 3.'},
           {q:'4 × 2/7 = ?',choices:['8/7','7/8','2/28','8/28'],correct:0,hint:'Multiply the top by 4.'} ],
      YOU:[{q:'5 × 3/8 = ?',choices:['15/8','8/15','3/40','15/40'],correct:0,hint:'Multiply the numerator by 5.'},
           {q:'6 × 1/2 = ?',choices:['3','6/12','1/12','12'],correct:0,hint:'6/2 simplifies.'} ],
      APPLY:[{q:'Each repair uses 2/3 of a charge. How much for 3 repairs?',choices:['2','6/9','2/9','3/2'],correct:0,hint:'3 × 2/3 = 6/3.'},
             {q:'A recipe needs 3/4 cup per batch. How much for 4 batches?',choices:['3 cups','12/16 cup','3/16 cup','4/3 cups'],correct:0,hint:'4 × 3/4 = 12/4.'} ] }
  ]
};

/* ======================= GRADE 5 — M5.3 ======================= */
T[5] = {
  module:'M5.3', title:'Number & Operations — Fractions',
  lessons:[
    { id:'M5.3.1', sk:'SK-FR-501', name:'Add and Subtract Unlike Denominators',
      teach:{ head:'Make the pieces match first',
        body:'You cannot add halves and thirds directly — the pieces are different sizes.\n\n1/2 + 1/3\nFind a common denominator: 6\n1/2 = 3/6   and   1/3 = 2/6\n3/6 + 2/6 = 5/6\n\nRewrite, THEN add.',
        key:'"Common denominator first, then add the tops"' },
      reteach:{ head:'Multiply the denominators to find a common one',
        body:'Stuck finding a common denominator? Just multiply them.\n\n1/4 + 1/3 → common denominator 4 × 3 = 12\n1/4 = 3/12,  1/3 = 4/12\n3/12 + 4/12 = 7/12\n\nIt may not be the smallest, but it always works.' },
      I:[  {q:'1/2 + 1/4 = ?',choices:['3/4','2/6','1/6','2/4'],correct:0,hint:'1/2 = 2/4, then add.'},
           {q:'1/3 + 1/6 = ?',choices:['1/2','2/9','1/9','2/6'],correct:0,hint:'1/3 = 2/6, then add. Simplify 3/6.'} ],
      WE:[ {q:'1/2 + 1/3 = ?',choices:['5/6','2/5','2/6','3/5'],correct:0,hint:'Common denominator 6: 3/6 + 2/6.'},
           {q:'1/4 + 1/3 = ?',choices:['7/12','2/7','2/12','1/7'],correct:0,hint:'Common denominator 12: 3/12 + 4/12.'} ],
      YOU:[{q:'3/4 − 1/2 = ?',choices:['1/4','2/2','1/2','2/4'],correct:0,hint:'1/2 = 2/4.'},
           {q:'2/3 + 1/6 = ?',choices:['5/6','3/9','3/6','1/2'],correct:0,hint:'2/3 = 4/6.'} ],
      APPLY:[{q:'A shield is 1/2 charged. You add 1/4 more. How charged is it?',choices:['3/4','2/6','1/8','2/4'],correct:0,hint:'Convert to quarters.'},
             {q:'Natalia repaired 2/5 of a board and Maya 1/2. How much together?',choices:['9/10','3/7','3/10','1/2'],correct:0,hint:'Common denominator 10: 4/10 + 5/10.'} ] },

    { id:'M5.3.2', sk:'SK-FR-502', name:'Solve Fraction Word Problems',
      teach:{ head:'Decide: joining or taking away?',
        body:'Words like "in all," "altogether," "combined" → ADD.\nWords like "left," "remains," "how much more" → SUBTRACT.\n\n"You used 1/3 of a battery, then 1/4 more. How much used?"\nThat is joining → 1/3 + 1/4 = 4/12 + 3/12 = 7/12.',
        key:'"Name the operation before you compute"' },
      reteach:{ head:'Draw the bar',
        body:'Sketch one long bar as the whole thing.\nShade the first amount. Shade the second in another color.\n\nIf the question asks for the shaded total → add.\nIf it asks for the UNshaded part → subtract from 1.' },
      I:[  {q:'You read 1/4 of a book, then 1/4 more. How much have you read?',choices:['1/2','2/8','1/8','1/4'],correct:0,hint:'1/4 + 1/4 = 2/4.'},
           {q:'A tank is 3/4 full. You use 1/4. How much is left?',choices:['1/2','2/8','1/4','3/8'],correct:0,hint:'3/4 − 1/4 = 2/4.'} ],
      WE:[ {q:'Maya ran 1/2 mile and walked 1/3 mile. How far in all?',choices:['5/6 mile','2/5 mile','2/6 mile','1/6 mile'],correct:0,hint:'Common denominator 6.'},
           {q:'A file is 5/6 loaded. How much is left to load?',choices:['1/6','5/6','1/2','2/6'],correct:0,hint:'Subtract from 1 = 6/6.'} ],
      YOU:[{q:'Alana used 2/5 of a charge, then 1/4 more. How much used?',choices:['13/20','3/9','3/20','1/2'],correct:0,hint:'Common denominator 20: 8/20 + 5/20.'},
           {q:'A board is 7/8 repaired. How much remains?',choices:['1/8','7/8','1/2','2/8'],correct:0,hint:'8/8 − 7/8.'} ],
      APPLY:[{q:'Of 1 full power core, 1/3 went to shields and 1/4 to zappers. How much is left?',choices:['5/12','7/12','1/12','2/7'],correct:0,hint:'Add 4/12 + 3/12 = 7/12, then subtract from 12/12.'},
             {q:'Natalia repairs 1/2 a sector, Maya 1/6. How much of the sector is still broken?',choices:['1/3','2/3','1/6','5/6'],correct:0,hint:'1/2 + 1/6 = 4/6; then 6/6 − 4/6 = 2/6.'} ] },

    { id:'M5.3.3', sk:'SK-FR-503', name:'Multiply Fractions',
      teach:{ head:'Multiply straight across',
        body:'1/2 × 1/4\n= (1 × 1)/(2 × 4)\n= 1/8\n\n"Of" means multiply. Half OF a quarter is one eighth — and notice the answer got SMALLER, because you took a part of a part.',
        key:'"Tops × tops, bottoms × bottoms"' },
      reteach:{ head:'Fold the paper twice',
        body:'Take a sheet and fold it in half → each part is 1/2.\nNow fold that half into 4 → you have made 8 equal parts.\n\nOne of those parts is 1/2 × 1/4 = 1/8.\nThat is why multiplying fractions makes things smaller.' },
      I:[  {q:'1/2 × 1/2 = ?',choices:['1/4','2/4','1/2','2/2'],correct:0,hint:'Tops × tops, bottoms × bottoms.'},
           {q:'1/3 × 1/2 = ?',choices:['1/6','2/6','1/5','2/3'],correct:0,hint:'1 × 1 over 3 × 2.'} ],
      WE:[ {q:'2/3 × 1/2 = ?',choices:['1/3','2/6 only','3/5','2/5'],correct:0,hint:'2/6 simplifies to 1/3.'},
           {q:'3/4 × 1/3 = ?',choices:['1/4','3/12 only','4/7','3/7'],correct:0,hint:'3/12 simplifies to 1/4.'} ],
      YOU:[{q:'2/5 × 3/4 = ?',choices:['3/10','6/9','5/9','6/10'],correct:0,hint:'6/20 simplifies.'},
           {q:'What is 1/2 of 3/5?',choices:['3/10','4/7','3/7','2/5'],correct:0,hint:'"Of" means multiply.'} ],
      APPLY:[{q:'A tank holds 3/4 gallon. You use 1/2 of it. How much did you use?',choices:['3/8 gallon','5/4 gallon','1/4 gallon','3/2 gallon'],correct:0,hint:'1/2 × 3/4.'},
             {q:'2/3 of the 1/2-charged core is drained. What fraction of a full core is that?',choices:['1/3','2/5','7/6','1/6'],correct:0,hint:'2/3 × 1/2 = 2/6.'} ] },

    { id:'M5.3.4', sk:'SK-FR-504', name:'Divide With Unit Fractions',
      teach:{ head:'Dividing by a fraction means "how many fit?"',
        body:'2 ÷ 1/4 asks: how many quarters fit inside 2 wholes?\n\nEach whole holds 4 quarters, so 2 wholes hold 8.\n2 ÷ 1/4 = 8\n\nDividing by a fraction usually makes the answer BIGGER.',
        key:'"How many of those fit inside this?"' },
      reteach:{ head:'Flip and multiply',
        body:'To divide by a fraction, flip it upside down and multiply.\n\n3 ÷ 1/2\n= 3 × 2/1\n= 6\n\nCheck it: six halves really do fit inside 3 wholes.' },
      I:[  {q:'1 ÷ 1/2 = ? (how many halves fit in 1?)',choices:['2','1/2','1','4'],correct:0,hint:'Two halves make a whole.'},
           {q:'1 ÷ 1/4 = ?',choices:['4','1/4','2','8'],correct:0,hint:'Four quarters make a whole.'} ],
      WE:[ {q:'3 ÷ 1/2 = ?',choices:['6','3/2','1/6','5'],correct:0,hint:'Flip and multiply: 3 × 2.'},
           {q:'2 ÷ 1/3 = ?',choices:['6','2/3','1/6','5'],correct:0,hint:'Flip and multiply: 2 × 3.'} ],
      YOU:[{q:'1/2 ÷ 4 = ?',choices:['1/8','2','4/2','1/6'],correct:0,hint:'Split a half into 4 equal parts.'},
           {q:'1/3 ÷ 2 = ?',choices:['1/6','2/3','3/2','1/5'],correct:0,hint:'Split a third into 2 equal parts.'} ],
      APPLY:[{q:'You have 4 power cells. Each repair uses 1/2 a cell. How many repairs?',choices:['8','2','4','1/8'],correct:0,hint:'4 ÷ 1/2.'},
             {q:'A 1/2-liter charge is split evenly among 4 zappers. How much each?',choices:['1/8 liter','2 liters','4/2 liters','1/6 liter'],correct:0,hint:'1/2 ÷ 4.'} ] },

    { id:'M5.3.5', sk:'SK-FR-505', name:'Visual Models for Fractions',
      teach:{ head:'A number line proves it',
        body:'Draw 0 to 1 and cut it into 4 equal jumps.\n\n0 ——|——|——|—— 1\n   1/4  2/4  3/4\n\nEvery fraction has a home on the number line. 2/4 lands exactly on 1/2 — that is visual proof they are equal.',
        key:'"Fractions are numbers with a place on the line"' },
      reteach:{ head:'Area model check',
        body:'Draw a rectangle. Split it into the denominator number of equal parts. Shade the numerator number of them.\n\nDo that for both fractions side by side, same size rectangle.\nWhichever has more shaded is bigger. No calculation needed.' },
      I:[  {q:'On a number line from 0 to 1 split into 4 parts, where is 2/4?',choices:['exactly at 1/2','at 1/4','at 3/4','past 1'],correct:0,hint:'2 of 4 jumps is halfway.'},
           {q:'On a number line 0 to 1 split into 8, where is 4/8?',choices:['exactly at 1/2','at 1/4','at 3/4','at 1'],correct:0,hint:'4 of 8 is halfway.'} ],
      WE:[ {q:'A rectangle split into 6 with 3 shaded shows what fraction?',choices:['1/2','1/3','2/3','1/6'],correct:0,hint:'3/6 simplifies.'},
           {q:'A rectangle split into 9 with 3 shaded shows what fraction?',choices:['1/3','1/9','2/3','3/9 only'],correct:0,hint:'3/9 simplifies.'} ],
      YOU:[{q:'Which fraction is closest to 1 on a number line?',choices:['7/8','1/2','3/4','2/3'],correct:0,hint:'Which is only one small piece away from the end?'},
           {q:'Which fraction is closest to 0?',choices:['1/10','1/2','1/3','1/4'],correct:0,hint:'Smaller pieces sit nearer to zero.'} ],
      APPLY:[{q:'A progress bar shows 5/8 filled. Is that more or less than half?',choices:['More than half','Less than half','Exactly half','Cannot tell'],correct:0,hint:'Half of 8 is 4.'},
             {q:'Two identical bars: one shaded 2/3, one shaded 3/5. Which is more shaded?',choices:['2/3','3/5','Equal','Cannot tell'],correct:0,hint:'Compare with denominator 15: 10/15 versus 9/15.'} ] }
  ]
};

/* ======================= GRADE 6 — M6.1 ======================= */
T[6] = {
  module:'M6.1', title:'Ratios and Unit Rates',
  lessons:[
    { id:'M6.1.1', sk:'SK-RP-601', name:'Understanding Ratios',
      teach:{ head:'A ratio compares two amounts',
        body:'6 red chips and 9 blue chips.\nThe ratio of red to blue is 6:9.\n\nRatios simplify like fractions — divide both sides by the same number:\n6:9 → divide by 3 → 2:3\n\nOrder matters. "Red to blue" is 2:3, but "blue to red" is 3:2.',
        key:'"Divide both parts by the same number"' },
      reteach:{ head:'Think in groups',
        body:'6 red and 9 blue. Can you split them into equal groups?\n\nMake 3 groups: each has 2 red and 3 blue.\n\nThat is the ratio 2:3 — the pattern that repeats.' },
      I:[  {q:'4 red and 6 blue. What is the ratio of red to blue, simplified?',choices:['2:3','3:2','4:6 only','1:2'],correct:0,hint:'Divide both by 2.'},
           {q:'10 green and 5 gold. Ratio of green to gold, simplified?',choices:['2:1','1:2','10:5 only','5:1'],correct:0,hint:'Divide both by 5.'} ],
      WE:[ {q:'The ratio of 6 red to 9 blue, simplified, is…',choices:['2:3','3:2','6:9 only','1:3'],correct:0,hint:'Divide both by 3.'},
           {q:'The ratio of 8 bugs to 12 bits, simplified, is…',choices:['2:3','3:2','8:12 only','4:6'],correct:0,hint:'Divide both by 4.'} ],
      YOU:[{q:'In a 3:4 ratio of zappers to bugs, if there are 9 zappers, how many bugs?',choices:['12','7','16','6'],correct:0,hint:'3 × 3 = 9, so do the same to 4.'},
           {q:'Simplify the ratio 15:25.',choices:['3:5','5:3','15:25 only','1:2'],correct:0,hint:'Divide both by 5.'} ],
      APPLY:[{q:'A sector has 12 gold and 18 cyan panels. What is gold to cyan?',choices:['2:3','3:2','12:18 only','1:2'],correct:0,hint:'Divide both by 6.'},
             {q:'If the ratio of solved to unsolved checkpoints is 3:1 and 3 are solved, how many are unsolved?',choices:['1','3','4','9'],correct:0,hint:'The pattern is 3 solved for every 1 unsolved.'} ] },

    { id:'M6.1.2', sk:'SK-RP-602', name:'Unit Rates',
      teach:{ head:'A unit rate is "per one"',
        body:'120 miles in 2 hours. How far in ONE hour?\n\n120 ÷ 2 = 60\nThe unit rate is 60 miles per hour.\n\nTo find any unit rate, divide by the second quantity so it becomes 1.',
        key:'"Divide to get per one"' },
      reteach:{ head:'Ask: what if there were just one?',
        body:'4 pens cost $8. What does ONE pen cost?\n\nSplit the $8 across the 4 pens: 8 ÷ 4 = $2 each.\n\nThat is the unit rate — always divide the total by how many.' },
      I:[  {q:'6 chips cost $12. What is the cost per chip?',choices:['$2','$6','$3','$12'],correct:0,hint:'12 ÷ 6'},
           {q:'A bot travels 20 meters in 4 seconds. Meters per second?',choices:['5','16','24','80'],correct:0,hint:'20 ÷ 4'} ],
      WE:[ {q:'A car travels 120 miles in 2 hours. What is the unit rate?',choices:['60 mph','120 mph','240 mph','30 mph'],correct:0,hint:'Divide distance by time.'},
           {q:'150 data bits load in 5 seconds. Bits per second?',choices:['30','25','35','750'],correct:0,hint:'150 ÷ 5'} ],
      YOU:[{q:'If 4 pens cost $8, what does 1 pen cost?',choices:['$2','$4','$8','$32'],correct:0,hint:'Divide by 4.'},
           {q:'A printer prints 90 pages in 3 minutes. Pages per minute?',choices:['30','27','93','270'],correct:0,hint:'90 ÷ 3'} ],
      APPLY:[{q:'Which is the better deal: 3 cells for $9, or 5 cells for $10?',choices:['5 for $10','3 for $9','Same','Cannot tell'],correct:0,hint:'$3 each versus $2 each.'},
             {q:'A drone flies 240 m in 8 s. At that rate, how far in 20 s?',choices:['600 m','480 m','30 m','960 m'],correct:0,hint:'Find m/s first, then multiply by 20.'} ] },

    { id:'M6.1.3', sk:'SK-RP-603', name:'Percents as Rates',
      teach:{ head:'Percent means "out of 100"',
        body:'25% = 25 out of 100 = 25/100 = 1/4.\n\nTo find 25% of 80:\n80 ÷ 4 = 20\n\nOr multiply: 0.25 × 80 = 20.\n\nUseful anchors: 50% is half, 25% is a quarter, 10% is divide by 10.',
        key:'"Percent = per hundred"' },
      reteach:{ head:'Use 10% as your building block',
        body:'10% of 80 = 8 (just move the decimal one place).\n\nNeed 30%? That is three 10s: 8 × 3 = 24.\nNeed 5%? That is half of 10%: 4.\n\nBuild any percent from 10% chunks.' },
      I:[  {q:'50% of 60 = ?',choices:['30','50','6','120'],correct:0,hint:'Half of 60.'},
           {q:'10% of 200 = ?',choices:['20','10','100','2'],correct:0,hint:'Divide by 10.'} ],
      WE:[ {q:'25% of 80 = ?',choices:['20','25','40','15'],correct:0,hint:'25% is one quarter.'},
           {q:'20% of 50 = ?',choices:['10','20','25','5'],correct:0,hint:'10% is 5, so double it.'} ],
      YOU:[{q:'75% of 40 = ?',choices:['30','35','20','25'],correct:0,hint:'Three quarters of 40.'},
           {q:'15% of 200 = ?',choices:['30','15','20','35'],correct:0,hint:'10% is 20, 5% is 10.'} ],
      APPLY:[{q:'A $60 part is 25% off. What is the sale price?',choices:['$45','$15','$35','$50'],correct:0,hint:'Find 25%, then subtract it.'},
             {q:'You answered 80% of 20 questions correctly. How many were right?',choices:['16','8','18','12'],correct:0,hint:'80% = 0.8 × 20.'} ] },

    { id:'M6.1.4', sk:'SK-RP-604', name:'Unit Conversions With Ratios',
      teach:{ head:'Convert using a ratio you know',
        body:'1 meter = 100 centimeters.\n\nTo change 3 meters into centimeters, use the ratio:\n3 × 100 = 300 cm.\n\nGoing the other way, divide:\n500 cm ÷ 100 = 5 m.\n\nAsk: am I moving to a SMALLER unit (multiply) or a BIGGER one (divide)?',
        key:'"Smaller unit → multiply. Bigger unit → divide."' },
      reteach:{ head:'Sanity-check the size',
        body:'Centimeters are small, so it takes MANY of them — the number should get bigger.\nKilometers are big, so it takes FEW — the number should get smaller.\n\nIf your answer moves the wrong way, you divided when you should have multiplied.' },
      I:[  {q:'2 meters = how many centimeters?',choices:['200','20','2,000','0.02'],correct:0,hint:'1 m = 100 cm.'},
           {q:'3 kilometers = how many meters?',choices:['3,000','300','30','0.003'],correct:0,hint:'1 km = 1,000 m.'} ],
      WE:[ {q:'500 centimeters = how many meters?',choices:['5','50','5,000','0.5'],correct:0,hint:'Divide by 100.'},
           {q:'4,000 grams = how many kilograms?',choices:['4','40','400','0.4'],correct:0,hint:'Divide by 1,000.'} ],
      YOU:[{q:'2.5 meters = how many centimeters?',choices:['250','25','2,500','0.025'],correct:0,hint:'Multiply by 100.'},
           {q:'750 milliliters = how many liters?',choices:['0.75','7.5','75','7,500'],correct:0,hint:'Divide by 1,000.'} ],
      APPLY:[{q:'A cable is 250 cm. Another is 3 m. Which is longer?',choices:['The 3 m cable','The 250 cm cable','Equal','Cannot tell'],correct:0,hint:'3 m = 300 cm.'},
             {q:'A tank holds 2.5 L. How many 250 mL cups can you fill?',choices:['10','25','5','100'],correct:0,hint:'2.5 L = 2,500 mL.'} ] },

    { id:'M6.1.5', sk:'SK-RP-605', name:'Multi-Step Ratio Problems',
      teach:{ head:'Scale the whole recipe',
        body:'2 cups of flour makes 3 loaves. How much flour for 9 loaves?\n\nStep 1 — how many times bigger? 9 ÷ 3 = 3 times.\nStep 2 — scale the other quantity the SAME way: 2 × 3 = 6 cups.\n\nWhatever you do to one side of a ratio, do to the other.',
        key:'"Find the scale factor, then apply it"' },
      reteach:{ head:'Go through the unit rate',
        body:'If the scale factor is messy, find the amount for ONE first.\n\n2 cups for 3 loaves → 2 ÷ 3 = 2/3 cup per loaf.\nThen 9 loaves × 2/3 = 6 cups.\n\nSame answer, safer route.' },
      I:[  {q:'2 cups make 4 loaves. How much for 8 loaves?',choices:['4 cups','6 cups','3 cups','16 cups'],correct:0,hint:'8 is double 4, so double the cups.'},
           {q:'3 bits power 2 zappers. How many bits for 4 zappers?',choices:['6','5','8','12'],correct:0,hint:'4 is double 2.'} ],
      WE:[ {q:'A recipe uses 2 cups of flour for 3 loaves. How much for 9 loaves?',choices:['6 cups','4 cups','9 cups','3 cups'],correct:0,hint:'9 loaves is 3 times the recipe.'},
           {q:'5 panels take 2 hours. How long for 20 panels?',choices:['8 hours','10 hours','4 hours','40 hours'],correct:0,hint:'20 is 4 times 5.'} ],
      YOU:[{q:'If 4 bots clear 12 bugs, how many bugs do 10 bots clear at the same rate?',choices:['30','22','40','25'],correct:0,hint:'Each bot clears 3.'},
           {q:'6 cells power 9 shields. How many cells for 15 shields?',choices:['10','12','18','9'],correct:0,hint:'Find cells per shield first: 6/9 = 2/3.'} ],
      APPLY:[{q:'A drone covers 3 sectors in 12 minutes. How many sectors in 40 minutes?',choices:['10','9','12','15'],correct:0,hint:'4 minutes per sector.'},
             {q:'Paint mixes 2 parts blue to 5 parts white. For 20 parts white, how much blue?',choices:['8','10','4','15'],correct:0,hint:'20 ÷ 5 = 4, then 2 × 4.'} ] }
  ]
};

/* --------- helpers --------- */
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; }
function shuffleChoices(item){
  const order=shuffle(item.choices.map((_,i)=>i));
  return Object.assign({}, item, { choices:order.map(i=>item.choices[i]), correct:order.indexOf(item.correct) });
}
const STAGES=['I','WE','YOU','APPLY'];

window.TEACH_BANK = {
  data:T,
  moduleFor:(grade)=> T[grade] || T[3],
  lessonCount:(grade)=> (T[grade]||T[3]).lessons.length,
  /* board index -> lesson (boards past the lesson list become mixed review) */
  lessonFor(grade, board){
    const m=T[grade]||T[3];
    return m.lessons[Math.min(board, m.lessons.length-1)];
  },
  isReview:(grade, board)=> board >= (T[grade]||T[3]).lessons.length,
  /* pull an item for a checkpoint: stage 0..3, variant picks the parallel item */
  item(grade, board, stageIdx, variant){
    const m=T[grade]||T[3];
    const review = board >= m.lessons.length;
    const lesson = review
      ? m.lessons[(board + stageIdx) % m.lessons.length]   // review mixes lessons
      : m.lessons[board];
    const stage = review ? 'APPLY' : STAGES[stageIdx];
    const pool = lesson[stage];
    const it = pool[(variant||0) % pool.length];
    return shuffleChoices(Object.assign({}, it, {
      stage, lessonId:lesson.id, sk:lesson.sk, lessonName:lesson.name,
      teach:lesson.teach, reteach:lesson.reteach, review
    }));
  },
  stageLabel:(s)=>({ I:'LEARN IT', WE:'TRY IT TOGETHER', YOU:'YOUR TURN', APPLY:'USE IT' }[s]||s)
};
})();
