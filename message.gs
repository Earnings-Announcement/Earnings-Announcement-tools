function message() {

  let message_json = {
  "type": "template",
  "altText": "",
  "template": {
    "type": "carousel",
    "columns": [],
    "imageAspectRatio": "rectangle",
    "imageSize": "cover"
  }
};


  var DATE = new Date();

  const adjust = LINE_USERLIST.getRange("F2").getValue();

  var DATE = new Date();
  DATE.setDate(DATE.getDate() + adjust);

  const FORMATTED_DATE = Utilities.formatDate(DATE, "JST", "yyyy-MM-dd");
  console.log(FORMATTED_DATE);
  message_json.altText = `${FORMATTED_DATE} 発表予定の配信`;

  const URL = `https://irbank.net/market/kessan?y=${FORMATTED_DATE}`;
  let response = UrlFetchApp.fetch(URL);

  let content = response.getContentText("utf-8");
  let venues = Parser.data(content)
    .from('<td class="lf weaken">')
    .to("</td>")
    .iterate();

  //対象の日付に決算発表があるのか
  //True=>スルーする
  //False=>message関数の終了
  if (venues.length < 2) {
    text = `${FORMATTED_DATE}発表予定は存在しません。`;
    console.log(text);
    return text;
  }

  //銘柄、会社名の取得
  //listNumbers=>任意の日付の発表会社の＜銘柄番号＞を取得 list形式で
  //listCompanies=>任意の日付の発表＜会社＞を取得 list形式で
  let listNumbers = [];
  let listCompanies = [];
  for (var index = 0; index < venues.length; index++) {
    var venue = venues[index];

    if (index % 2 == 0) {
      let results = venue.match(/\d/g);
      let newresult = results.filter((result, index) => {
        return index < 4;
      });
      let number = newresult.join("");
      listNumbers.push(Number(number));

    } else {
      let company = Parser.data(venue)
        .from('<td class="lf weaken">')
        .to("</td>")
        .build();
      listCompanies.push(company);
    }
  }

  const fyBalanceSheet = SHEET.getSheetByName("fy-balance-sheet");
  const fyProfitAndLoss = SHEET.getSheetByName("fy-profit-and-loss");

  //spreadsheetの銘柄が存在する行を検索
  //sheetNum=>銘柄番号のspreadsheet行　list形式（行が保管）
  let getNumber = fyBalanceSheet.getRange("A3:A").getValues().flat();

  let sheetNum = [];
  listNumbers.forEach((num, index) => {
    if (getNumber.indexOf(num) != -1) {
      sheetNum.push(getNumber.indexOf(num) + 3);
    }
  });

  //[[spreadsheet番号,銘柄番号,会社名],]
  let arr = [];
  for (let i = 0; i < listNumbers.length; i++) {
    arr.push([sheetNum[i], listNumbers[i], listCompanies[i]]);
  }

  let derivery_count = 0;

//任意の日程の発表予定の会社をforeach
  sheetNum.forEach((value, index) => {
    let CAR = fyBalanceSheet.getRange(`J${value}`).getValue(); //自己資本比率
    let ROE = fyProfitAndLoss.getRange(`H${value}`).getValue(); //ROE

    if (ROE >= 10 && CAR >= 40) {
      derivery_count++;

      //10に制限
      if(derivery_count>10){
        return message_json;
      }

      console.log(arr[index]);
      let res = UrlFetchApp.fetch(
        `https://www.nikkei.com/nkd/company/history/yprice/?scode=${arr[index][1]}`
      );

      let con = res.getContentText("utf-8");

      let current = Parser.data(con)
        .from('<dd class="m-stockPriceElm_value now">')
        .to('<span class="m-stockPriceElm_value_unit">')
        .build();

      let ratio = Parser.data(con)
        .from('<dd class="m-stockPriceElm_value comparison minus">')
        .to('<span class="m-stockPriceElm_supplement">')
        .build();


      //ratio生成
      if (ratio.length > 10) {
        ratio = Parser.data(con)
          .from('<dd class="m-stockPriceElm_value comparison plus">')
          .to('<span class="m-stockPriceElm_supplement">')
          .build();
        if (ratio.length > 10) {
          ratio = "--";
        }
      };
      var partMessage = {
        "thumbnailImageUrl": "https://example.com/bot/images/item1.jpg",
        "imageBackgroundColor": "#FFFFFF",
        "title": "",//変更
        "text": "",//変更
        "defaultAction": {
          "type": "uri",
          "label": "View detail",
          "uri": "https://www.nikkei.com/"
        },
        "actions": [
          {
            "type": "uri",
            "label": "マネックス証券",
            "uri": ""
          },
          {
            "type": "uri",
            "label": "バフェット・コード",
            "uri": ""
          },
          {
            "type": "uri",
            "label": "ザイマニ",
            "uri": ""
          }
        ]
      };//partmessage
      partMessage.title = `${arr[index][2]}  (${arr[index][1]})`;
      partMessage.text = `株価 ${current}円（前日差 ${ratio}円）`;
      partMessage.actions[0].uri = `https://monex.ifis.co.jp/index.php?sa=report_theory_dps&bcode=${arr[index][1]}`;
      partMessage.actions[1].uri = `https://www.buffett-code.com/company/${arr[index][1]}`;
      partMessage.actions[2].uri = `https://zaimani.com/financial-analysis-catalog/${arr[index][1]}`;
      message_json.template.columns.push(partMessage);
      
    }
  });

  outputSplitLog(JSON.stringify(message_json,null,2));
  return message_json;
}





function outputSplitLog(text) {
  const LENGTH = 8000;
  for (let i = 0; i <= text.length; i += LENGTH) {
    const fromIndex = i;
    const toIndex = i + LENGTH;
    const subString = text.substring(fromIndex, toIndex);
    Logger.log(subString);

  }
}




function createMessage() {

  //送信する人のLINE_idを取得
  var send_to = LINE_USERLIST.getRange("B2").getValue();

  // var message_list = message();
  // message_list.forEach((message_value,index)=>{
  //   if(index != 0){
  //      var replace_message_value = 
  //     push(message_value,send_to);
  //   }else{
  //     push(message_value,send_to);
  //   }
    
  // })

  return push(message(),send_to);
}