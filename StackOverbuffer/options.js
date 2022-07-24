function UnpackSortType(arg){
    switch(arg){
        case 'votes':
            return 'Votes';
        case 'activity':
            return 'Activity';
        case 'creation':
            return 'Creation Date';
        case 'relevance':
            return 'Relevance';
        default:
            return undefined;
    }
}
var table;
var deleteBtn, warnBtn;
$.ready.then(()=>{
    deleteBtn = document.getElementById('delete');
    deleteBtn.addEventListener('click', ()=>{
        warnBtn.hidden = false;
    });
    warnBtn = document.getElementById('sure');
    warnBtn.addEventListener('click', ()=>{
        chrome.storage.local.set({queries:[]});
        document.location.reload();
    });
    warnBtn.hidden = true;
    //
    table = document.getElementById('table');
    chrome.storage.local.get({queries:''}).then((data)=>{
        var list = data.queries;
        var counter = 0;
        list.reverse().forEach((i)=>{
            var innerTableHTML = "";
            if (i.result.error_id == 'bad_input'){
                innerTableHTML = "<h2>[bad input]</h2>";
            }
            else if(i.result.error_id != undefined){
                innerTableHTML = "<h2>[error]</h2>";
            }
            else{
                i.result.items.forEach((item)=>{
                    innerTableHTML += `<tr>
                        <td class="ititle">${item.title}</td>
                        <td class="ivotes">${item.score} Votes</td>
                        <td class="iauthor">By ${item.owner.display_name}</td>
                        <td class="itagged">${item.tags.join(';')}</td>
                        <td class="idate"><span class="datetime">${(new Date(item.creation_date * 1000)).toLocaleString()}</span></td>
                        <td class="ilink"><a href="https://www.stackoverflow.com/questions/${item.question_id}" target="blank">Question ${item.question_id}</a></td>
                    </tr>`;
                });
            }
            table.innerHTML += `<tr id=${++counter} class="innertr">
                <td class="itime"><span class="datetime">${(new Date(i.time)).toLocaleString()}</span></td>
                <td class="iquery">${i.query.query}</td>
                <td class="itags">${i.query.tags}</td>
                <td class="idatespan">From <span class="datetime">${i.query.start.replaceAll('T', ' ')}</span><br>To <span class="datetime">${i.query.end.replaceAll('T', ' ')}</span></td>
                <td class="isort">${UnpackSortType(i.query.sort)}</td>
                <td class="innerTableContainer"><table class="innerTable" cellspacing="0">${innerTableHTML}</table></td>
            </tr>`;
        });
    });
});