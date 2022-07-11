
//実際にメッセージを送信する関数を作成します。
function push(message_json,to) {
  var url = "https://api.line.me/v2/bot/message/push";
  var headers = {
    "Content-Type" : "application/json; charset=UTF-8",
    'Authorization': 'Bearer ' + CHANNEL_TOKEN,
  };

  //toのところにメッセージを送信したいユーザーのIDを指定します。(toは最初の方で自分のIDを指定したので、linebotから自分に送信されることになります。)
  //textの部分は、送信されるメッセージが入ります。createMessageという関数で定義したメッセージがここに入ります。
  var postData = {
    "to" : to,
    // "messages" : [
    //   {
    //     'type':'text',
    //     'text': "ごめん、みすったんご",
    //   }
    // ]
    "messages":[message_json]
  };

  var options = {
    "method" : "post",
    "headers" : headers,
    "payload" : JSON.stringify(postData)
  };

  return UrlFetchApp.fetch(url, options);
}


//https://qiita.com/n_oshiumi/items/a1a02e03093825f41e01
//参考文献