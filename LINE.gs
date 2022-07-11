
function doPost(e){
  
  let json = JSON.parse(e.postData.contents);

  SETTINGS.getRange("C8").setValue(JSON.stringify(json, null, 2));
  

  if(json.events[0].type == "follow"){
    SETTINGS.getRange("C12").setValue("follow");
    follow(json);

  }else if(json.events[0].type == "message"){
    SETTINGS.getRange("C13").setValue("text");
    if(json.events[0].message.text == "取得"){
      SETTINGS.getRange("C14").setValue("取得");
      push(message(),json.events[0].source.userId);
    }
  }
  
  
  

// console.log(JSON.stringify(json, null, 2));

 
function getUserName(userId) {
  SETTINGS.getRange("C9").setValue("get User name");
  const url = "https://api.line.me/v2/bot/profile/" + userId;
  const response = UrlFetchApp.fetch(url, {
              "headers" : {
              "Authorization" : "Bearer " + CHANNEL_TOKEN
              }
  });
  return JSON.parse(response.getContentText()).displayName;
}
function follow(json){
  let userId = json.events[0].source.userId;
  let groupId = json.events[0].source.groupId;

  let row = LINE_USERLIST.getLastRow();
 
  LINE_USERLIST.getRange(row + 1,1).setValue(getUserName(userId));
  LINE_USERLIST.getRange(row + 1,2).setValue(userId);
  LINE_USERLIST.getRange(row + 1,3).setValue(groupId);
}  
}


