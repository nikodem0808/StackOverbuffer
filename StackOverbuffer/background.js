var NullTags = ['', 'Specify query tags (separated by ";", don\'t use whitespace)', 'None', 'none'];
var defaultquery = {
  query:'What are you looking for?',
  tags:'Specify query tags (separated by ";", don\'t use whitespace)',
  sort:'relevance',
  start:'',
  end:''
};
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    last: defaultquery,
    current: defaultquery,
    queries:[]
  });
});
//
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({
    current: defaultquery
  });
});
chrome.runtime.onMessage.addListener((data) => {
  if (data.header == 'addRecord') {
    chrome.storage.local.get({queries:''}).then((_t)=>{
      if (_t.queries.length >= 20) {
        _t.queries = _t.queries.slice(_t.queries.length - 19);
      }
      if (NullTags.includes(data.queryCarrier.tags)) data.queryCarrier.tags = 'None';
      _t.queries.push({
        query: data.queryCarrier,
        result: data.resultCarrier,
        time: Date.now()
      });
      chrome.storage.local.set({
        queries: _t.queries,
        last: data.queryCarrier
      });
    });
  }
});