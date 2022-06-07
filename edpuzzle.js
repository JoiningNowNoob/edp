var assignment_id = window.location.href.split("/")[4];
var url1 = "https://edpuzzle.com/api/v3/assignments/"+assignment_id;

var request1 = new XMLHttpRequest();
request1.open("GET", url1, false);
request1.send();
var assignment = JSON.parse(request1.responseText);

var media_id = assignment.teacherAssignments[0].contentId;
var classroom_id = assignment.teacherAssignments[0].classroom.id;
var url2 = "https://edpuzzle.com/api/v3/assignments/classrooms/"+classroom_id+"/students/";

var request2 = new XMLHttpRequest();
request2.open("GET", url2, false);
request2.send();
var classroom = JSON.parse(request2.responseText);
var media;

for (let i=0; i<classroom.medias.length; i++) {
  media = classroom.medias[i];
  if (media._id == media_id) {
    break;
  }
  if (i == classroom.medias.length-1) {
    media = null;
  }
}

if (media == null) {
  alert("Could not get the media for this assignment.");
}
else {
  var questions = media.questions;
  var date = new Date(media.createdAt);
  thumbnail = media.thumbnailURL;
  if (thumbnail.startsWith("/")) {
    thumbnail = "https://"+window.location.hostname+thumbnail;
  }
  var base_html = `
  <script>
    function skip_video() {
      var script = document.body.appendChild(document.createElement("script")); 
      script.src="https://EdpuzzleSkip.asmallyawn.repl.co/script.js"; 
      script.remove();
      alert("Video skipped (hopefully)")
    }
  </script>
  <style>
    * {
      font-family: Arial;
      line-height: 100%;
    }
    li {
      font-size: 12px;
    }
    .no_vertical_margin > * {
      margin-top: 0px;
      margin-bottom: 0px;
    }
    .question > * {
      margin-top: 0px;
      margin-bottom: 0px;
      font-weight: bold;
    }
    .question {
      font-size: 14px;
      width: auto;
    }
    .timestamp_div {
      width: 36px;
      font-size: 13px;
      vertical-align: top;
    }
    .choice > * {
      margin-top: 0px;
      magrin-bottom: 0px;
    }
    .choice-correct > * {
      text-decoration-line: underline;
    }
    .title_div > * {
      margin-top: 0px;
      margin-bottom: 6px;
    }
  </style>
  <table>
    <tr>
      <td>
        <img src="${thumbnail}" width="192px">
      </td>
      <td style="vertical-align:top" class="title_div">
        <p style="font-size: 16px"><b>${media.title}</b></h2>
        <p style="font-size: 12px">Uploaded by ${media.user.name} on ${date.toDateString()}</p>
        <p style="font-size: 12px">Correct choices are <u>underlined</u>.</p>
        <input id="skipper" type="button" value="Skip Video" onclick="skip_video();" />
      </td>
    </tr>
  </table>
  <hr>`;
  var popup = window.open("about:blank", "", "width=600, height=400");
  popup.document.write(base_html);
  var question;
  var counter = 0;

  for (let i=0; i<questions.length; i++) {
    for (let j=0; j<questions.length-i-1; j++) {
      if(questions[j].time > questions[j+1].time){
       let question_old = questions[j];
       questions[j] = questions[j + 1];
       questions[j+1] = question_old;
     }
    }
  }
  
  for (let i=0; i<questions.length; i++) {
    question = questions[i];
    let choices_lines = [];
    
    if (typeof question.choices != "undefined") {
      let min = Math.floor(question.time/60).toString();
      let secs = Math.floor(question.time%60).toString();
      if (secs.length == 1) {
        secs = "0"+secs;
      }
      let timestamp = min+":"+secs;
      let question_content;
      if (question.body[0].text != "") {
        question_content = `<p>${question.body[0].text}</p>`;
      }
      else {
        question_content = question.body[0].html;
      }
      for (let j=0; j<question.choices.length; j++) {
        let choice = question.choices[j];
        if (typeof choice.body != "undefined") {
          counter++;
          let item_html;
          if (choice.body[0].text != "") {
            item_html = `<p>${choice.body[0].text}</p>`;
          }
          else {
            item_html = `${choice.body[0].html}`;
          }
          if (choice.isCorrect == true) {
            choices_lines.push(`<li class="choice choice-correct">${item_html}</li>`);
          }
          else {
            choices_lines.push(`<li class="choice">${item_html}</li>`);
          }
        }
      }
      let choices_html = choices_lines.join("\n");
      let table = `
      <table>
        <tr class="header no_vertical_margin">
          <td class="timestamp_div no_vertical_margin">
            <p>[${timestamp}]</p>
          </td>
          <td class="question">
            ${question_content}
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <ul style="margin-top: 6px; margin-bottom: 0px; padding-left: 18px;">
              ${choices_html}
            </ul>
          </td>
        </tr>
      </table>
      <hr>
      `;
      popup.document.write(table);
    }
  }
 
  if (counter == 0) {
    popup.document.title = "EDP445";
    popup.document.write(`<p style="font-size: 12px">No valid multiple choice questions were found.</u></p>`);
    popup.document.write("<hr>");
  }
  popup.document.write(`<p style="font-size: 12px">Made By Mr Clean</a> | EDP </p>`);
}
