var display, query, tags, sort, startDate, endDate;
var table, UI, UI2;
var r;
var NullTags = ['', 'Specify query tags (separated by ";", don\'t use whitespace)', 'None', 'none'];
$.ready.then(()=>{
  display = document.getElementById('display');
  query = document.getElementById('query');
  tags = document.getElementById('tags');
  sort = document.getElementById('sort');
  startDate = document.getElementById('start');
  endDate = document.getElementById('end');
  UI = document.getElementById('UI');
  UI2 = document.getElementById('UI2');
  table = display.contentDocument.getElementById('table');
  //
  UI2.hidden = true;
  //
  chrome.storage.local.get({current:''}).then((data)=>{
    query.value = data.current.query;
    tags.value = data.current.tags;
    sort.value = data.current.sort;
    startDate.value = data.current.start;
    endDate.value = data.current.end;
  });
  //
  document.getElementById('options').addEventListener('click', ()=>{chrome.runtime.openOptionsPage();});
  document.getElementById('repeat').addEventListener('click', ()=>{
    chrome.storage.local.get({last:{}}).then((data)=>{
      query.value = data.last.query;
      tags.value = data.last.tags;
      sort.value = data.last.sort;
      startDate.value = data.last.start;
      endDate.value = data.last.end;
    });
  });
  document.getElementById('back').addEventListener('click', ()=>{
    UI.hidden = false;
    table.innerHTML = `<tr id="tbheader">
    <th class="rquestion">Question</th>
    <th class="rvotes">Votes</th>
    <th class="rlink">Link</th>
  </tr>`;
    $('#main').css('height', '420px');
    UI2.hidden = true;
  });
  document.getElementById('search').addEventListener('click', ()=>{
    // prepare data for display
    var includeTags = !(NullTags.includes(tags.value));
    var parsedStartDateString = Math.floor(Date.parse(startDate.value) / 1000);
    var parsedEndDateString = Math.floor(Date.parse(endDate.value) / 1000);
    //
    if(isNaN(parsedStartDateString)) parsedStartDateString = '';
    else parsedStartDateString = 'fromdate=' + parsedStartDateString + '&';
    if(isNaN(parsedEndDateString)) parsedEndDateString = '';
    else parsedEndDateString = 'todate=' + parsedEndDateString + '&';
    // send request
    fetch(encodeURI(`https://api.stackexchange.com/2.3/search/excerpts?${parsedStartDateString}${parsedEndDateString}order=desc&sort=${sort.value}&q=${query.value}&${(includeTags)?(`tagged=${tags.value}&`):('')}site=stackoverflow&pagesize=5`)).then((data) => {
      data.json().then((jason)=>{
        $('#main').css('height', '320px');
        UI2.hidden = false;
        if(jason.items.length == 0){
          table.innerHTML = 'No Results: ' + ((jason.error_id != undefined)?(`HTTP Error ID: ${jason.error_id}`):('check your input'));
          if (jason.error_id == undefined) jason.error_id = 'Bad Input';
        }
        // send data to background for storage processing
        chrome.runtime.sendMessage({
          header: 'addRecord',
          queryCarrier: {
            query: query.value,
            tags: tags.value,
            sort: sort.value,
            start: startDate.value,
            end: endDate.value
          },
          resultCarrier: jason
        });
        // display result
        UI.hidden = true;
        if(jason.error_id != undefined && jason.error_id != null) {
          console.log('something went wrong ' + jason.error_id);
          return;
        }
        var tab = table.getElementsByTagName('tr');
        for(var k = 0; k < tab.length; k++){
          if (tab[k].getAttribute('id') != 'tbheader') tab[k--].remove();
        }
        var counter = 0;
        jason.items.forEach((i) => {
          table.innerHTML += `<tr id="${++counter}">
            <td class="rquestion">${i.title}</td>
            <td class="rvotes">${i.score}</td>
            <td class="rlink"><a class="link" target="blank" href="${i.link}">Open</a></td>
          </tr>`;
        });
      });
    }).catch((e) => {
      console.table(e);
      document.innerHTML = 'Error, check popup console';
    });
  });
  //
  addEventListener('input', TempSaveState);
});
//
function TempSaveState(){
  chrome.storage.local.set({
    current:{
      query: query.value,
      tags: tags.value,
      sort: sort.value,
      start: startDate.value,
      end: endDate.value
    }
  });
}