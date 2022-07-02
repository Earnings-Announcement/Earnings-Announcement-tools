function message(){
  let text = "";

  const DATE = new Date();
  DATE.setDate(DATE.getDate()+SETTINGS.getRange("A6").getValue());

  const FORMATTED_DATE = Utilities.formatDate(DATE, 'JST', 'yyyy-MM-dd');
  console.log(FORMATTED_DATE);

  const URL = `https://irbank.net/market/kessan?y=${FORMATTED_DATE}`;
  let response = UrlFetchApp.fetch(URL);
   
  let content = response.getContentText("utf-8");
  let venues = Parser.data(content).from('<td class="lf weaken">').to("</td>").iterate();
  
//対象の日付に決算発表があるのか
//True=>スルーする
//False=>message関数の終了
  if(venues.length <2){
    text = `
    ${FORMATTED_DATE}発表予定は存在しません。
    次回の発表`
    console.log(text);
    return text;
  }
  

//銘柄、会社名の取得
//listNumbers=>任意の日付の発表会社の＜銘柄番号＞を取得 list形式で
//listCompanies=>任意の日付の発表＜会社＞を取得 list形式で
  let listNumbers = [];
  let listCompanies = [];
  let list = [];
  for (var index = 0; index < venues.length; index++) {

    var venue = venues[index];

    if (index%2 == 0){
      let results = venue.match(/\d/g);
      let newresult = results.filter((result,index)=>{
        return index<4;
      })
      let number = newresult.join("");
      listNumbers.push(Number(number));
      
      // let company = Parser.data(venue).from('<td class="lf weaken">').to('</td>').build()
      // listCompanies.push(company);
 　
    }else{
      let company = Parser.data(venue).from('<td class="lf weaken">').to('</td>').build();
      listCompanies.push(company);
    }
  }


  const fyBalanceSheet = SHEET.getSheetByName("fy-balance-sheet");
  const fyProfitAndLoss = SHEET.getSheetByName("fy-profit-and-loss");

  //spreadsheetの銘柄が存在する行を検索
  //sheetNum=>銘柄番号のspreadsheet行　list形式（行が保管）
  let getNumber = fyBalanceSheet.getRange("A3:A").getValues().flat();

  



  let sheetNum = [];
  listNumbers.forEach((num,index)=>{
    if(getNumber.indexOf(num) != -1){
      sheetNum.push(getNumber.indexOf(num)+3);
      
    }
  })

  //[[spreadsheet番号,銘柄番号,会社名],]
  let arr = [];
  for(let i=0;i<listNumbers.length;i++){
    arr.push([sheetNum[i],listNumbers[i],listCompanies[i]]);
  }


  sheetNum.forEach((value,index)=>{
    let CAR = fyBalanceSheet.getRange(`J${value}`).getValue();//自己資本比率
    let ROE = fyProfitAndLoss.getRange(`H${value}`).getValue();//ROE


    if(ROE>=10){
      if(CAR>=40){
        console.log(arr[index]);
          let res = UrlFetchApp.fetch(`https://www.nikkei.com/nkd/company/history/yprice/?scode=${arr[index][1]}`);
   
          let con = res.getContentText("utf-8");
          // outputSplitLog(con);
          let current = Parser.data(con).from('<dd class="m-stockPriceElm_value now">').to('<span class="m-stockPriceElm_value_unit">').build();
          console.log(current);

          text += 
            arr[index][2] + "\n" + 
            current + "\n\n"　+
            `https://monex.ifis.co.jp/index.php?sa=report_zaimu&bcode${arr[index][1]}` + "\n\n"　+
            `https://www.buffett-code.com/company/${arr[index][1]}` + "\n\n"　+
            `https://zaimani.com/financial-analysis-catalog/${arr[index][1]}`+ "\n\n";
            
          

      }
    }
  })

  



  return text;
}
function outputSplitLog(text) {
  const LENGTH = 8000;
  for (let i = 0; i <= text.length; i += LENGTH) {
    const fromIndex = i;
    const toIndex   = i + LENGTH;
    const subString = text.substring(fromIndex, toIndex);
    Logger.log(subString);
  }
}
 