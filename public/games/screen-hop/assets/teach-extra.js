/* ===========================================================================
   TEACH BANK — EXTRA ITEMS
   Each station now asks 3 questions, so every stage needs a 3rd parallel item.
   Keyed by lesson id -> stage. Merged into TEACH_BANK at load.
=========================================================================== */
(function(){
const X = {
  /* ---------------- GRADE 3 · M3.1 ---------------- */
  'M3.1.1':{ I:{q:'5 bags hold 2 chips each. How many chips?',choices:['10','7','12','8'],correct:0,hint:'2 + 2 + 2 + 2 + 2'},
             WE:{q:'2 groups of 7 = ?',choices:['14','9','12','16'],correct:0,hint:'7 + 7'},
             YOU:{q:'8 × 5 = ?',choices:['40','13','35','45'],correct:0,hint:'Eight 5s: count by fives.'},
             APPLY:{q:'A crate holds 7 rows of 3 cells. How many cells?',choices:['21','10','18','24'],correct:0,hint:'7 groups of 3.'} },
  'M3.1.2':{ I:{q:'An array has 4 rows of 2. How many dots?',choices:['8','6','10','4'],correct:0,hint:'4 rows × 2 columns'},
             WE:{q:'An array has 6 rows of 3. How many dots?',choices:['18','9','15','21'],correct:0,hint:'6 × 3'},
             YOU:{q:'An array has 8 rows of 6 dots. How many dots?',choices:['48','14','42','54'],correct:0,hint:'8 × 6'},
             APPLY:{q:'36 tiles form 6 equal rows. How many per row?',choices:['6','5','7','9'],correct:0,hint:'6 × ? = 36'} },
  'M3.1.3':{ I:{q:'10 ÷ 5 = ? Think: 5 × ? = 10',choices:['2','5','3','10'],correct:0,hint:'5 × 2 = 10'},
             WE:{q:'24 ÷ 4 = ?',choices:['6','5','8','4'],correct:0,hint:'What times 4 makes 24?'},
             YOU:{q:'63 ÷ 9 = ?',choices:['7','6','8','9'],correct:0,hint:'9 × 7 = 63'},
             APPLY:{q:'48 bits are split evenly into 8 files. How many per file?',choices:['6','5','7','8'],correct:0,hint:'48 ÷ 8'} },
  'M3.1.4':{ I:{q:'5 boxes hold 2 chips each. How many chips?',choices:['10','7','12','8'],correct:0,hint:'5 groups of 2.'},
             WE:{q:'24 tools shared equally by 4 bots. How many each?',choices:['6','4','8','12'],correct:0,hint:'24 ÷ 4'},
             YOU:{q:'Maya has 7 packs of 6 bits. How many bits?',choices:['42','13','36','48'],correct:0,hint:'7 × 6'},
             APPLY:{q:'3 crates hold 8 chips each. If 4 chips are lost, how many remain?',choices:['20','24','28','16'],correct:0,hint:'3 × 8 = 24, then subtract 4.'} },
  'M3.1.5':{ I:{q:'Which has the same answer as 5 × 3?',choices:['3 × 5','5 + 3','5 − 3','3 ÷ 5'],correct:0,hint:'Swap the numbers.'},
             WE:{q:'If 4 × 8 = 32, what is 8 × 4?',choices:['32','12','28','36'],correct:0,hint:'Same numbers, same product.'},
             YOU:{q:'What is 15 × 1?',choices:['15','1','16','150'],correct:0,hint:'One group of 15.'},
             APPLY:{q:'In 4, 8, 12, 16, … what comes next?',choices:['20','18','24','14'],correct:0,hint:'Add 4 each time.'} },

  /* ---------------- GRADE 4 · M4.3 ---------------- */
  'M4.3.1':{ I:{q:'Which fraction equals 1/5?',choices:['2/10','2/5','1/10','5/10'],correct:0,hint:'Multiply top and bottom by 2.'},
             WE:{q:'Which fraction equals 3/5?',choices:['6/10','3/10','5/6','2/5'],correct:0,hint:'Multiply top and bottom by 2.'},
             YOU:{q:'Simplify 8/12 to its simplest form.',choices:['2/3','4/6','3/4','1/2'],correct:0,hint:'Divide top and bottom by 4.'},
             APPLY:{q:'A shield is 6/8 charged. What simpler fraction is that?',choices:['3/4','2/3','1/2','4/6'],correct:0,hint:'Divide both by 2.'} },
  'M4.3.2':{ I:{q:'Which is bigger: 5/6 or 3/6?',choices:['5/6','3/6','Equal','Cannot tell'],correct:0,hint:'Same bottom — compare tops.'},
             WE:{q:'Which is bigger: 1/3 or 1/8?',choices:['1/3','1/8','Equal','Cannot tell'],correct:0,hint:'Fewer pieces means bigger pieces.'},
             YOU:{q:'Which is bigger: 3/5 or 2/3?',choices:['2/3','3/5','Equal','Cannot tell'],correct:0,hint:'Use denominator 15: 9/15 vs 10/15.'},
             APPLY:{q:'One file is 2/3 loaded, another 3/4. Which is further along?',choices:['3/4','2/3','Equal','Cannot tell'],correct:0,hint:'8/12 versus 9/12.'} },
  'M4.3.3':{ I:{q:'1/6 + 2/6 = ?',choices:['3/6','3/12','2/12','1/6'],correct:0,hint:'Add the tops.'},
             WE:{q:'2/7 + 4/7 = ?',choices:['6/7','6/14','8/7','2/7'],correct:0,hint:'2 + 4 on top, 7 stays.'},
             YOU:{q:'3/10 + 5/10 = ?',choices:['8/10','8/20','15/10','2/10'],correct:0,hint:'Add tops only.'},
             APPLY:{q:'Alana charges 1/5, then 3/5 more. How charged is it?',choices:['4/5','4/10','3/5','1/5'],correct:0,hint:'Add the fractions.'} },
  'M4.3.4':{ I:{q:'5/6 − 2/6 = ?',choices:['3/6','3/12','7/6','2/6'],correct:0,hint:'Subtract the tops.'},
             WE:{q:'8/9 − 5/9 = ?',choices:['3/9','3/18','13/9','5/9'],correct:0,hint:'8 − 5 on top.'},
             YOU:{q:'7/10 − 4/10 = ?',choices:['3/10','3/20','11/10','4/10'],correct:0,hint:'Subtract tops only.'},
             APPLY:{q:'A core was 6/7 full and lost 2/7. What is left?',choices:['4/7','4/14','8/7','2/7'],correct:0,hint:'Subtract the fractions.'} },
  'M4.3.5':{ I:{q:'4 × 1/5 = ?',choices:['4/5','1/20','4/20','1/5'],correct:0,hint:'1/5 four times.'},
             WE:{q:'2 × 3/7 = ?',choices:['6/7','7/6','3/14','6/14'],correct:0,hint:'Multiply the top by 2.'},
             YOU:{q:'4 × 3/5 = ?',choices:['12/5','5/12','3/20','12/20'],correct:0,hint:'Multiply the numerator by 4.'},
             APPLY:{q:'Each zap uses 1/4 charge. How much do 6 zaps use?',choices:['6/4','4/6','1/24','6/24'],correct:0,hint:'6 × 1/4.'} },

  /* ---------------- GRADE 5 · M5.3 ---------------- */
  'M5.3.1':{ I:{q:'1/2 + 1/6 = ?',choices:['2/3','2/8','1/8','2/6'],correct:0,hint:'1/2 = 3/6, so 3/6 + 1/6 = 4/6.'},
             WE:{q:'1/3 + 1/4 = ?',choices:['7/12','2/7','2/12','1/7'],correct:0,hint:'Denominator 12: 4/12 + 3/12.'},
             YOU:{q:'5/6 − 1/3 = ?',choices:['1/2','4/3','4/9','1/3'],correct:0,hint:'1/3 = 2/6, so 5/6 − 2/6 = 3/6.'},
             APPLY:{q:'A core is 2/3 charged, then gains 1/6. How charged now?',choices:['5/6','3/9','3/6','1/2'],correct:0,hint:'2/3 = 4/6.'} },
  'M5.3.2':{ I:{q:'You used 1/3 of a battery, then 1/3 more. How much used?',choices:['2/3','2/6','1/6','1/3'],correct:0,hint:'1/3 + 1/3.'},
             WE:{q:'A bar is 2/3 full. How much is empty?',choices:['1/3','2/3','1/2','3/2'],correct:0,hint:'Subtract from 3/3.'},
             YOU:{q:'Maya walked 3/4 mile and ran 1/8 mile. How far in all?',choices:['7/8 mile','4/12 mile','4/8 mile','1/2 mile'],correct:0,hint:'3/4 = 6/8.'},
             APPLY:{q:'Of 1 full shield, 1/4 went to Natalia and 1/3 to Alana. How much is left?',choices:['5/12','7/12','1/12','2/7'],correct:0,hint:'3/12 + 4/12 = 7/12; 12/12 − 7/12.'} },
  'M5.3.3':{ I:{q:'1/2 × 1/3 = ?',choices:['1/6','2/3','1/5','2/6'],correct:0,hint:'Tops × tops, bottoms × bottoms.'},
             WE:{q:'2/3 × 3/4 = ?',choices:['1/2','6/12 only','5/7','6/7'],correct:0,hint:'6/12 simplifies.'},
             YOU:{q:'3/5 × 2/3 = ?',choices:['2/5','6/8','5/8','6/15 only'],correct:0,hint:'6/15 simplifies.'},
             APPLY:{q:'You use 1/3 of a 3/4-full tank. What fraction of a full tank is that?',choices:['1/4','4/3','3/7','1/12'],correct:0,hint:'1/3 × 3/4 = 3/12.'} },
  'M5.3.4':{ I:{q:'1 ÷ 1/3 = ?',choices:['3','1/3','2','6'],correct:0,hint:'Three thirds make a whole.'},
             WE:{q:'4 ÷ 1/2 = ?',choices:['8','2','4/2','6'],correct:0,hint:'Flip and multiply: 4 × 2.'},
             YOU:{q:'1/4 ÷ 2 = ?',choices:['1/8','2','4/2','1/6'],correct:0,hint:'Split a quarter into 2 parts.'},
             APPLY:{q:'A 1/3-liter charge is split among 3 zappers. How much each?',choices:['1/9 liter','1 liter','3 liters','1/6 liter'],correct:0,hint:'1/3 ÷ 3.'} },
  'M5.3.5':{ I:{q:'On a line 0 to 1 split into 6, where is 3/6?',choices:['exactly at 1/2','at 1/3','at 2/3','at 1'],correct:0,hint:'3 of 6 is halfway.'},
             WE:{q:'A rectangle split into 8 with 4 shaded shows what fraction?',choices:['1/2','1/4','3/4','1/8'],correct:0,hint:'4/8 simplifies.'},
             YOU:{q:'Which fraction is closest to 1?',choices:['9/10','1/2','3/4','2/3'],correct:0,hint:'Only one tenth away from the end.'},
             APPLY:{q:'A bar shows 3/8 filled. Is that more or less than half?',choices:['Less than half','More than half','Exactly half','Cannot tell'],correct:0,hint:'Half of 8 is 4.'} },

  /* ---------------- GRADE 6 · M6.1 ---------------- */
  'M6.1.1':{ I:{q:'6 gold and 8 cyan. Ratio of gold to cyan, simplified?',choices:['3:4','4:3','6:8 only','1:2'],correct:0,hint:'Divide both by 2.'},
             WE:{q:'The ratio of 10 bugs to 15 bits, simplified, is…',choices:['2:3','3:2','10:15 only','5:3'],correct:0,hint:'Divide both by 5.'},
             YOU:{q:'In a 2:5 ratio of zappers to bugs, if there are 6 zappers, how many bugs?',choices:['15','10','12','7'],correct:0,hint:'2 × 3 = 6, so 5 × 3.'},
             APPLY:{q:'A board has 9 solved and 12 unsolved stations. Simplified ratio?',choices:['3:4','4:3','9:12 only','1:2'],correct:0,hint:'Divide both by 3.'} },
  'M6.1.2':{ I:{q:'8 cells cost $16. Cost per cell?',choices:['$2','$8','$4','$16'],correct:0,hint:'16 ÷ 8'},
             WE:{q:'A bot covers 45 m in 9 s. Metres per second?',choices:['5','9','54','405'],correct:0,hint:'45 ÷ 9'},
             YOU:{q:'A drone flies 210 km in 3 hours. Speed per hour?',choices:['70 km/h','63 km/h','630 km/h','21 km/h'],correct:0,hint:'210 ÷ 3'},
             APPLY:{q:'Which is cheaper per unit: 6 for $18, or 4 for $10?',choices:['4 for $10','6 for $18','Same','Cannot tell'],correct:0,hint:'$3 each versus $2.50 each.'} },
  'M6.1.3':{ I:{q:'50% of 90 = ?',choices:['45','50','9','180'],correct:0,hint:'Half of 90.'},
             WE:{q:'10% of 450 = ?',choices:['45','10','450','4.5'],correct:0,hint:'Divide by 10.'},
             YOU:{q:'30% of 60 = ?',choices:['18','20','30','24'],correct:0,hint:'10% is 6, so three of those.'},
             APPLY:{q:'You got 90% of 30 questions right. How many were right?',choices:['27','25','28','20'],correct:0,hint:'0.9 × 30.'} },
  'M6.1.4':{ I:{q:'5 meters = how many centimeters?',choices:['500','50','5,000','0.05'],correct:0,hint:'1 m = 100 cm.'},
             WE:{q:'2,000 milliliters = how many liters?',choices:['2','20','200','0.2'],correct:0,hint:'Divide by 1,000.'},
             YOU:{q:'1.5 kilometers = how many meters?',choices:['1,500','150','15','15,000'],correct:0,hint:'Multiply by 1,000.'},
             APPLY:{q:'A wire is 180 cm; another is 2 m. Which is longer?',choices:['The 2 m wire','The 180 cm wire','Equal','Cannot tell'],correct:0,hint:'2 m = 200 cm.'} },
  'M6.1.5':{ I:{q:'3 cups make 6 loaves. How much for 12 loaves?',choices:['6 cups','9 cups','4 cups','24 cups'],correct:0,hint:'12 is double 6.'},
             WE:{q:'4 panels take 3 hours. How long for 12 panels?',choices:['9 hours','12 hours','6 hours','36 hours'],correct:0,hint:'12 is 3 times 4.'},
             YOU:{q:'If 3 bots clear 18 bugs, how many do 5 bots clear?',choices:['30','23','36','25'],correct:0,hint:'Each bot clears 6.'},
             APPLY:{q:'Mix is 3 parts blue to 4 parts white. For 16 parts white, how much blue?',choices:['12','10','8','20'],correct:0,hint:'16 ÷ 4 = 4, then 3 × 4.'} }
};

/* merge: append the extra item as a 3rd variant on each stage */
function merge(){
  const TB=window.TEACH_BANK; if(!TB) return;
  Object.keys(TB.data).forEach(g=>{
    TB.data[g].lessons.forEach(L=>{
      const ex=X[L.id]; if(!ex) return;
      ['I','WE','YOU','APPLY'].forEach(st=>{ if(ex[st]) L[st].push(ex[st]); });
    });
  });
}
if(window.TEACH_BANK) merge();
else document.addEventListener('DOMContentLoaded', merge);
})();
